import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from '../firebase';
import { INSTRUMENTS } from './constants';

// --- IMPORT CÁC HÀM TỪ SRC GỐC ---
import { transposeChord } from '../chordLogic'; 
import { getYouTubeEmbedUrl } from '../youtubeLink';
import Metronome from '../components/Metronome';
import AutoScroll from '../components/AutoScroll';
import ToneControl from '../components/ToneControl';
import ChordViewer from '../ChordViewer';
import PrintControl from '../components/PrintControl';

const colorOptions = ['#d71920', '#0056b3', '#28a745', '#6f42c1', '#fd7e14'];
const chordsList = ["C", "C#", "Db", "D", "Eb", "E", "F", "F#", "Gb", "G", "Ab", "A", "Bb", "B", "Cm", "C#m", "Dm", "Ebm", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "Bbm", "Bm"];

const OfficialSongDetail = ({ song: initialSong, onBack, currentUser }) => {
  // --- STATE ---
  const [song, setSong] = useState(initialSong);
  const [activeInst, setActiveInst] = useState('master');
  const [content, setContent] = useState(''); 
  const [backupContent, setBackupContent] = useState(null);

  // --- UI STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [transpose, setTranspose] = useState(0);
  const [fontSize, setFontSize] = useState(1.2);
  const [showChords, setShowChords] = useState(true);
  const [selectedChord, setSelectedChord] = useState(null);
  const [chordColor, setChordColor] = useState('#d71920');
  const [showMetronome, setShowMetronome] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync màu
  useEffect(() => {
    document.documentElement.style.setProperty('--chord-color', chordColor);
  }, [chordColor]);

  // Load data
  useEffect(() => {
    const fetchFresh = async () => {
      const docRef = doc(db, "hdcg_official_songs", song.id);
      const snap = await getDoc(docRef);
      if (snap.exists()) setSong({ id: snap.id, ...snap.data() });
    }
    fetchFresh();
  }, [song.id]);

  // Đổi nhạc cụ
  useEffect(() => {
    if (activeInst === 'master') {
      setContent(song.masterContent || "");
      setBackupContent(null);
    } else {
      const instData = song.instruments?.[activeInst] || {};
      setContent(instData.content || song.masterContent || "");
      setBackupContent(instData.backup || null);
    }
    setShowBackup(false);
    setTranspose(0);
  }, [activeInst, song]);

  // --- RENDER CONTENT ---
  const renderContent = (textData) => {
    if (!textData) return null;
    const parts = textData.split(/(\[[^\]]+\]|\/[^\/]+\/|`[^`]+`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        if (!showChords) return null;
        const chordName = part.slice(1, -1);
        const newChord = transposeChord(chordName, transpose);
        return (
          <span 
            key={index} 
            className="chord" 
            onClick={() => setSelectedChord(newChord)} 
            style={{ cursor: 'pointer' }} 
          >
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

  // --- SMART INSERT ---
  const smartInsert = (prefix, suffix = "") => {
    const textarea = document.getElementById("song-textarea");
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textToInsert = prefix + textarea.value.substring(start, end) + suffix;
    const newContent = textarea.value.substring(0, start) + textToInsert + textarea.value.substring(end);
    setContent(newContent);
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  // --- SAVE ---
  const handleSave = async () => {
    try {
      const songRef = doc(db, "hdcg_official_songs", song.id);
      let updatePayload = {};

      if (activeInst === 'master') {
        if (!window.confirm("⚠️ CẬP NHẬT MASTER?\n\nNội dung mới sẽ GHI ĐÈ lên tất cả nhạc cụ.\nBạn chắc chắn chứ?")) return;
        let newInstruments = { ...song.instruments };
        INSTRUMENTS.forEach(inst => {
           if (inst.id === 'master') return;
           const currentContentOfInst = newInstruments[inst.id]?.content || song.masterContent || "";
           newInstruments[inst.id] = { content: content, backup: currentContentOfInst };
        });
        updatePayload = { masterContent: content, instruments: newInstruments, updatedAt: new Date().getTime() };
      } else {
        updatePayload = { [`instruments.${activeInst}.content`]: content };
      }

      await updateDoc(songRef, updatePayload);
      if (activeInst === 'master') {
         setSong(prev => ({ ...prev, masterContent: content, instruments: updatePayload.instruments }));
      } else {
         const snap = await getDoc(songRef);
         if(snap.exists()) setSong({ id: snap.id, ...snap.data() });
      }
      alert("✅ Đã lưu!");
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      alert("Lỗi lưu: " + error.message);
    }
  };

  const handleRefreshClick = async () => {
      setIsRefreshing(true);
      const docRef = doc(db, "hdcg_official_songs", song.id);
      const snap = await getDoc(docRef);
      if (snap.exists()) setSong({ id: snap.id, ...snap.data() });
      setTimeout(() => setIsRefreshing(false), 500);
  };

  const currentInstInfo = INSTRUMENTS.find(i => i.id === activeInst);
  const displayBaseKey = song.writtenKey || "C"; 
  const currentKey = transposeChord(displayBaseKey, transpose);
  const embedUrl = getYouTubeEmbedUrl(song.refLink || "");

  // --- RENDER ---
  return (
    // FIX 1: Dùng maxWidth: 100% để đảm bảo không vượt quá container cha
    <div className="song-viewer" style={{ width: '100%', maxWidth: '100%' }}>
      
      {/* 1. TOP BAR */}
      <div className="song-top-bar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <button className="btn-back" onClick={onBack}>← Danh sách</button>
        <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
            <button onClick={handleRefreshClick} style={{ backgroundColor: '#17a2b8', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ display: 'inline-block', transition: 'transform 0.5s', transform: isRefreshing ? 'rotate(360deg)' : 'rotate(0deg)' }}>🔄</span>
            </button>
            {!isEditing ? (
                <button onClick={() => setIsEditing(true)}>✏️ Sửa ({currentInstInfo.name})</button>
            ) : (
                <>
                    <button onClick={handleSave} className="btn-save">💾 Lưu</button>
                    <button onClick={() => setIsEditing(false)}>Hủy</button>
                </>
            )}
        </div>
      </div>

      {/* 2. THANH NHẠC CỤ (FIX QUAN TRỌNG NHẤT) */}
      {/* maxWidth: 'calc(100vw - 60px)' -> Trừ đi 60px padding của container để ép nó nằm gọn trong màn hình */}
      <div className="inst-bar-scroll" style={{ 
          display: 'flex',
          overflowX: 'auto', 
          whiteSpace: 'nowrap', 
          paddingBottom: '10px', 
          marginBottom: '15px', 
          borderBottom: '1px solid #eee', 
          width: '100%',
          maxWidth: 'calc(100vw - 60px)' // <-- DÒNG NÀY CHỐNG TRÀN
      }}>
        {INSTRUMENTS.map(inst => (
          <button
            key={inst.id}
            onClick={() => setActiveInst(inst.id)}
            style={{
              display: 'inline-block', marginRight: 10, padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s',
              background: activeInst === inst.id ? inst.color : '#f0f0f0',
              color: activeInst === inst.id ? 'white' : '#444',
              opacity: (activeInst !== inst.id && activeInst !== 'master') ? 0.6 : 1,
              flexShrink: 0
            }}
          >
            {inst.name}
          </button>
        ))}
      </div>

      {!isEditing && (
        <>
            {/* HEADER BÀI HÁT */}
            <div id="pdf-header-source" className="song-header">
                {/* word-break để tên bài dài không đẩy khung */}
                <h2 style={{fontSize: '2.5rem', marginBottom: '5px', wordBreak: 'break-word', lineHeight: '1.2'}}>{song.title}</h2>
                <p style={{fontSize: '1.2rem', color: '#666', marginTop: '0'}}>
                    Arranger: {song.author} <br/>
                    <small style={{color: currentInstInfo.color, fontWeight: 'bold'}}>Phiên bản: {currentInstInfo.name}</small>
                </p>
            </div>

            {/* 3. CONTROL ROW (FIX QUAN TRỌNG THỨ 2) */}
            {/* flexWrap: 'wrap' để nút rớt dòng. maxWidth: '100%' để không tràn */}
            <div className="controls-row" style={{
                display: 'flex', 
                gap: '15px', 
                flexWrap: 'wrap', 
                marginTop: '20px', 
                alignItems: 'center',
                width: '90%',
                maxWidth: '100%'
            }}>
                <div className="tone-control">
                    <span>Tone: </span>
                    <button onClick={() => setTranspose(prev => prev - 1)}>&minus;</button>
                    <strong style={{minWidth: '35px', textAlign: 'center', fontSize: '1.4rem', color: 'var(--primary-color)'}}>{currentKey}</strong>
                    <button onClick={() => setTranspose(prev => prev + 1)}>+</button>
                </div>

                <div className="font-control">
                    <span>Chữ: </span>
                    <button onClick={() => setFontSize(prev => Math.max(0.8, prev - 0.1))}>A-</button>
                    <button onClick={() => setFontSize(prev => Math.min(2.5, prev + 0.1))}>A+</button>
                </div>

                <div className="color-picker" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {colorOptions.map(color => (
                        <div key={color} onClick={() => setChordColor(color)} style={{ width: '24px', height: '24px', backgroundColor: color, borderRadius: '50%', border: chordColor === color ? '2px solid #333' : '1px solid #ccc', cursor: 'pointer' }} />
                    ))}
                </div>

                <button onClick={() => setShowChords(!showChords)} style={{backgroundColor: showChords ? '#e8f5e9' : '#ffebee', color: showChords ? '#2e7d32' : '#c62828', padding: '5px 15px', borderRadius: '20px', whiteSpace: 'nowrap'}}>
                    {showChords ? "● Hiện H.Â" : "○ Ẩn H.Â"}
                </button>

                <button onClick={() => setShowMetronome(true)} style={{ backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeeba', borderRadius: '20px', padding: '5px 15px', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
                    ⏱️ Metronome
                </button>
            </div>

            {/* BACKUP ALERT */}
            {activeInst !== 'master' && backupContent && (
                <div style={{ marginTop: 15, padding: '10px', background: '#fff3cd', borderRadius: 5, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '5px' }}>
                    <span>⚠️ Có bản ghi cũ.</span>
                    <button onClick={() => setShowBackup(!showBackup)} style={{padding: '5px 10px', cursor:'pointer'}}>
                        {showBackup ? 'Xem bản hiện tại' : 'Xem bản cũ'}
                    </button>
                </div>
            )}

            {embedUrl && (
                <div className="video-wrapper" style={{marginTop: 20}}>
                    <div className="video-responsive"><iframe src={embedUrl} title="Video" allowFullScreen></iframe></div>
                </div>
            )}

            <hr style={{margin: '30px 0', opacity: 0.3}} />

            {/* CONTENT */}
            <div 
                id="pdf-content-source"
                className="song-content" 
                style={{ 
                    fontSize: `${fontSize}rem`, 
                    lineHeight: `${fontSize * 2.5}`,
                    '--current-font-size': `${fontSize}rem`,
                    '--current-line-height': `${fontSize * 2.5}`,
                    width: '100%',
                    wordBreak: 'break-word', 
                    overflowWrap: 'break-word'
                }}
            >
                {renderContent(showBackup ? backupContent : content)}
            </div>

            {showMetronome && <Metronome onClose={() => setShowMetronome(false)} />}
            <AutoScroll />
            <PrintControl title={`${song.title} - ${currentInstInfo.name}`} chordColor={chordColor} elementId="pdf-source" />
            <ToneControl transpose={transpose} setTranspose={setTranspose} currentKey={currentKey} />
            {selectedChord && <ChordViewer chord={selectedChord} onClose={() => setSelectedChord(null)} />}
        </>
      )}

      {/* EDITOR */}
      {isEditing && (
        <div className="editor-container" style={{marginTop: 20, width: '100%', maxWidth: '100%', boxSizing: 'border-box'}}>
            <div style={{background: '#e9ecef', padding: 15, borderRadius: 8, marginBottom: 20, borderLeft: `5px solid ${currentInstInfo.color}`}}>
                <h3 style={{margin:0}}>Đang chỉnh sửa: {currentInstInfo.name}</h3>
                {activeInst === 'master' && <p style={{margin: '5px 0 0', color: '#d71920'}}>⚠️ Lưu ý: Sửa Master sẽ ghi đè lên tất cả nhạc cụ khác!</p>}
            </div>

            <div className="toolbar" style={{marginTop: '10px', maxWidth: 'calc(100vw - 60px)', overflowX: 'auto'}}>
                <div className="chord-buttons" style={{ position: 'sticky', top: 0, background: 'white', zIndex: 10, overflowX: 'auto', whiteSpace: 'nowrap', padding: '5px 0', display: 'flex', gap: '5px' }}>
                    {chordsList.map(c => <button key={c} onClick={() => smartInsert(`[${c}]`)}>{c}</button>)}
                    <button onClick={() => smartInsert('/', '/')} style={{ fontWeight: 'bold', minWidth: '60px' }}>+Note</button>
                    <button onClick={() => smartInsert('`', '`')} style={{ minWidth: '70px' }}><b>In đậm</b></button>
                </div>
            </div>

            <textarea 
                id="song-textarea" 
                placeholder="Nhập lời và hợp âm..." 
                value={content} 
                onChange={e => setContent(e.target.value)}
                style={{ fontFamily: 'Courier New, monospace', fontSize: '1.3rem', lineHeight: '1.8', border: '2px solid #eee', borderRadius: '8px', padding: '20px', width: '100%', minHeight: '500px', boxSizing: 'border-box' }}
            />
        </div>
      )}

      <style>{`
        @media (max-width: 600px) {
          .inst-bar-scroll::-webkit-scrollbar { display: none; }
          .song-header h2 { font-size: 2rem !important; }
        }
      `}</style>
    </div>
  );
};

export default OfficialSongDetail; 