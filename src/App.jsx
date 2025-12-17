import React, { useState, useEffect } from 'react';
import './App.css';
import myLogo from './assets/logonoback.png';
// Import Firebase
import { db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
// Import LoginGuard
import LoginGuard from './LoginGuard';  
  
// Các màu hợp âm gợi ý
const colorOptions = ['#d71920', '#0056b3', '#28a745', '#6f42c1', '#fd7e14'];



function App() {
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);

  // State cho ô tìm kiếm
  const [searchTerm, setSearchTerm] = useState(""); 

  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState(null); // Lưu thông tin bài hát đang được chọn để sửa
  // Sáng tối
  const [theme, setTheme] = useState('light'); // 'light' hoặc 'dark'
  const [chordColor, setChordColor] = useState('#d71920');
  
  // Cập nhật thuộc tính của thẻ <html> mỗi khi theme hoặc màu đổi
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.setProperty('--chord-color', chordColor);
  }, [theme, chordColor]);

  // Lọc danh sách bài hát dựa trên từ khóa tìm kiếm
  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    song.author.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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

  // 4. Hàm xóa bài hát
  const handleDelete = async (songId) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn bài hát này không?");
    if (!confirmDelete) return;

    try {
      const songRef = doc(db, "songs", songId);
      await deleteDoc(songRef);
      
      alert("Đã xóa bài hát thành công!");
      await fetchSongs(); // Tải lại danh sách
      setSelectedSong(null); // Quay về trang chủ
    } catch (e) {
      console.error("Lỗi khi xóa: ", e);
      alert("Không thể xóa bài hát!");
    }
  };

  return (
  
  
  <LoginGuard>
  <div className="container">
    {/* Nội dung App hiện tại của bạn nằm hết ở đây */}
    <div className="container">
      <header>
        {/* Thay thế h1 bằng một thẻ div hoặc span chứa ảnh logo */}

        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? '🌙 Tối' : '☀️ Sáng'}
        </button>

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
     {/* Nếu không ở chế độ sửa bài và không đang xem chi tiết bài hát */}
    {!isEditing && !selectedSong && (
      <div className="main-home">
        {/* THANH TÌM KIẾM */}
        <div className="search-bar" style={{ marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="Tìm theo tên bài hát hoặc tác giả..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '93%', padding: '12px', borderRadius: '8px', border: '1px solid #edededff' }}
          />
        </div>

        {/* DANH SÁCH BÀI HÁT (CHỈ DÙNG 1 CÁI NÀY THÔI) */}
        <div className="song-list">
          {filteredSongs.length > 0 ? (
            filteredSongs.map(song => (
              <div key={song.id} className="song-item" onClick={() => setSelectedSong(song)}>
                <h3>{song.title} - <span className="author-name">{song.author}</span></h3>
                <p className="song-meta">Đăng bởi: {song.author} • Cập nhật: {song.updatedAt}</p>
              </div>
            ))
          ) : (
            <div className="no-result">Không tìm thấy bài hát nào phù hợp...</div>
          )}
        </div>
      </div>
    )}
      
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
          onDelete={handleDelete}
          // 2. TRUYỀN DỮ LIỆU XUỐNG ĐÂY
          chordColor={chordColor} 
          setChordColor={setChordColor}
        />
      ) : (
        <div className="song-list">
          {songs.length === 0 && <p>Chưa có bài hát nào. Hãy tạo bài mới!</p>}
          
        </div>
      )}
    </div>
  </div>
  </LoginGuard>
  );
}

