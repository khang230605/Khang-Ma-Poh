import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// --- IMPORT ---
import myLogo from './assets/logonoback.png'; 
import hdcgLogo from './assets/hdcglogo.jpg';
import { db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";

// --- COMPONENTS ---
import UserAuth from './components/UserAuth';
import AdminDashboard from './admin/AdminDashboard'; // <--- MỚI: IMPORT ADMIN
import { transposeChord } from './chordLogic';
import { getYouTubeEmbedUrl } from './youtubeLink';
import ToneFinder from './ToneFinder';
import ChordViewer from './ChordViewer';
import SetlistManager from './SetlistManager';
import AutoScroll from './components/AutoScroll';
import GuestSongView from './guest/GuestSongView';
import ToneControl from './components/ToneControl';
import Metronome from './components/Metronome';
import PrintControl from './components/PrintControl';
import { ScheduleWrapper } from './schedule';
import { Helmet } from 'react-helmet-async';
import HDCGManager from './HDCG/HDCGManager';

// --- AI ADDIN ---
import LyricsFinder from './AIaddin/LyricsFinder';

// --- SIDEBAR CẬP NHẬT ---
const Sidebar = ({ activeTab, setActiveTab, theme, setTheme, currentUser, onLogout, resetView }) => {
  return (
    <div className="sidebar">
      {/* 1. LOGO (Ghim trên cùng) */}
      <img 
        src={myLogo} alt="Logo" className="sidebar-logo" 
        onClick={() => { setActiveTab('home'); resetView(); }}
      />

      {/* 2. MENU CHÍNH (Sẽ cuộn nếu quá dài) */}
      <div className="nav-list-scroll">
          <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => { setActiveTab('home'); resetView(); }}>
            <div className="nav-icon">🏠</div><span className="nav-text">Trang chủ</span>
          </div>
          
          <div className={`nav-item ${activeTab === 'tone' ? 'active' : ''}`} onClick={() => setActiveTab('tone')}>
            <div className="nav-icon">🎵</div><span className="nav-text">Dò Tone</span>
          </div>

          <div className={`nav-item ${activeTab === 'setlist' ? 'active' : ''}`} onClick={() => setActiveTab('setlist')}>
            <div className="nav-icon">📋</div><span className="nav-text">Danh sách</span>
          </div>

          <div className={`nav-item ${activeTab === 'lyrics' ? 'active' : ''}`} onClick={() => setActiveTab('lyrics')}>
            <div className="nav-icon">👀</div><span className="nav-text">Lyrics Finder</span>
          </div>

          <div className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>
            <div className="nav-icon">📅</div><span className="nav-text">HDCG Schedule</span>
          </div>

          {/* Ví dụ thêm nhiều mục sau này */}
          {/* <div className="nav-item"><div className="nav-icon">🎸</div><span className="nav-text">Hợp âm</span></div>
          <div className="nav-item"><div className="nav-icon">🎹</div><span className="nav-text">Piano</span></div> 
          */}
          {/* HDCG Official Button */}
          {currentUser?.role !== 'member' && ( // Chỉ cho HDCG Member và Admin thấy
              <div className={`nav-item ${activeTab === 'hdcg_official' ? 'active' : ''}`} onClick={() => setActiveTab('hdcg_official')}>
                  <div className="nav-icon">💿</div><span className="nav-text">HDCG Official</span>
              </div>
          )}

          {/* Admin Button */}
          {currentUser?.role === 'admin' && (
            <div className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
              <div className="nav-icon">⚙️</div><span className="nav-text">Quản trị</span>
            </div>
          )}
      </div>

      {/* 3. FOOTER MENU (Ghim dưới đáy) */}
      <div className="nav-footer">
          {/* <div className="nav-item" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            <div className="nav-icon">{theme === 'light' ? '🌙' : '☀️'}</div>
            <span className="nav-text">Giao diện</span>
          </div> */}

          <div className="nav-item" onClick={onLogout}>
            <div className="nav-icon">🚪</div>
            <span className="nav-text">Đăng xuất</span>
          </div>
      </div>
    </div>
  );
};

const colorOptions = ['#d71920', '#0056b3', '#28a745', '#6f42c1', '#fd7e14'];

