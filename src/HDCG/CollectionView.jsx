// src/HDCG/CollectionView.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";

const CollectionView = ({ onSelect, currentUser }) => {
  const [collections, setCollections] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newColName, setNewColName] = useState("");

  const fetchCollections = async () => {
    const q = query(collection(db, "hdcg_collections"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    setCollections(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { fetchCollections(); }, []);

  const handleCreate = async () => {
    if (!newColName.trim()) return;
    await addDoc(collection(db, "hdcg_collections"), {
      title: newColName, createdAt: new Date().getTime(), createdBy: currentUser.name
    });
    setNewColName(""); setIsCreating(false); fetchCollections();
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Chặn sự kiện click vào album
    if(!window.confirm("Xóa Album này? Toàn bộ bài hát bên trong sẽ mất liên kết.")) return;
    await deleteDoc(doc(db, "hdcg_collections", id));
    fetchCollections();
  };

  return (
    <div className="collection-view">
      <div className="header-actions">
        <h3>📂 Danh sách</h3>
        <button className="btn-create" onClick={() => setIsCreating(true)}>+ Tạo Mới</button>
      </div>

      {isCreating && (
        <div className="create-form">
          <input value={newColName} onChange={e => setNewColName(e.target.value)} placeholder="Tên Album..." autoFocus />
          <div className="form-btns">
             <button onClick={handleCreate} className="btn-save">Lưu</button>
             <button onClick={() => setIsCreating(false)} className="btn-cancel">Hủy</button>
          </div>
        </div>
      )}

      <div className="grid-collections">
        {collections.map(col => (
          <div key={col.id} onClick={() => onSelect(col)} className="col-card">
            <div className="col-icon">💿</div>
            <div className="col-info">
                <strong>{col.title}</strong>
                <small>{new Date(col.createdAt).toLocaleDateString('vi-VN')}</small>
            </div>
            {/* Nút xóa chỉ hiện cho Admin/Chủ sở hữu */}
            <button className="btn-delete" onClick={(e) => handleDelete(e, col.id)}>×</button>
          </div>
        ))}
      </div>

      <style>{`
        .collection-view { padding: 10px; }
        .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .btn-create { background: #28a745; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; }
        
        .create-form { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap; }
        .create-form input { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; min-width: 200px; }
        .form-btns button { padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; margin-left: 5px; }
        .btn-save { background: #007bff; color: white; }
        .btn-cancel { background: #ddd; }

        .grid-collections { 
           display: grid; 
           grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); /* Responsive Grid */
           gap: 15px; 
        }
        .col-card { 
           position: relative;
           background: white; border: 1px solid #eee; border-radius: 12px; padding: 15px;
           text-align: center; cursor: pointer; transition: 0.2s;
           box-shadow: 0 2px 5px rgba(0,0,0,0.05);
           display: flex; flex-direction: column; align-items: center; justify-content: center;
           min-height: 140px;
        }
        .col-card:hover { transform: translateY(-3px); border-color: var(--primary-color); }
        .col-icon { fontSize: 2.5rem; margin-bottom: 10px; }
        .col-info strong { display: block; font-size: 0.95rem; margin-bottom: 5px; line-height: 1.3; }
        .col-info small { color: #888; font-size: 0.75rem; }
        .btn-delete { 
           position: absolute; top: 5px; right: 5px; 
           background: none; border: none; color: #ccc; font-size: 1.5rem; line-height: 1; cursor: pointer;
        }
        .btn-delete:hover { color: red; }
      `}</style>
    </div>
  );
};

export default CollectionView;