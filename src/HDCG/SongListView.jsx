import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, writeBatch } from "firebase/firestore";

const SongListView = ({ collection: colInfo, onSelectSong, onBack, currentUser }) => {
  const [songs, setSongs] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newSongTitle, setNewSongTitle] = useState("");
  const [hasOrderChanged, setHasOrderChanged] = useState(false); // Check xem có thay đổi thứ tự ko

  // --- 1. FETCH DATA & SORT ---
  const fetchSongs = async () => {
    const q = query(collection(db, "hdcg_official_songs"), where("collectionId", "==", colInfo.id));
    const snapshot = await getDocs(q);
    
    let loadedSongs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    // Sắp xếp: Ưu tiên theo trường 'order', nếu không có thì theo thời gian tạo
    loadedSongs.sort((a, b) => {
        const orderA = a.order !== undefined ? a.order : 9999;
        const orderB = b.order !== undefined ? b.order : 9999;
        
        // Nếu cùng thứ tự (hoặc chưa có order) thì xếp theo ngày tạo
        if (orderA === orderB) return a.createdAt - b.createdAt;
        return orderA - orderB;
    });

    setSongs(loadedSongs);
    setHasOrderChanged(false);
  };

  useEffect(() => { fetchSongs(); }, [colInfo]);

  // --- 2. TẠO BÀI HÁT MỚI ---
  const handleCreateSong = async () => {
    if (!newSongTitle.trim()) return;
    try {
      const newSong = {
        title: newSongTitle, 
        collectionId: colInfo.id, 
        author: currentUser.name,
        masterContent: "", 
        instruments: {}, 
        createdAt: new Date().getTime(),
        order: songs.length + 1 // Mặc định nằm cuối
      };
      const docRef = await addDoc(collection(db, "hdcg_official_songs"), newSong);
      
      onSelectSong({ id: docRef.id, ...newSong });
    } catch(e) { alert("Lỗi tạo bài: " + e.message); }
  };

  // --- 3. XÓA BÀI HÁT ---
  const handleDeleteSong = async (e, id) => {
    e.stopPropagation();
    if(!window.confirm("Xóa bài hát này vĩnh viễn?")) return;
    await deleteDoc(doc(db, "hdcg_official_songs", id));
    fetchSongs();
  }

  // --- 4. LOGIC ĐỔI THỨ TỰ (LOCAL) ---
  const moveSong = (e, index, direction) => {
    e.stopPropagation(); // Chặn click vào bài hát
    const newSongs = [...songs];

    if (direction === 'up') {
        if (index === 0) return;
        [newSongs[index], newSongs[index - 1]] = [newSongs[index - 1], newSongs[index]];
    } else {
        if (index === newSongs.length - 1) return;
        [newSongs[index], newSongs[index + 1]] = [newSongs[index + 1], newSongs[index]];
    }

    setSongs(newSongs);
    setHasOrderChanged(true);
  };

  // --- 5. LƯU THỨ TỰ LÊN FIREBASE (BATCH UPDATE) ---
  const handleSaveOrder = async () => {
      try {
          const batch = writeBatch(db);
          
          songs.forEach((song, index) => {
              const songRef = doc(db, "hdcg_official_songs", song.id);
              // Cập nhật trường 'order' bằng index mới
              batch.update(songRef, { order: index });
          });

          await batch.commit();
          setHasOrderChanged(false);
          alert("✅ Đã cập nhật thứ tự Album!");
      } catch (error) {
          console.error(error);
          alert("Lỗi lưu thứ tự!");
      }
  }

  // --- RENDER ---
  return (
    <div className="song-list-view">
      <div className="nav-header">
         <button onClick={onBack} className="btn-back-link">← Album: {colInfo.title}</button>
      </div>

      <div className="action-bar" style={{flexWrap: 'wrap', gap: 10}}>
         <h3 style={{margin:0}}>🎵 Danh sách bài hát</h3>
         <div style={{display:'flex', gap: 10}}>
             {/* Nút Lưu Thứ Tự chỉ hiện khi có thay đổi */}
             {hasOrderChanged && (
                 <button onClick={handleSaveOrder} className="btn-save-order">
                     💾 Lưu thứ tự
                 </button>
             )}
             <button onClick={() => setIsCreating(true)} className="btn-add-song">+ Thêm Bài</button>
         </div>
      </div>

      {isCreating && (
        <div className="quick-create-box">
           <input value={newSongTitle} onChange={e => setNewSongTitle(e.target.value)} placeholder="Tên bài hát mới..." autoFocus />
           <button onClick={handleCreateSong} className="btn-go">Tạo & Sửa</button>
           <button onClick={() => setIsCreating(false)} className="btn-close">❌</button>
        </div>
      )}

      <div className="list-songs">
        {songs.map((song, index) => (
          <div key={song.id} onClick={() => onSelectSong(song)} className="song-row-item">
             
             {/* Cụm nút điều khiển thứ tự */}
             <div className="order-controls">
                <button 
                    className="btn-move" 
                    onClick={(e) => moveSong(e, index, 'up')} 
                    disabled={index === 0}
                >▲</button>
                <button 
                    className="btn-move" 
                    onClick={(e) => moveSong(e, index, 'down')} 
                    disabled={index === songs.length - 1}
                >▼</button>
             </div>

             <div className="song-index">{index + 1}.</div>

             <div className="song-info">
                <span className="song-name">{song.title}</span>
                <span className="song-author">👤 {song.author}</span>
             </div>
             
             <button className="btn-del-song" onClick={(e) => handleDeleteSong(e, song.id)}>🗑</button>
          </div>
        ))}
        {songs.length === 0 && <div className="empty-state">Chưa có bài hát nào.</div>}
      </div>

      <style>{`
        .song-list-view { padding: 10px; max-width: 800px; margin: 0 auto; }
        .btn-back-link { background: none; border: none; color: #666; font-size: 0.9rem; cursor: pointer; margin-bottom: 15px; padding: 0; }
        
        .action-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .btn-add-song { background: var(--primary-color); color: white; border: none; padding: 8px 15px; border-radius: 20px; font-weight: bold; cursor: pointer; }
        
        /* Button Lưu Thứ Tự - Hiệu ứng rung nhẹ gây chú ý */
        .btn-save-order { 
            background: #28a745; color: white; border: none; padding: 8px 15px; border-radius: 20px; font-weight: bold; cursor: pointer; 
            animation: pulse 1.5s infinite;
        }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }

        .quick-create-box { display: flex; gap: 5px; margin-bottom: 20px; background: #f1f1f1; padding: 10px; border-radius: 8px; }
        .quick-create-box input { flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
        .btn-go { background: #28a745; color: white; border: none; padding: 0 15px; border-radius: 4px; }
        .btn-close { background: none; border: none; cursor: pointer; }

        .list-songs { display: flex; flex-direction: column; gap: 8px; }
        .song-row-item { 
           display: flex; align-items: center;
           background: white; padding: 10px 15px; border-radius: 8px; border: 1px solid #eee;
           cursor: pointer; transition: 0.2s;
        }
        .song-row-item:active { background: #f9f9f9; transform: scale(0.98); }
        
        /* Order Controls */
        .order-controls { display: flex; flex-direction: column; gap: 2px; margin-right: 10px; }
        .btn-move { 
            width: 24px; height: 20px; border: none; background: #f0f0f0; color: #666; border-radius: 4px; font-size: 0.6rem; cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .btn-move:hover:not(:disabled) { background: #ccc; }
        .btn-move:disabled { opacity: 0; pointer-events: none; }

        .song-index { font-weight: bold; color: #999; margin-right: 10px; min-width: 20px; }
        
        .song-info { flex: 1; display: flex; flex-direction: column; }
        .song-name { font-weight: bold; font-size: 1.1rem; color: #333; }
        .song-author { font-size: 0.8rem; color: #888; margin-top: 2px; }
        
        .btn-del-song { background: none; border: none; padding: 10px; font-size: 1.1rem; color: #ff6b6b; opacity: 0.3; transition: 0.2s; }
        .btn-del-song:hover { opacity: 1; color: red; }
        
        .empty-state { text-align: center; color: #999; padding: 30px; border: 2px dashed #eee; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default SongListView;