function App() {
  // -------------------------------------------------------
  // 1. KIỂM TRA GUEST NGAY TẠI ĐẦU (Không dùng Hook)
  // -------------------------------------------------------
  if (window.location.pathname.startsWith('/guest')) {
    return <GuestSongView />;
  }
  // --- 2. APP CHÍNH VỚI AUTH ---
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Data State
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState(null);
  
  // UI State
  const [theme, setTheme] = useState('light');
  const [chordColor, setChordColor] = useState('#d71920');
  const [activeTab, setActiveTab] = useState('home');

  // --- AUTH LOGIC (GIỮ NGUYÊN) ---
  useEffect(() => {
    const savedUser = localStorage.getItem('user_session');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoadingAuth(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('user_session', JSON.stringify(userData));
  };

  const handleLogout = () => {
    if(window.confirm("Bạn muốn đăng xuất?")) {
      setCurrentUser(null);
      localStorage.removeItem('user_session');
      window.history.pushState(null, "", "/");
      setActiveTab('home'); // Reset tab khi logout
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.setProperty('--chord-color', chordColor);
  }, [theme, chordColor]);

  useEffect(() => {
    if (window.location.pathname === '/tonefinder') setActiveTab('tone');
  }, []);

  // --- FETCH SONGS (GIỮ NGUYÊN) ---
  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    song.author.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const fetchSongs = async () => {
    if (!currentUser) return;
    setSongs([]); 
    let mergedSongs = [];
    try {
      const publicQ = query(collection(db, "songs"), orderBy("createdAt", "desc"));
      const publicSnap = await getDocs(publicQ);
      const publicData = publicSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), _source: 'songs' }));
      mergedSongs = [...publicData];

      if (currentUser.role === 'hdcg_member' || currentUser.role === 'admin') {
        const hdcgQ = query(collection(db, "hdcg_songs"), orderBy("createdAt", "desc"));
        const hdcgSnap = await getDocs(hdcgQ);
        const hdcgData = hdcgSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), _source: 'hdcg_songs' }));
        mergedSongs = [...mergedSongs, ...hdcgData];
      }
      mergedSongs.sort((a, b) => b.createdAt - a.createdAt);
      setSongs(mergedSongs);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { if (currentUser) fetchSongs(); }, [currentUser]);

  // --- HANDLE SAVE (GIỮ NGUYÊN) ---
  const handleSave = async (songFormContent, targetCollection) => {
    const defaultCollection = (currentUser.role === 'hdcg_member' || currentUser.role === 'admin') ? "hdcg_songs" : "songs";
    let savedSongData = null;
    try {
      if (editingData) {
        const collectionName = editingData._source || defaultCollection;
        const songRef = doc(db, collectionName, editingData.id);
        const updatePayload = { ...songFormContent, updatedAt: new Date().toLocaleDateString('vi-VN') };
        await updateDoc(songRef, updatePayload);
        savedSongData = { id: editingData.id, ...updatePayload, _source: collectionName };
      } else {
        const collectionName = targetCollection; 
        const newPayload = { ...songFormContent, postedBy: currentUser.name, createdAt: new Date().getTime(), updatedAt: new Date().toLocaleDateString('vi-VN') };
        const docRef = await addDoc(collection(db, collectionName), newPayload);
        savedSongData = { id: docRef.id, ...newPayload, _source: collectionName };
      } 
      await fetchSongs(); 
      setIsEditing(false); setEditingData(null); setSelectedSong(savedSongData); 
    } catch (e) { console.error(e); alert("Có lỗi xảy ra!"); }
  };

  // --- MỚI: HÀM LÀM MỚI BÀI HÁT ---
  const handleRefreshSong = async () => {
    if (!selectedSong) return;

    try {
      // 1. Xác định bài hát đang ở collection nào
      const collectionName = selectedSong._source || "songs"; 
      
      // 2. Lấy dữ liệu mới nhất từ Firebase
      const docRef = doc(db, collectionName, selectedSong.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const freshData = { id: docSnap.id, ...docSnap.data(), _source: collectionName };
        
        // 3. Cập nhật vào State đang hiển thị
        setSelectedSong(freshData);

        // 4. Cập nhật luôn vào danh sách tổng bên dưới (để nếu back ra ko bị cũ)
        setSongs(prevSongs => prevSongs.map(s => s.id === freshData.id ? freshData : s));
        
        // Thông báo nhẹ (hoặc có thể bỏ nếu thích)
        // alert("Đã cập nhật dữ liệu mới nhất! 🔄");
      } else {
        alert("Bài hát này có vẻ đã bị xóa!");
        setSelectedSong(null);
      }
    } catch (e) {
      console.error("Lỗi refresh:", e);
      alert("Không tải được dữ liệu mới.");
    }
  };

  const startEditing = (song) => { setSelectedSong(null); setEditingData(song); setIsEditing(true); };

  const handleDelete = async (songId) => {
    const songToDelete = selectedSong || songs.find(s => s.id === songId);
    if (!songToDelete) return;
    const collectionName = songToDelete._source || "songs"; 
    if (!window.confirm("Xóa vĩnh viễn bài hát này?")) return;
    try {
      await deleteDoc(doc(db, collectionName, songId));
      alert("Đã xóa bài hát!");
      await fetchSongs();
      setSelectedSong(null);
    } catch (e) { console.error(e); alert("Lỗi xóa!"); }
  };
  
  const resetView = () => {
    setSelectedSong(null); setIsEditing(false); setEditingData(null);
    window.history.pushState(null, "", "/");
  };

  // --- RENDER ---
  if (loadingAuth) return <div style={{display:'flex', justifyContent:'center', marginTop: 50}}>Đang tải...</div>;
  if (!currentUser) return <UserAuth onLoginSuccess={handleLoginSuccess} />;

  return (
  <>
    <Helmet>
         <title>Khangmapoh - Kho Hợp Âm Độc Quyền của HDCG</title>
         <meta name="description" content="Web tra cứu hợp âm, dò tone, tìm lyrics và công cụ hỗ trợ ban nhạc của Khangmapoh." />
         <meta name="keywords" content="khangmapoh, khang ma poh, khang hợp âm, hdcg hợp âm, hồ đá chà gươm, hdcg" />
    </Helmet>
    <div className="app-layout">
      {/* ... Phần Sidebar đã sửa ở Bước 2 ... */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
            setActiveTab(tab);
            if(tab === 'tone') window.history.pushState(null, "", "/tonefinder");
            if(tab === 'schedule') window.history.pushState(null, "", "/hdcgschedule"); // Thêm dòng này
        }}
        theme={theme}
        setTheme={setTheme}
        currentUser={currentUser}
        onLogout={handleLogout}
        resetView={resetView}
      />

      <div className="main-wrapper">
        <div className="container">
          
          {selectedSong ? (
              <SongDetail 
                song={selectedSong} 
                onBack={() => setSelectedSong(null)} 
                onEdit={startEditing} 
                onDelete={() => handleDelete(selectedSong.id)}
                onRefresh={handleRefreshSong}
                chordColor={chordColor} 
                setChordColor={setChordColor}
              />
          ) : isEditing ? (
              <SongEditor 
                onSave={handleSave} 
                onCancel={() => { setIsEditing(false); setEditingData(null); }} 
                initialData={editingData} 
                currentUser={currentUser}
              />
          ) : activeTab === 'tone' ? (
              <ToneFinder onBack={() => { setActiveTab('home'); window.history.pushState(null, "", "/"); }} />
          
          /* --- TAB ADMIN --- */
          ) : activeTab === 'admin' && currentUser.role === 'admin' ? (
              <AdminDashboard /> 

          /* --- MỚI: TAB SCHEDULE (LỊCH) --- */
          ) : activeTab === 'schedule' ? (
              <ScheduleWrapper currentUser={currentUser} />

          /* --- TAB SETLIST --- */
          ) : activeTab === 'setlist' ? (
              <SetlistManager 
                currentUser={currentUser}
                allSongs={songs}
                onSelectSong={(songShort) => {
                    const full = songs.find(s => s.id === songShort.id);
                    if(full) setSelectedSong(full);
                }}
              />
          /* --- TAB LYRICS FINDER --- */
          ) : activeTab === 'lyrics' ? (
              <LyricsFinder />
          )
          /* --- TAB HDCG OFFICIAL --- */
          : activeTab === 'hdcg_official' ? (
              <HDCGManager currentUser={currentUser} />
          ) : (
              <>
                {/* --- TRANG CHỦ (HOME) --- */}
                <header>
                  {/* ... (Giữ nguyên phần Header cũ của bạn) ... */}
                  <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                      <img src={hdcgLogo} alt="Logo" style={{height: '60px', width: 'auto'}} />
                      <div>
                        <h2 style={{margin:0, fontSize:'1.2rem'}}>Xin chào, {currentUser.name} 👋</h2>
                        <span style={{fontSize:'0.8rem', color:'#666'}}>
                           {currentUser.role === 'admin' ? 'Admin hệ thống' : 
                            (currentUser.role === 'hdcg_member' ? 'Thành viên HDCG Band' : 'Thành viên')}
                        </span>
                      </div>
                  </div>
                  {!isEditing && !selectedSong && (
                    <button className="btn-create" onClick={() => setIsEditing(true)}>+ Tạo bài hát</button>
                  )}
                </header>

                <div className="main-home">
                   {/* ... (Giữ nguyên phần danh sách bài hát cũ của bạn) ... */}
                  <div className="search-bar" style={{ marginBottom: '20px' }}>
                    <input 
                      type="text" 
                      placeholder="Tìm bài hát..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}
                    />
                  </div>
                  <div className="song-list">
                    {filteredSongs.length > 0 ? (
                      filteredSongs.map(song => (
                        <div key={song.id} className="song-item" onClick={() => setSelectedSong(song)}>
                          <h3>
                            {song.title} 
                            {song._source === 'hdcg_songs' && (
                               <span style={{fontSize:'0.6rem', background:'green', color:'white', padding:'2px 5px', borderRadius:'4px', marginLeft:'5px', verticalAlign:'middle'}}>PRIVATE</span>
                            )}
                          </h3>
                          <p className="song-meta" style={{marginTop: 'auto'}}>
                              <span className="author-name">👤 {song.author}</span><br/>
                              <small style={{opacity: 0.7}}>📅 {song.updatedAt}</small>
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="no-result">Không tìm thấy bài hát...</div>
                    )}
                  </div>
                </div>
              </>
          )}

        </div>
      </div>
    </div>
  </>
  );
}

