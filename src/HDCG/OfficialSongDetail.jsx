import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from '../firebase';
import { INSTRUMENTS } from './constants';

// Import logic từ src gốc
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
  const [song, setSong] = useState(initialSong);
  const [activeInst, setActiveInst] = useState('master');
  const [content, setContent] = useState('');
  const [backupContent, setBackupContent] = useState(null);

  // States UI
  const [isEditing, setIsEditing] = useState(false);
  const [transpose, setTranspose] = useState(0);
  const [fontSize, setFontSize] = useState(1.2);
  const [showChords, setShowChords] = useState(true);
  const [selectedChord, setSelectedChord] = useState(null);
  const [chordColor, setChordColor] = useState('#d71920');
  const [showMetronome, setShowMetronome] = useState(false);
  const [showBackup, setShowBackup] = useState(false);

  // 1. Load dữ liệu
  useEffect(() => {
    const fetchFresh = async () => {
      const docRef = doc(db, "hdcg_official_songs", song.id);
      const snap = await getDoc(docRef);
      if (snap.exists()) setSong({ id: snap.id, ...snap.data() });
    }
    fetchFresh();
  }, [song.id]);

  // 2. Chuyển nhạc cụ
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

  // --- FIX 2: BỎ STYLE MÀU CHỮ CỨNG (Để nó ăn theo class .chord màu trắng trong App.css) ---
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
            style={{ 
              cursor: 'pointer', 
              backgroundColor: chordColor,
              /* Đã xóa dòng color: '...' để chữ hiện màu trắng */
            }}
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

  const currentInstInfo = INSTRUMENTS.find(i => i.id === activeInst);
  const displayBaseKey = song.writtenKey || "C";
  const currentKey = transposeChord(displayBaseKey, transpose);
  const embedUrl = getYouTubeEmbedUrl(song.refLink || "");

  return (
    // --- FIX 1: THÊM STYLE CHO CONTAINER CHÍNH ĐỂ KHÔNG BỊ TRÀN ---
    <div className="song-viewer fade-in" style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
      
      <div className="song-top-bar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
        <button className="btn-back" onClick={onBack}>← Danh sách</button>
        <div style={{display: 'flex', gap: '10px'}}>
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

      {/* --- FIX 1: THÊM MAX-WIDTH CHO THANH CUỘN NHẠC CỤ --- */}
      <div className="inst-bar-scroll" style={{ 
          overflowX: 'auto', 
          whiteSpace: 'nowrap', 
          paddingBottom: 10, 
          marginBottom: 15, 
          borderBottom: '1px solid #eee',
          maxWidth: '100%', // QUAN TRỌNG: Ngăn tràn màn hình
          width: '100%' 
      }}>
        {INSTRUMENTS.map(inst => (
          <button
            key={inst.id}
            onClick={() => setActiveInst(inst.id)}
            style={{
              display: 'inline-block',
              marginRight: 10,
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              background: activeInst === inst.id ? inst.color : '#f0f0f0',
              color: activeInst === inst.id ? 'white' : '#444',
              opacity: (activeInst !== inst.id && activeInst !== 'master') ? 0.6 : 1,
              transition: '0.3s'
            }}
          >
            {inst.name}
          </button>
        ))}
      </div>

      {!isEditing && (
        <>
            <div id="pdf-header-source" className="song-header">
                <h2 style={{fontSize: '2.5rem', marginBottom: '5px'}}>{song.title} <small style={{fontSize:'1rem', color: currentInstInfo.color}}>({currentInstInfo.name})</small></h2>
                <p style={{fontSize: '1.2rem', color: '#666', marginTop: '0'}}>Arranger: {song.author}</p>
            </div>

            {activeInst !== 'master' && backupContent && (
                <div style={{ marginBottom: 10, padding: '5px 10px', background: '#fff3cd', borderRadius: 5, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>⚠️ Có bản ghi cũ.</span>
                    <button onClick={() => setShowBackup(!showBackup)} style={{padding: '2px 8px', fontSize: '0.8rem'}}>
                        {showBackup ? 'Xem bản hiện tại' : 'Xem bản cũ'}
                    </button>
                </div>
            )}

            {embedUrl && (
                <div className="video-wrapper">
                <div className="video-responsive">
                    <iframe src={embedUrl} title="Video" allowFullScreen></iframe>
                </div>
                </div>
            )}

            {/* --- FIX 1: THÊM STYLE ĐỂ CONTROL KHÔNG BỊ PHÌNH TO --- */}
            <div className="controls-row" style={{
                display: 'flex', 
                gap: '20px', 
                flexWrap: 'wrap', 
                marginTop: '20px',
                width: '100%',       // Ép chiều rộng bằng cha
                boxSizing: 'border-box' // Tính padding vào trong width
            }}>
                <div className="tone-control">
                    <span>Tone: </span>
                    <button onClick={() => setTranspose(prev => prev - 1)}>&minus;</button>
                    <strong style={{minWidth: '40px', textAlign: 'center', fontSize: '1.4rem', color: 'var(--primary-color)'}}>{currentKey}</strong>
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

                <button onClick={() => setShowChords(!showChords)} style={{backgroundColor: showChords ? '#e8f5e9' : '#ffebee', color: showChords ? '#2e7d32' : '#c62828', padding: '5px 15px', borderRadius: '20px'}}>
                    {showChords ? "● Hiện H.Â" : "○ Ẩn H.Â"}
                </button>

                <button onClick={() => setShowMetronome(true)} style={{ backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeeba', borderRadius: '20px', padding: '5px 15px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    ⏱️ Metronome
                </button>
            </div>

            <hr style={{margin: '30px 0', opacity: 0.3}} />

            <div 
                id="pdf-content-source"
                className="song-content" 
                style={{ 
                    fontSize: `${fontSize}rem`, 
                    lineHeight: `${fontSize * 2.5}`,
                    '--current-font-size': `${fontSize}rem`,
                    '--current-line-height': `${fontSize * 2.5}`
                }}
            >
                {renderContent(showBackup ? backupContent : content)}
            </div>

            {showMetronome && <Metronome onClose={() => setShowMetronome(false)} />}
            <AutoScroll />
            <PrintControl title={`${song.title} - ${currentInstInfo.name}`} chordColor={chordColor} />
            <ToneControl transpose={transpose} setTranspose={setTranspose} currentKey={currentKey} />
            {selectedChord && <ChordViewer chord={selectedChord} onClose={() => setSelectedChord(null)} />}
        </>
      )}

      {isEditing && (
        <div className="editor-container" style={{marginTop: 20}}>
            <div style={{background: '#e9ecef', padding: 10, borderRadius: 8, marginBottom: 20, borderLeft: `5px solid ${currentInstInfo.color}`}}>
                <strong>Đang chỉnh sửa: {currentInstInfo.name}</strong>
                {activeInst === 'master' && <p style={{margin: '5px 0 0', fontSize: '0.9rem', color: '#d71920'}}>⚠️ Lưu ý: Sửa Master sẽ ghi đè lên tất cả nhạc cụ khác!</p>}
            </div>

            <div className="toolbar" style={{marginTop: '10px'}}>
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
                style={{
                    fontFamily: 'Courier New, monospace',
                    fontSize: '1.3rem',
                    lineHeight: '1.8',
                    border: '2px solid #eee',
                    borderRadius: '8px',
                    padding: '20px',
                    width: '100%',
                    minHeight: '500px',
                    boxSizing: 'border-box'
                }}
            />
        </div>
      )}

      {/* CSS Mobile Fix Bổ sung */}
      <style>{`
        @media (max-width: 600px) {
          .song-viewer { padding: 5px; width: 100%; overflow-x: hidden; }
          .inst-bar-scroll::-webkit-scrollbar { display: none; }
          .controls-row { overflow-x: auto; padding-bottom: 5px; flex-wrap: nowrap !important; }
          .chord-buttons { overflow-x: auto; }
        }
      `}</style>
    </div>
  );
};

export default OfficialSongDetail;