// src/HDCG/SongListView.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";

const SongListView = ({ collection: colInfo, onSelectSong, onBack, currentUser }) => {
  const [songs, setSongs] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newSongTitle, setNewSongTitle] = useState("");

  const fetchSongs = async () => {
    const q = query(collection(db, "hdcg_official_songs"), where("collectionId", "==", colInfo.id));
    const snapshot = await getDocs(q);
    setSongs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { fetchSongs(); }, [colInfo]);

  const handleCreateSong = async () => {
    if (!newSongTitle.trim()) return;
    try {
      const newSong = {
        title: newSongTitle, collectionId: colInfo.id, author: currentUser.name,
        masterContent: "", instruments: {}, createdAt: new Date().getTime()
      };
      const docRef = await addDoc(collection(db, "hdcg_official_songs"), newSong);
      
      // Tạo xong chuyển ngay sang trang Detail
      onSelectSong({ id: docRef.id, ...newSong });
    } catch(e) { alert("Lỗi tạo bài: " + e.message); }
  };

  const handleDeleteSong = async (e, id) => {
    e.stopPropagation();
    if(!window.confirm("Xóa bài hát này vĩnh viễn?")) return;
    await deleteDoc(doc(db, "hdcg_official_songs", id));
    fetchSongs();
  }

  return (
    <div className="song-list-view">
      <div className="nav-header">
         <button onClick={onBack} className="btn-back-link">← Album: {colInfo.title}</button>
      </div>

      <div className="action-bar">
         <h3>🎵 Danh sách bài hát</h3>
         <button onClick={() => setIsCreating(true)} className="btn-add-song">+ Thêm Bài</button>
      </div>

      {isCreating && (
        <div className="quick-create-box">
           <input value={newSongTitle} onChange={e => setNewSongTitle(e.target.value)} placeholder="Tên bài hát mới..." autoFocus />
           <button onClick={handleCreateSong} className="btn-go">Tạo & Sửa</button>
           <button onClick={() => setIsCreating(false)} className="btn-close">❌</button>
        </div>
      )}

      <div className="list-songs">
        {songs.map(song => (
          <div key={song.id} onClick={() => onSelectSong(song)} className="song-row-item">
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
        .song-list-view { padding: 10px; }
        .btn-back-link { background: none; border: none; color: #666; font-size: 0.9rem; cursor: pointer; margin-bottom: 15px; padding: 0; }
        .action-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .btn-add-song { background: var(--primary-color); color: white; border: none; padding: 8px 15px; border-radius: 20px; font-weight: bold; }
        
        .quick-create-box { display: flex; gap: 5px; margin-bottom: 20px; background: #f1f1f1; padding: 10px; border-radius: 8px; }
        .quick-create-box input { flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
        .btn-go { background: #28a745; color: white; border: none; padding: 0 15px; border-radius: 4px; }
        .btn-close { background: none; border: none; cursor: pointer; }

        .list-songs { display: flex; flex-direction: column; gap: 10px; }
        .song-row-item { 
           display: flex; justify-content: space-between; align-items: center;
           background: white; padding: 15px; border-radius: 8px; border: 1px solid #eee;
           cursor: pointer; transition: 0.2s;
        }
        .song-row-item:active { background: #f9f9f9; }
        .song-info { display: flex; flex-direction: column; }
        .song-name { font-weight: bold; font-size: 1.1rem; color: #333; }
        .song-author { font-size: 0.8rem; color: #888; margin-top: 3px; }
        .btn-del-song { background: none; border: none; padding: 10px; font-size: 1.1rem; color: #ff6b6b; opacity: 0.5; }
        .btn-del-song:hover { opacity: 1; }
        .empty-state { text-align: center; color: #999; padding: 30px; border: 2px dashed #eee; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default SongListView;