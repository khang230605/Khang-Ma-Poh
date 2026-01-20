import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { 
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy 
} from "firebase/firestore";

const SetlistManager = ({ currentUser, allSongs, onSelectSong }) => {
  const [setlists, setSetlists] = useState([]);
  const [currentSetlist, setCurrentSetlist] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [searchSongTerm, setSearchSongTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  // State theo dõi thay đổi chưa lưu
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load danh sách dựa trên quyền hạn của User
  useEffect(() => { 
    fetchSetlists(); 
  }, [currentUser]);

  const fetchSetlists = async () => {
    if (!currentUser) return;
    setSetlists([]);
    let mergedLists = [];

    try {
      // 1. Luôn lấy Setlist Public (setlists)
      const publicQ = query(collection(db, "setlists"), orderBy("createdAt", "desc"));
      const publicSnap = await getDocs(publicQ);
      const publicData = publicSnap.docs.map(doc => ({ 
        id: doc.id, ...doc.data(), _source: 'setlists' 
      }));
      mergedLists = [...publicData];

      // 2. Nếu là HDCG Member hoặc Admin -> Lấy thêm Setlist HDCG
      if (currentUser.role === 'hdcg_member' || currentUser.role === 'admin') {
        const hdcgQ = query(collection(db, "hdcg_setlists"), orderBy("createdAt", "desc"));
        const hdcgSnap = await getDocs(hdcgQ);
        const hdcgData = hdcgSnap.docs.map(doc => ({ 
          id: doc.id, ...doc.data(), _source: 'hdcg_setlists' 
        }));
        
        mergedLists = [...mergedLists, ...hdcgData];
      }

      // 3. Sắp xếp lại tổng thể theo thời gian mới nhất
      mergedLists.sort((a, b) => b.createdAt - a.createdAt);
      setSetlists(mergedLists);

    } catch (e) { console.error("Lỗi lấy setlist:", e); }
  };

  const handleCreateSetlist = async () => {
    if (!newTitle.trim()) return;
    
    // Quyết định nơi lưu Setlist mới dựa trên Role
    const targetCollection = (currentUser.role === 'hdcg_member' || currentUser.role === 'admin') 
                              ? "hdcg_setlists" 
                              : "setlists";

    try {
      await addDoc(collection(db, targetCollection), {
        title: newTitle, createdAt: new Date().getTime(), songs: [] 
      });
      setNewTitle(""); setIsCreating(false); fetchSetlists();
    } catch (e) { alert("Lỗi tạo setlist"); }
  };

  const handleDeleteSetlist = async (list, e) => {
    e.stopPropagation();
    if (!window.confirm("Xóa danh sách này?")) return;
    
    // Xóa đúng collection nguồn dựa vào _source
    const targetCollection = list._source || "setlists";

    try {
      await deleteDoc(doc(db, targetCollection, list.id));
      fetchSetlists();
      if (currentSetlist?.id === list.id) setCurrentSetlist(null);
    } catch (e) { alert("Lỗi xóa"); }
  };

  // --- CÁC HÀM THAO TÁC LOCAL (CHƯA GỌI FIREBASE) ---

  const addSongToSetlist = (song) => {
    if (!currentSetlist) return;
    const updatedSongs = [...currentSetlist.songs, {
      id: song.id, title: song.title, author: song.author, key: song.key || 'C'
    }];
    
    setCurrentSetlist({ ...currentSetlist, songs: updatedSongs });
    setSearchSongTerm(""); 
    setShowSearchResults(false);
    setHasUnsavedChanges(true);
  };

  const removeSongFromSetlist = (indexToRemove) => {
    if (!currentSetlist) return;
    const updatedSongs = currentSetlist.songs.filter((_, index) => index !== indexToRemove);
    
    setCurrentSetlist({ ...currentSetlist, songs: updatedSongs });
    setHasUnsavedChanges(true);
  };

  const moveSong = (index, direction) => {
    if (!currentSetlist) return;
    const newSongs = [...currentSetlist.songs];

    if (direction === 'up') {
      if (index === 0) return;
      [newSongs[index], newSongs[index - 1]] = [newSongs[index - 1], newSongs[index]];
    } else {
      if (index === newSongs.length - 1) return;
      [newSongs[index], newSongs[index + 1]] = [newSongs[index + 1], newSongs[index]];
    }

    setCurrentSetlist({ ...currentSetlist, songs: newSongs });
    setHasUnsavedChanges(true);
  };

  // --- HÀM LƯU THAY ĐỔI LÊN FIREBASE ---
  const saveChanges = async () => {
    if (!currentSetlist) return;
    
    // Xác định collection cần update dựa vào _source đã đánh dấu lúc fetch
    // Nếu tạo mới chưa có _source thì fallback về logic role (tương tự lúc tạo)
    const targetCollection = currentSetlist._source || 
                             ((currentUser.role === 'hdcg_member' || currentUser.role === 'admin') ? "hdcg_setlists" : "setlists");

    try {
      const setlistRef = doc(db, targetCollection, currentSetlist.id);
      await updateDoc(setlistRef, { songs: currentSetlist.songs });
      
      setHasUnsavedChanges(false);
      alert("Đã lưu danh sách thành công! ✅");
      fetchSetlists(); // Refresh lại data bên ngoài để đảm bảo đồng bộ
    } catch (e) {
      console.error(e);
      alert("Lỗi khi lưu dữ liệu!");
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm("Bạn có thay đổi chưa lưu! Bạn có chắc muốn thoát không?")) return;
    }
    setCurrentSetlist(null);
    setHasUnsavedChanges(false);
  };

  const filteredAddSongs = allSongs.filter(s => 
    s.title.toLowerCase().includes(searchSongTerm.toLowerCase())
  );

  return (
    <div className="setlist-container fade-in">
      <div className="setlist-header">
        {currentSetlist ? (
          <button className="btn-back-small" onClick={handleBack}>← Quay lại</button>
        ) : (
          <h2>📋 Danh sách nhạc (Setlist)</h2>
        )}
      </div>

      {!currentSetlist && (
        <>
          <div className="create-box">
            {isCreating ? (
              <div className="input-group-row">
                <input autoFocus placeholder="Tên danh sách..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                <button className="btn-save-small" onClick={handleCreateSetlist}>Tạo</button>
                <button className="btn-cancel-small" onClick={() => setIsCreating(false)}>Hủy</button>
              </div>
            ) : (
              <button className="btn-create-list" onClick={() => setIsCreating(true)}>+ Tạo danh sách mới</button>
            )}
          </div>
          <div className="setlist-grid">
            {setlists.map(list => (
              <div key={list.id} className="setlist-card" onClick={() => setCurrentSetlist(list)}>
                <div className="card-top">
                  <h3>
                    {list.title}
                    {/* Badge hiển thị nguồn nếu là admin/hdcg */}
                    {list._source === 'hdcg_setlists' && (
                       <span style={{fontSize:'0.6rem', background:'green', color:'white', padding:'2px 5px', borderRadius:'4px', marginLeft:'5px', verticalAlign:'middle'}}>PRIVATE</span>
                    )}
                  </h3>
                  {/* Truyền cả object list để xóa đúng nguồn */}
                  <button className="btn-delete-icon" onClick={(e) => handleDeleteSetlist(list, e)}>×</button>
                </div>
                <p>{list.songs?.length || 0} bài hát</p>
                <small>{new Date(list.createdAt).toLocaleDateString('vi-VN')}</small>
              </div>
            ))}
            {setlists.length === 0 && <p style={{color: '#999', marginTop: 20}}>Chưa có danh sách nào.</p>}
          </div>
        </>
      )}

      {currentSetlist && (
        <div className="setlist-detail">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
             <h1 style={{color: 'var(--primary-color)', margin: 0}}>{currentSetlist.title}</h1>
             
             <button 
                className={`btn-save-changes ${hasUnsavedChanges ? 'unsaved' : ''}`}
                onClick={saveChanges}
                disabled={!hasUnsavedChanges}
             >
                {hasUnsavedChanges ? "💾 Lưu thay đổi *" : "✅ Đã đồng bộ"}
             </button>
          </div>
          
          <div className="add-song-box">
             <input placeholder="🔍 Tìm bài hát để thêm vào..." value={searchSongTerm} onChange={(e) => { setSearchSongTerm(e.target.value); setShowSearchResults(e.target.value.length > 0); }} />
             {showSearchResults && (
               <div className="search-dropdown">
                 {filteredAddSongs.length > 0 ? (
                   filteredAddSongs.map(song => (
                     <div key={song.id} className="dropdown-item" onClick={() => addSongToSetlist(song)}>
                        <strong>{song.title}</strong> - {song.author}
                     </div>
                   ))
                 ) : (<div className="dropdown-item">Không tìm thấy bài hát...</div>)}
               </div>
             )}
          </div>

          <div className="songs-in-list">
            {currentSetlist.songs && currentSetlist.songs.length > 0 ? (
              currentSetlist.songs.map((song, index) => (
                <div key={index} className="song-row">
                  <div className="song-controls">
                    <button className="btn-move" onClick={(e) => {e.stopPropagation(); moveSong(index, 'up')}} disabled={index === 0}>▲</button>
                    <button className="btn-move" onClick={(e) => {e.stopPropagation(); moveSong(index, 'down')}} disabled={index === currentSetlist.songs.length - 1}>▼</button>
                  </div>
                  
                  <div className="song-order-num" style={{color: '#999', fontWeight: 'bold', marginRight: '10px', minWidth: '20px'}}>{index + 1}.</div>

                  <div className="song-info" onClick={() => onSelectSong(song)}>
                     <div className="song-title">{song.title}</div>
                     <div className="song-key">Key: {song.key}</div>
                  </div>
                  <button className="btn-remove-song" onClick={() => removeSongFromSetlist(index)}>🗑</button>
                </div>
              ))
            ) : (<div className="empty-state">Chưa có bài hát nào.</div>)}
          </div>
        </div>
      )}

      <style>{`
        .setlist-container { padding: 10px; }
        .create-box { margin-bottom: 20px; }
        .input-group-row { display: flex; gap: 10px; }
        .input-group-row input { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 8px; }
        .btn-create-list { background: var(--primary-color); color: white; padding: 12px 20px; border-radius: 30px; border: none; font-weight: bold; width: 100%; box-shadow: 0 4px 10px rgba(215, 25, 32, 0.3); }
        .btn-save-small { background: #28a745; color: white; border: none; padding: 0 20px; border-radius: 8px; }
        .btn-cancel-small { background: #ddd; color: #333; border: none; padding: 0 15px; border-radius: 8px; }
        .setlist-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; }
        .setlist-card { background: white; padding: 20px; border-radius: 12px; border: 1px solid #eee; cursor: pointer; transition: 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .setlist-card:hover { transform: translateY(-3px); border-color: var(--primary-color); }
        .card-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .card-top h3 { margin: 0 0 5px 0; font-size: 1.2rem; }
        .btn-delete-icon { background: none; border: none; color: #999; font-size: 1.5rem; line-height: 0.5; padding: 0; }
        .btn-delete-icon:hover { color: red; }
        .btn-back-small { background: none; border: none; color: #666; font-weight: bold; margin-bottom: 10px; padding: 0; }
        .add-song-box { position: relative; margin-bottom: 20px; }
        .add-song-box input { width: 100%; padding: 12px; border: 2px solid #eee; border-radius: 8px; box-sizing: border-box; }
        .add-song-box input:focus { border-color: var(--primary-color); outline: none; }
        .search-dropdown { position: absolute; top: 100%; left: 0; width: 100%; background: white; border: 1px solid #ddd; border-radius: 8px; max-height: 200px; overflow-y: auto; z-index: 10; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .dropdown-item { padding: 10px 15px; border-bottom: 1px solid #eee; cursor: pointer; }
        .dropdown-item:hover { background: #f9f9f9; color: var(--primary-color); }
        .song-row { display: flex; align-items: center; background: white; padding: 8px 12px; margin-bottom: 8px; border-radius: 8px; border: 1px solid #eee; }
        .song-info { flex: 1; cursor: pointer; }
        .song-title { font-weight: bold; font-size: 1.1rem; }
        .song-key { font-size: 0.85rem; color: #666; background: #f0f0f0; display: inline-block; padding: 2px 6px; border-radius: 4px; margin-top: 4px; }
        .btn-remove-song { background: none; border: none; color: #ff4d4d; font-size: 1.2rem; padding: 0 10px; }
        .empty-state { text-align: center; color: #999; padding: 40px 0; border: 2px dashed #eee; border-radius: 12px; }
        .song-controls { display: flex; flex-direction: column; margin-right: 10px; gap: 2px; }
        .btn-move { background: #f0f0f0; border: none; color: #666; font-size: 0.6rem; cursor: pointer; width: 24px; height: 20px; border-radius: 4px; display: flex; align-items: center; justify-content: center; padding: 0; }
        .btn-move:hover:not(:disabled) { background: var(--primary-color); color: white; }
        .btn-move:disabled { opacity: 0; cursor: default; }
        
        /* Button Save Changes */
        .btn-save-changes {
           padding: 8px 16px; border-radius: 20px; border: 1px solid #ddd;
           background: #f8f9fa; color: #666; font-weight: bold; cursor: default;
           transition: 0.3s;
        }
        .btn-save-changes.unsaved {
           background: var(--primary-color); color: white; border-color: var(--primary-color);
           cursor: pointer; box-shadow: 0 4px 10px rgba(215, 25, 32, 0.4);
           animation: pulse 2s infinite;
        }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default SetlistManager;