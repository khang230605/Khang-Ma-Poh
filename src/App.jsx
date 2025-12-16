import React, { useState, useEffect } from 'react';
import './App.css';
import myLogo from './assets/logo.png';
// Import Firebase
import { db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";
import { doc, updateDoc } from "firebase/firestore";
// Import LoginGuard
import LoginGuard from './LoginGuard';  


// Dữ liệu mẫu (Sau này sẽ lấy từ Database)
const initialSongs = [
  {
    id: 1,
    title: "Có những tiếng hát",
    author: "Phan Mạnh Quỳnh",
    postedBy: "Khang Ma Poh",
    updatedAt: "15/12/2025",
    content: "[C]Có những tiếng hát tôi muốn [D]đem cho đời \nMà làn [F]môi không nên [C]lời"
  },
  {
    id: 2,
    title: "Ngày mai em đi",
    author: "Thái Thịnh",
    postedBy: "Khang Ma Poh",
    updatedAt: "14/12/2025",
    content: "[Am]Ngày mai em [Dm]đi, biển [G]nhớ tên em gọi [C]về"
  }
];

function App() {
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState(null); // Lưu thông tin bài hát đang được chọn để sửa

  // 1. Hàm lấy danh sách bài hát từ Firebase
  const fetchSongs = async () => {
    const q = query(collection(db, "songs"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setSongs(data);
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  // 2. Hàm lưu (Xử lý cả Tạo mới và Chỉnh sửa)
  const handleSave = async (songFormContent) => {
    try {
      if (editingData) {
        // Trường hợp: ĐANG CHỈNH SỬA
        const songRef = doc(db, "songs", editingData.id);
        await updateDoc(songRef, {
          ...songFormContent,
          updatedAt: new Date().toLocaleDateString('vi-VN')
        });
      } else {
        // Trường hợp: TẠO MỚI
        await addDoc(collection(db, "songs"), {
          ...songFormContent,
          postedBy: "Khang Ma Poh",
          createdAt: new Date().getTime(),
          updatedAt: new Date().toLocaleDateString('vi-VN')
        });
      }

      await fetchSongs(); // Tải lại danh sách mới nhất
      setIsEditing(false); // Đóng form editor
      setEditingData(null); // Reset trạng thái sửa
      setSelectedSong(null); // Quay về trang chủ
    } catch (e) {
      console.error("Lỗi khi lưu dữ liệu: ", e);
      alert("Có lỗi xảy ra khi lưu bài hát!");
    }
  };

  // 3. Hàm kích hoạt chế độ chỉnh sửa
  const startEditing = (song) => {
    setEditingData(song);
    setIsEditing(true);
  };

  return (
  <LoginGuard>
  <div className="container">
    {/* Nội dung App hiện tại của bạn nằm hết ở đây */}
    <div className="container">
      <header>
        {/* Thay thế h1 bằng một thẻ div hoặc span chứa ảnh logo */}
        <div 
          className="logo-container"
          onClick={() => { setSelectedSong(null); setIsEditing(false); setEditingData(null); }} 
          style={{ cursor: 'pointer' }}
        >
          <img src={myLogo} alt="Khang Ma Poh Logo" className="app-logo" />
        </div>
        
        {!isEditing && !selectedSong && (
          <button className="btn-create" onClick={() => setIsEditing(true)}>
            + Tạo bài hát
          </button>
        )}
      </header>

      <hr />

      {/* Logic hiển thị các trang */}
      {isEditing ? (
        <SongEditor 
          onSave={handleSave} 
          onCancel={() => { setIsEditing(false); setEditingData(null); }} 
          initialData={editingData} // Truyền dữ liệu cũ vào để Editor hiển thị lại
        />
      ) : selectedSong ? (
        <SongDetail 
          song={selectedSong} 
          onBack={() => setSelectedSong(null)} 
          onEdit={startEditing} // Truyền hàm này vào để trong trang chi tiết bấm được nút Sửa
        />
      ) : (
        <div className="song-list">
          {songs.length === 0 && <p>Chưa có bài hát nào. Hãy tạo bài mới!</p>}
          {songs.map(song => (
            <div key={song.id} className="song-item" onClick={() => setSelectedSong(song)}>
              <h3>{song.title} - <span className="author">{song.author}</span></h3>
              <p className="meta">Đăng bởi: {song.postedBy} • Cập nhật: {song.updatedAt}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
  </LoginGuard>
  );
}

import { transposeChord } from './chordLogic'; // Đảm bảo file này nằm cùng thư mục src

function SongDetail({ song, onBack, onEdit }) {
  const [transpose, setTranspose] = useState(0);
  // 1. Thêm state để quản lý cỡ chữ (mặc định là 1.2 rem)
  const [fontSize, setFontSize] = useState(1.2);

  const renderContent = (content) => {
    const parts = content.split(/(\[[^\]]+\])/g);
    return parts.map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        const chordName = part.slice(1, -1);
        const newChord = transposeChord(chordName, transpose);
        return <span key={index} className="chord">{newChord}</span>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const currentKey = transposeChord(song.key || "C", transpose);

  return (
    <div className="song-viewer">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button className="btn-back" onClick={onBack}>← Danh sách</button>
        <button onClick={() => onEdit(song)}>⚙ Chỉnh sửa</button>
      </div>
      
      <div className="song-header">
        <h2 style={{fontSize: '2.5rem', marginBottom: '5px'}}>{song.title}</h2>
        <p style={{fontSize: '1.2rem', color: '#666', marginTop: '0'}}>Sáng tác: {song.author}</p>
        
        <div className="controls-row" style={{display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px'}}>
          {/* Cụm chỉnh Tone */}
          <div className="tone-control">
            <span>Tone: </span>
            <button onClick={() => setTranspose(prev => prev - 1)}>&minus;</button>
            <strong style={{minWidth: '40px', textAlign: 'center', fontSize: '1.4rem', color: 'var(--primary-color)'}}>
              {currentKey} 
            </strong>
            <button onClick={() => setTranspose(prev => prev + 1)}>+</button>
          </div>

          {/* 2. Cụm chỉnh Cỡ chữ mới thêm vào */}
          <div className="font-control">
            <span>Chữ: </span>
            <button onClick={() => setFontSize(prev => Math.max(0.8, prev - 0.1))}>A-</button>
            <button onClick={() => setFontSize(prev => Math.min(2.5, prev + 0.1))}>A+</button>
          </div>
        </div>
      </div>

      <hr style={{margin: '30px 0', opacity: 0.3}} />
      
      {/* 3. Áp dụng fontSize vào style của nội dung bài hát */}
      <div className="song-content" style={{ fontSize: `${fontSize}rem`, lineHeight: `${fontSize * 2.5}` }}>
        {renderContent(song.content)}
      </div>
    </div>
  );
}

function SongEditor({ onSave, onCancel, initialData }) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [author, setAuthor] = useState(initialData?.author || "");
  const [content, setContent] = useState(initialData?.content || "");
  // Thêm state lưu Tone gốc
  const [key, setKey] = useState(initialData?.key || "C"); 

  const chords = ["C", "D", "E", "F", "G", "A", "B", "Cm", "Dm", "Em", "Fm", "Gm", "Am", "Bm"];

  const insertChord = (chord) => {
    const textarea = document.getElementById("song-textarea");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText = text.substring(0, start) + `[${chord}]` + text.substring(end);
    setContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + chord.length + 2, start + chord.length + 2);
    }, 10);
  };

  return (
    <div className="editor-container">
      <h2 style={{color: 'var(--primary-color)'}}>{initialData ? "Chỉnh sửa bài hát" : "Tạo bài hát mới"}</h2>
      
      <div className="editor-header">
        <input 
          className="input-title"
          placeholder="Tên bài hát..." 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
        />
        <input 
          className="input-author"
          placeholder="Tác giả (Sáng tác)..." 
          value={author} 
          onChange={e => setAuthor(e.target.value)} 
        />
      </div>

      <div className="tone-selection">
        <label style={{fontWeight: 'bold', marginRight: '10px'}}>Tone gốc của bài:</label>
        <select 
          className="original-tone-select"
          value={key} 
          onChange={(e) => setKey(e.target.value)}
        >
          {chords.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="toolbar" style={{marginTop: '10px'}}>
        <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '5px'}}>Click để chèn nhanh hợp âm:</p>
        <div className="chord-buttons">
          {chords.map(c => (
            <button key={c} onClick={() => insertChord(c)}>{c}</button>
          ))}
        </div>
      </div>

      <textarea 
        id="song-textarea"
        placeholder="Nhập lời và đặt hợp âm trong ngoặc vuông, ví dụ: [C]Ngày thay [Fm]đêm..."
        value={content}
        onChange={e => setContent(e.target.value)}
      />

      <div className="editor-footer" style={{marginTop: '20px', display: 'flex', gap: '10px'}}>
        <button className="btn-save" onClick={() => onSave({ title, author, content, key })}>
          {initialData ? "LƯU THAY ĐỔI" : "ĐĂNG BÀI HÁT"}
        </button>
        <button onClick={onCancel}>Hủy bỏ</button>
      </div>
    </div>
  );
}

export default App;