// --- SONG DETAIL & EDITOR COMPONENTS (Giữ nguyên) ---

function SongDetail({ song, onBack, onEdit, onDelete, onRefresh, chordColor, setChordColor }) {
  const [transpose, setTranspose] = useState(0);
  const [fontSize, setFontSize] = useState(1.2);
  const [showChords, setShowChords] = useState(true);
  const [selectedChord, setSelectedChord] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false); // State cho nút xoay
  const [showMetronome, setShowMetronome] = useState(false); // State hiển thị Metronome

  const embedUrl = getYouTubeEmbedUrl(song.refLink);

  const renderContent = (content) => {
    const parts = content.split(/(\[[^\]]+\]|\/[^\/]+\/|`[^`]+`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        if (!showChords) return null;
        const chordName = part.slice(1, -1);
        const newChord = transposeChord(chordName, transpose);
        return (
          <span key={index} className="chord" onClick={() => setSelectedChord(newChord)} style={{ cursor: 'pointer' }}>
            {newChord}
          </span>
        );
      }
      if (part.startsWith('/') && part.endsWith('/')) {
        return <span key={index} className="song-note"><span className="song-note-text">{part.slice(1, -1)}</span></span>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <strong key={index} className="song-bold">{part.slice(1, -1)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Logic hiển thị Tone
  const displayBaseKey = song.writtenKey || song.key || "C";
  const currentKey = transposeChord(displayBaseKey, transpose);
  const originalAudioKey = song.key || "C";

  const handleEditClick = () => {
    const inputPass = prompt("Nhập mật khẩu bài hát để chỉnh sửa:");
    if (inputPass === song.songPassword) onEdit(song);
    else if (inputPass !== null) alert("Sai mật khẩu!");
  };

  const handleDeleteClick = () => {
    const inputPass = prompt("Nhập mật khẩu bài hát để XÓA:");
    if (inputPass === song.songPassword) onDelete();
    else if (inputPass !== null) alert("Sai mật khẩu!");
  };

  // Hàm xử lý nút làm mới
  const handleRefreshClick = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setTimeout(() => setIsRefreshing(false), 500);
    } else {
      console.error("Hàm onRefresh chưa được truyền vào component SongDetail");
    }
  };

  // Xử lý nút share
  // Hàm tạo Slug không dấu (để link nhìn cho đẹp)
  const toSlug = (str) => {
    return str.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/([^0-9a-z-\s])/g, '')
      .replace(/(\s+)/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleShareClick = () => {
    // Tạo link: domain.com/guest?id=XXX&name=ten-bai-hat
    // Phần &name=... chỉ để đẹp link, logic chính vẫn ăn theo id=...
    const slug = toSlug(song.title);
    const shareUrl = `${window.location.origin}/guest?id=${song.id}&n=${slug}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert("Đã copy link chia sẻ vào bộ nhớ tạm! \nBạn có thể share source bài ngay!!! 🔗");
    });
  };

  return (
    <div className="song-viewer">
      <div 
        className="song-top-bar" 
        style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}
      >
        <button className="btn-back" onClick={onBack}>← Danh sách</button>
        
        <div style={{display: 'flex', gap: '10px'}}>

          {/* NÚT SHARE MỚI */}
          <button 
            onClick={handleShareClick} 
            style={{ 
               backgroundColor: '#6f42c1', // Màu tím
               color: 'white', 
               border: 'none',
               display: 'flex', alignItems: 'center', gap: '5px'
            }}
            title="Chia sẻ link cho người ngoài xem"
          >
            <span>🔗</span> 
            <span className="hide-on-mobile">Share</span>
          </button>

          {/* NÚT LÀM MỚI */}
          <button 
            onClick={handleRefreshClick} 
            style={{ 
               backgroundColor: '#17a2b8', 
               color: 'white', 
               border: 'none',
               display: 'flex',
               alignItems: 'center',
               gap: '5px'
            }}
            title="Tải lại nội dung mới nhất"
          >
            <span style={{ 
               display: 'inline-block', 
               transition: 'transform 0.5s',
               transform: isRefreshing ? 'rotate(360deg)' : 'rotate(0deg)'
            }}>
              🔄
            </span> 
            <span className="hide-on-mobile">Làm mới</span>
          </button>

          <button onClick={handleEditClick}>⚙ Sửa</button>
          <button onClick={handleDeleteClick} style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none' }}>🗑 Xóa</button>
        </div>
      </div>

      {embedUrl && (
        <div className="video-wrapper">
          <div className="video-responsive">
            <iframe src={embedUrl} title="Video" allowFullScreen></iframe>
          </div>
        </div>
      )}
      
      <div className="song-header">
        <h2 style={{fontSize: '2.5rem', marginBottom: '5px'}}>{song.title}</h2>
        <p style={{fontSize: '1.2rem', color: '#666', marginTop: '0'}}>Arranger: {song.author}</p>
        
        <div className="controls-row" style={{display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px'}}>
          <div className="tone-control">
            <span>Tone: </span>
            <button onClick={() => setTranspose(prev => prev - 1)}>&minus;</button>
            <strong style={{minWidth: '40px', textAlign: 'center', fontSize: '1.4rem', color: 'var(--primary-color)'}}>{currentKey}</strong>
            <button onClick={() => setTranspose(prev => prev + 1)}>+</button>
            
            {originalAudioKey !== displayBaseKey && (
               <span style={{ marginLeft: '10px', fontSize: '0.9rem', color: '#666', borderLeft: '1px solid #ccc', paddingLeft: '10px' }}>
                 🎧 Audio: <b>{originalAudioKey}</b>
               </span>
            )}
          </div>

          <div className="font-control">
            <span>Chữ: </span>
            <button onClick={() => setFontSize(prev => Math.max(0.8, prev - 0.1))}>A-</button>
            <button onClick={() => setFontSize(prev => Math.min(2.5, prev + 0.1))}>A+</button>
          </div>
          <div className="color-picker" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{fontSize: '0.9rem'}}>Màu:</span>
            {colorOptions.map(color => (
              <div key={color} onClick={() => setChordColor(color)} style={{ width: '24px', height: '24px', backgroundColor: color, borderRadius: '50%', border: chordColor === color ? '2px solid #333' : '1px solid #ccc' }} />
            ))}
          </div>

          <button onClick={() => setShowChords(!showChords)} style={{backgroundColor: showChords ? '#e8f5e9' : '#ffebee', color: showChords ? '#2e7d32' : '#c62828', padding: '5px 15px', borderRadius: '20px'}}>
            {showChords ? "● Hiện hợp âm" : "○ Ẩn hợp âm"}
          </button>

          {/* --- NÚT METRONOME --- */}
          <button 
            onClick={() => setShowMetronome(true)}
            style={{
                backgroundColor: '#fff3cd', 
                color: '#856404', 
                border: '1px solid #ffeeba',
                borderRadius: '20px',
                padding: '5px 15px',
                display: 'flex', alignItems: 'center', gap: '5px'
            }}
          >
            ⏱️Metronome
          </button>

        </div>
      </div>

      <hr style={{margin: '30px 0', opacity: 0.3}} />
      
      <div className="song-content" 
      style={{ 
          fontSize: `${fontSize}rem`, 
          lineHeight: `${fontSize * 2.5}`,
          
          // Truyền giá trị state hiện tại vào biến CSS để file App.css đọc được
          '--current-font-size': `${fontSize}rem`,
          '--current-line-height': `${fontSize * 2.5}`
          // ----------------------
        }}
      >
        {renderContent(song.content)}
      </div>

      {/* --- HIỂN THỊ DIALOG METRONOME NẾU BẬT --- */}
      {showMetronome && <Metronome onClose={() => setShowMetronome(false)} />}

      

      {/* Truyền title vào PrintControl để đặt tên file */}
      <PrintControl title={song.title} elementId="pdf-source" />

      <AutoScroll />
      {/* Nút chỉnh Tone (Bên phải) */}
      <ToneControl 
        transpose={transpose} 
        setTranspose={setTranspose} 
        currentKey={currentKey} 
      />

      {selectedChord && (
        <ChordViewer chord={selectedChord} onClose={() => setSelectedChord(null)} />
      )}
      
      <style>{`
        @media (max-width: 600px) {
          .hide-on-mobile { display: none; }
        }
      `}</style>
    </div>
  );
}