import { transposeChord } from './chordLogic'; // Đảm bảo file này nằm cùng thư mục src
import { getYouTubeEmbedUrl } from './youtubeLink';
function SongDetail({ song, onBack, onEdit, onDelete, chordColor, setChordColor }) {
  const [transpose, setTranspose] = useState(0);
  // 1. Thêm state để quản lý cỡ chữ (mặc định là 1.2 rem)
  const [fontSize, setFontSize] = useState(1.2);

  // State để hiện/ẩn hợp âm
  const [showChords, setShowChords] = useState(true);

  // State để lưu link nhúng YouTube
  const embedUrl = getYouTubeEmbedUrl(song.refLink);

  const renderContent = (content) => {
    // Regex này nhận diện đồng thời: [hợp âm], /ghi chú/ và `chữ in đậm`
    const parts = content.split(/(\[[^\]]+\]|\/[^\/]+\/|`[^`]+`)/g);

    return parts.map((part, index) => {
      // 1. Xử lý Hợp âm [ ]
      if (part.startsWith('[') && part.endsWith(']')) {
        if (!showChords) return null;
        const chordName = part.slice(1, -1);
        const newChord = transposeChord(chordName, transpose);
        return <span key={index} className="chord">{newChord}</span>;
      }

      // 2. Note Ghi chú (Trên đầu lời nhạc)
      if (part.startsWith('/') && part.endsWith('/')) {
        const noteText = part.slice(1, -1);
        return (
        <span key={index} className="song-note">
          <span className="song-note-text">{noteText}</span>
        </span>
      );
      }

      // 3. In đậm (Nằm ngang hàng lời nhạc)
      if (part.startsWith('`') && part.endsWith('`')) {
        return <strong key={index} className="song-bold">{part.slice(1, -1)}</strong>;
      }

      // 4. Lời bài hát bình thường
      return <span key={index}>{part}</span>;
    });
  };

  const currentKey = transposeChord(song.key || "C", transpose);

  const handleEditClick = () => {
    const inputPass = prompt("Nhập mật khẩu bài hát để chỉnh sửa:");
    
    if (inputPass === null) return; // Người dùng bấm Hủy

    if (inputPass === song.songPassword) {
      onEdit(song); // Đúng pass thì cho vào trang sửa
    } else {
      alert("Sai mật khẩu rồi bạn ơi!");
    }
  };

  // Delete
  const handleDeleteClick = () => {
    const inputPass = prompt("Nhập mật khẩu bài hát để XÓA:");
    if (inputPass === null) return;

    if (inputPass === song.songPassword) {
      onDelete(song.id); // Gọi hàm xóa từ App truyền xuống
    } else {
      alert("Sai mật khẩu, không thể xóa!");
    }
  };

  

  return (
    <div className="song-viewer">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button className="btn-back" onClick={onBack}>← Danh sách</button>
        <button onClick={handleEditClick}>⚙ Chỉnh sửa</button>
        {/* Nút Xóa mới */}
          <button 
            onClick={handleDeleteClick}
            style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none' }}
          >
            🗑 Xóa bài
          </button>
      </div>

      {embedUrl && (
        <div className="video-wrapper">
          <div className="video-responsive">
            <iframe
              src={embedUrl}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
      
      <div className="song-header">
        <h2 style={{fontSize: '2.5rem', marginBottom: '5px'}}>{song.title}</h2>
        <p style={{fontSize: '1.2rem', color: '#666', marginTop: '0'}}>Arranger: {song.author}</p>
        {song.refLink && (
          <div style={{ marginTop: '10px' }}>
            <a href={song.refLink} target="_blank" rel="noopener noreferrer" 
               style={{ color: '#008d8aff', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
               📺 Nghe hoặc xem ref (Link tham khảo)
            </a>
          </div>
        )}

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

          {/* 4. Cụm chọn màu (Bây giờ chordColor đã được xác định) */}
          <div className="color-picker" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{fontSize: '0.9rem'}}>Màu:</span>
            {colorOptions.map(color => (
              <div 
                key={color}
                onClick={() => setChordColor(color)}
                style={{ 
                  width: '24px', 
                  height: '24px', 
                  backgroundColor: color, 
                  borderRadius: '50%', 
                  cursor: 'pointer', 
                  border: chordColor === color ? '2px solid #333' : '1px solid #ccc',
                  boxSizing: 'border-box'
                }}
              />
            ))}
          </div>

          {/* 3. Nút Hiện/Ẩn hợp âm */}
          <button 
            onClick={() => setShowChords(!showChords)}
            style={{
              backgroundColor: showChords ? '#e8f5e9' : '#ffebee',
              color: showChords ? '#2e7d32' : '#c62828',
              border: '1px solid currentColor',
              padding: '5px 15px',
              borderRadius: '20px',
              fontSize: '0.9rem'
            }}
          >
            {showChords ? "● Hiện hợp âm" : "○ Ẩn hợp âm"}
          </button>

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
  // Thêm state lưu mật khẩu bài hát
  const [songPassword, setSongPassword] = useState(initialData?.songPassword || ""); 

  const chords = ["C", "D", "E", "F", "G", "A", "B", "Cm", "Dm", "Em", "Fm", "Gm", "Am", "Bm"];

  // Thêm state lưu link tham khảo
  const [refLink, setRefLink] = useState(initialData?.refLink || "");

  // Hàm chèn thông minh: Giữ Ctrl+Z và vị trí Scroll
  const smartInsert = (prefix, suffix = "") => {
    const textarea = document.getElementById("song-textarea");
    if (!textarea) return;

    textarea.focus();
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    // Chuỗi văn bản mới sẽ chèn vào
    const textToInsert = prefix + selectedText + suffix;

    // Sử dụng execCommand để trình duyệt ghi nhận đây là một thao tác gõ phím
    // Điều này giúp giữ lịch sử Undo (Ctrl + Z)
    const isSuccess = document.execCommand('insertText', false, textToInsert);

    // Nếu trình duyệt không hỗ trợ execCommand (hiếm gặp), dùng cách cũ làm dự phòng
    if (!isSuccess) {
      const newContent = textarea.value.substring(0, start) + textToInsert + textarea.value.substring(end);
      setContent(newContent);
    } else {
      // Cập nhật lại state content ngay lập tức để đồng bộ
      setContent(textarea.value);
    }
  };

  // insert Note function
  const insertNote = () => {
    const textarea = document.getElementById("song-textarea");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    // Lấy phần văn bản được bôi đen
    const selectedText = text.substring(start, end);
    
    if (selectedText.length === 0) {
      alert("Hãy bôi đen chữ bạn muốn tạo ghi chú bên trên!");
      return;
    }

    // Bao bọc phần bôi đen bằng dấu / /
    const newText = text.substring(0, start) + `/${selectedText}/` + text.substring(end);
    setContent(newText);

    // Trả lại con trỏ chuột về sau phần vừa chèn
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + selectedText.length + 2, start + selectedText.length + 2);
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
          placeholder="Tên Arranger" 
          value={author} 
          onChange={e => setAuthor(e.target.value)} 
        />
      </div>

      <div className="input-group" style={{ margin: '15px 0' }}>
        <input 
          placeholder="Link bài hát tham khảo (Youtube, Spotify...)" 
          value={refLink} 
          onChange={e => setRefLink(e.target.value)}
          className="input-author" /* Dùng tạm class này để đồng bộ style */
        />
      </div>

      <div className="password-selection" style={{ margin: '15px 0' }}>
        <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Mật khẩu bảo vệ bài hát:</label>
        <input 
          type="password"
          placeholder="Nhập mã để sửa bài sau này..."
          value={songPassword}
          onChange={(e) => setSongPassword(e.target.value)}
          style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
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
        <div className="chord-buttons" style={{ position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
        {/* Nút hợp âm nhanh */}
        {chords.map(c => (
          <button key={c} onClick={() => smartInsert(`[${c}]`)}>{c}</button>
        ))}

        {/* Nút Add Note cho phần bôi đen */}
        <button 
          onClick={() => smartInsert('/', '/')} 
          style={{ fontWeight: 'bold', color: '#000000ff' }}
        >
          +Note
        </button>

        {/* Nút In đậm */}
        <button onClick={() => smartInsert('`', '`')}><b>In đậm</b></button>

        </div>
      </div>

      <textarea 
        id="song-textarea"
        placeholder="Nhập lời và đặt hợp âm trong ngoặc vuông, note trong dấu /, Ví dụ: [C]Ngày mai /hát nhỏ/ em đi..."
        value={content}
        onChange={e => setContent(e.target.value)}
      />

      <div className="editor-footer">
        <button 
          className="btn-save" 
          onClick={() => {
            if(!songPassword) {
               alert("Vui lòng đặt mật khẩu cho bài hát!");
               return;
            }
            onSave({ title, author, content, key, songPassword, refLink });
          }}
        >
          {initialData ? "LƯU THAY ĐỔI" : "ĐĂNG BÀI HÁT"}
        </button>
        <button onClick={onCancel}>Hủy</button>
      </div>
    </div>
  );
}

export default App;