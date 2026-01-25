import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { doc, getDoc } from "firebase/firestore";
import AutoScroll from '../components/AutoScroll';
import myLogo from '../assets/logonoback.png'; 
import hdcgLogo from '../assets/hdcglogo.jpg';
import { getYouTubeEmbedUrl } from '../youtubeLink';

const GuestSongView = () => {
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fontSize, setFontSize] = useState(1.2);

  useEffect(() => {
    const fetchGuestSong = async () => {
      const params = new URLSearchParams(window.location.search);
      const songId = params.get('id');

      if (!songId) {
        setError("Đường dẫn không hợp lệ!");
        setLoading(false);
        return;
      }

      try {
        let docRef = doc(db, "songs", songId);
        let docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          docRef = doc(db, "hdcg_songs", songId);
          docSnap = await getDoc(docRef);
        }

        if (docSnap.exists()) {
          setSong({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Bài hát không tồn tại hoặc đã bị xóa.");
        }
      } catch (err) {
        console.error(err);
        setError("Lỗi kết nối.");
      }
      setLoading(false);
    };

    fetchGuestSong();
  }, []);

  // --- HÀM SỬA LỖI XUỐNG DÒNG ---
  const renderCleanLyrics = (content) => {
    if (!content) return null;
    
    // BƯỚC 1: Xóa sạch toàn bộ hợp âm [...] trước
    // Điều này giúp loại bỏ các dấu '/' trong hợp âm Slash (VD: [C/G]), 
    // tránh việc Regex bên dưới hiểu nhầm là ký hiệu Ghi chú /.../
    const contentNoChords = content.replace(/\[[^\]]+\]/g, '');

    // BƯỚC 2: Tách chuỗi để xử lý Note /.../ và In đậm `...`
    const parts = contentNoChords.split(/(\/[^\/]+\/|`[^`]+`)/g);

    return parts.map((part, index) => {
      // 1. Note ghi chú
      if (part.startsWith('/') && part.endsWith('/')) {
        return <span key={index} style={{color: '#666', fontSize: '0.9em', fontStyle: 'italic', display: 'block', margin: '5px 0'}}>{part.slice(1, -1)}</span>;
      }
      // 2. In đậm
      if (part.startsWith('`') && part.endsWith('`')) {
        return <strong key={index}>{part.slice(1, -1)}</strong>;
      }
      
      // 3. Lời bài hát thường (Vì đã xóa hợp âm ở Bước 1 nên chỉ cần in ra)
      return <span key={index}>{part}</span>;
    });
  };

  if (loading) return <div style={{textAlign:'center', marginTop: 50}}>⏳ Đang tải bài hát...</div>;
  if (error) return <div style={{textAlign:'center', marginTop: 50, color: 'red'}}>{error}</div>;

  const embedUrl = getYouTubeEmbedUrl(song.refLink);

  return (
    <div className="guest-container fade-in">
      <div className="guest-header">
        <div className="logo-group">
           <img src={myLogo} alt="Web Logo" />
           <div className="divider"></div>
           <img src={hdcgLogo} alt="HDCG Logo" />
        </div>
        <button className="btn-home" onClick={() => window.location.href = '/'}>Về trang chủ</button>
      </div>

      <div className="guest-content">
        <h1 className="song-title">{song.title}</h1>
        <p className="song-author">Arranger: {song.author}</p>

        {embedUrl && (
            <div className="video-wrapper">
            <div className="video-responsive">
                <iframe src={embedUrl} title="Video" allowFullScreen></iframe>
            </div>
            </div>
        )}

        <hr style={{margin: '20px 0', opacity: 0.2}}/>

        <div className="lyrics-box" style={{ fontSize: `${fontSize}rem`, lineHeight: `${fontSize * 2}rem` }}>
           {renderCleanLyrics(song.content)}
        </div>
      </div>

      <div className="guest-tools">
         <div className="font-control">
            <button onClick={() => setFontSize(p => Math.max(0.8, p - 0.1))}>A-</button>
            <button onClick={() => setFontSize(p => Math.min(2.5, p + 0.1))}>A+</button>
         </div>
      </div>
      
      <AutoScroll />

      <style>{`
        .guest-container { max-width: 800px; margin: 0 auto; padding-bottom: 100px; background: #fff; min-height: 100vh; }
        .guest-header { 
            display: flex; justify-content: space-between; align-items: center; 
            padding: 15px 20px; background: #f8f9fa; border-bottom: 1px solid #eee;
            position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .logo-group { display: flex; align-items: center; gap: 15px; }
        .logo-group img { height: 40px; width: auto; object-fit: contain; }
        .divider { width: 1px; height: 30px; background: #ccc; }
        .btn-home { background: none; border: 1px solid #ccc; padding: 5px 10px; border-radius: 20px; font-size: 0.8rem; cursor: pointer; }
        
        .guest-content { padding: 20px; }
        .song-title { color: var(--primary-color); text-align: center; margin-bottom: 5px; font-size: 2rem; }
        .song-author { text-align: center; color: #666; margin-top: 0; }
        
        .lyrics-box { white-space: pre-wrap; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        
        .guest-tools {
            position: fixed; bottom: 20px; left: 20px; z-index: 99;
            background: rgba(255,255,255,0.9); padding: 5px; border-radius: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2); border: 1px solid #eee;
        }
        .font-control button {
            width: 35px; height: 35px; border-radius: 50%; border: 1px solid #ddd;
            background: white; margin-right: 5px; cursor: pointer; font-weight: bold;
        }
        @media (max-width: 600px) {
            .guest-header { padding: 10px; }
            .logo-group img { height: 30px; }
            .song-title { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  );
};

export default GuestSongView;