function SongEditor({ onSave, onCancel, initialData, currentUser }) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [author, setAuthor] = useState(initialData?.author || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [songPassword, setSongPassword] = useState(initialData?.songPassword || ""); 
  const [refLink, setRefLink] = useState(initialData?.refLink || "");
  
  // --- THAY ĐỔI 1: Tách biệt Tone gốc (Audio) và Tone viết (Hợp âm) ---
  const [key, setKey] = useState(initialData?.key || "C"); // Tone Audio
  const [writtenKey, setWrittenKey] = useState(initialData?.writtenKey || "C"); // Tone Hợp âm trong bài

  // State quản lý nơi lưu
  const isVip = currentUser?.role === 'hdcg_member' || currentUser?.role === 'admin';
  const [collectionType, setCollectionType] = useState(
    initialData?._source || (isVip ? "hdcg_songs" : "songs")
  );

  // Danh sách nốt đầy đủ (Thăng/Giáng)
  const chords = [
    "C", "C#", "Db", "D", "Eb", "E", "F", "F#", "Gb", "G", "Ab", "A", "Bb", "B",
    "Cm", "C#m", "Dm", "Ebm", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "Bbm", "Bm"
  ];

  const smartInsert = (prefix, suffix = "") => {
    const textarea = document.getElementById("song-textarea");
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textToInsert = prefix + textarea.value.substring(start, end) + suffix;
    
    if (!document.execCommand('insertText', false, textToInsert)) {
      setContent(textarea.value.substring(0, start) + textToInsert + textarea.value.substring(end));
    }
  };

  return (
    <div className="editor-container">
      <h2 style={{color: 'var(--primary-color)'}}>{initialData ? "Chỉnh sửa bài hát" : "Tạo bài hát mới"}</h2>
      
      <div className="editor-header">
        <input className="input-title" placeholder="Tên bài hát..." value={title} onChange={e => setTitle(e.target.value)} />
        <input className="input-author" placeholder="Tên Arranger" value={author} onChange={e => setAuthor(e.target.value)} />
      </div>

      {isVip && (
        <div style={{ margin: '15px 0', padding: '10px', background: '#f0f8ff', borderRadius: '8px', border: '1px solid #cce5ff' }}>
          <label style={{fontWeight: 'bold', marginRight: '10px', color: '#004085'}}>🔒 Chế độ hiển thị:</label>
          <select 
            value={collectionType} 
            onChange={(e) => setCollectionType(e.target.value)}
            style={{ padding: '5px', borderRadius: '4px', border: '1px solid #b8daff' }}
            disabled={!!initialData}
          >
            <option value="hdcg_songs">Nội bộ (HDCG Member & Admin)</option>
            <option value="songs">Công khai (Tất cả mọi người)</option>
          </select>
        </div>
      )}

      <div className="input-group" style={{ margin: '15px 0' }}>
        <input placeholder="Link bài hát tham khảo..." value={refLink} onChange={e => setRefLink(e.target.value)} className="input-author" />
      </div>
      
      <div className="password-selection" style={{ margin: '15px 0' }}>
        <label>Mật khẩu bài hát:</label>
        <input type="password" value={songPassword} onChange={(e) => setSongPassword(e.target.value)} style={{ marginLeft: 10, padding: 5 }} />
      </div>
      
      {/* --- THAY ĐỔI 2: Giao diện chọn 2 loại Tone --- */}
      <div className="tone-selection" style={{ display: 'flex', gap: '20px', alignItems: 'center', background: '#f9f9f9', padding: '10px', borderRadius: '8px' }}>
        
        {/* Cột 1: Tone gốc (Audio) */}
        <div>
          <label style={{fontWeight: 'bold', display: 'block', fontSize: '0.8rem', color: '#666'}}>Tone gốc (Audio):</label>
          <select 
            value={key} 
            onChange={(e) => setKey(e.target.value)} 
            style={{ padding: '5px', minWidth: '80px', marginTop: '5px', border: '2px solid var(--primary-color)', borderRadius: '4px' }}
          >
            {chords.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={{fontSize: '1.5rem', color: '#ccc'}}>→</div>

        {/* Cột 2: Tone viết (Trong bài) */}
        <div>
          <label style={{fontWeight: 'bold', display: 'block', fontSize: '0.8rem', color: '#666'}}>Tone viết (Hợp âm):</label>
          <select 
            value={writtenKey} 
            onChange={(e) => setWrittenKey(e.target.value)} 
            style={{ padding: '5px', minWidth: '80px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            {chords.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Gợi ý nhỏ */}
        {key !== writtenKey && (
           <div style={{fontSize: '0.8rem', color: '#d71920', fontStyle: 'italic', maxWidth: '150px'}}>
             * Bài hát sẽ hiển thị hợp âm <b>{writtenKey}</b>, nhưng tone gốc là <b>{key}</b>.
           </div>
        )}
      </div>

      <div className="toolbar" style={{marginTop: '10px'}}>
        <div className="chord-buttons" style={{ position: 'sticky', top: 0, background: 'white', zIndex: 10, overflowX: 'auto', whiteSpace: 'nowrap', padding: '5px 0', display: 'flex', gap: '5px' }}>
          {chords.map(c => <button key={c} onClick={() => smartInsert(`[${c}]`)}>{c}</button>)}
          <button onClick={() => smartInsert('/', '/')} style={{ fontWeight: 'bold', minWidth: '60px' }}>+Note</button>
          <button onClick={() => smartInsert('`', '`')} style={{ minWidth: '70px' }}><b>In đậm</b></button>
        </div>
      </div>

      <textarea id="song-textarea" placeholder="Nhập lời..." value={content} onChange={e => setContent(e.target.value)} />
      
      <div className="editor-footer">
        <button className="btn-save" onClick={() => {
           if(!songPassword) { alert("Vui lòng đặt mật khẩu!"); return; }
           // --- THAY ĐỔI 3: Lưu thêm writtenKey ---
           onSave({ 
             title, 
             author, 
             content, 
             key,         // Tone gốc
             writtenKey,  // Tone viết
             songPassword, 
             refLink 
           }, collectionType);
        }}>{initialData ? "LƯU THAY ĐỔI" : "ĐĂNG BÀI HÁT"}</button>
        <button onClick={onCancel}>Hủy</button>
      </div>
    </div>
  );
}

export default App;