import React, { useState, useEffect } from 'react';

// Import cả 2 database
import { guitarChords } from './ChordData/guitarChords';
import { pianoChords } from './ChordData/pianoChords';

const ChordViewer = ({ chord, onClose }) => {
  const [instrument, setInstrument] = useState('guitar'); // 'guitar' hoặc 'piano'
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  // Hàm tìm dữ liệu
  const lookupChord = (chordName, db) => {
    if (!db) return null;
    let cleanChord = chordName.trim();
    let result = db[cleanChord];

    if (!result) {
      const altMap = { 
        "G#": "Ab", "Ab": "G#", "A#": "Bb", "Bb": "A#", 
        "C#": "Db", "Db": "C#", "D#": "Eb", "Eb": "D#", "F#": "Gb", "Gb": "F#"
      };
      const match = cleanChord.match(/^([A-G][#b]?)(.*)$/);
      if (match) {
        const note = match[1];
        const suffix = match[2];
        const altNote = altMap[note];
        if (altNote) result = db[`${altNote}${suffix}`];
      }
    }
    return result;
  };

  useEffect(() => {
    if (!chord) return;
    setData(null); // Reset để tránh lỗi render cũ

    const currentDB = instrument === 'guitar' ? guitarChords : pianoChords;
    const result = lookupChord(chord, currentDB);

    if (result) {
      setData(result);
      setError('');
    } else {
      setError(`Chưa có thế tay ${instrument === 'guitar' ? 'Guitar' : 'Piano'} cho [${chord}]`);
      setData(null);
    }
  }, [chord, instrument]);

  if (!chord) return null;

  return (
    <div className="chord-modal-overlay" onClick={onClose}>
      {/* Tăng chiều rộng modal một chút để chứa vừa piano 3 quãng */}
      <div className="chord-modal-content" onClick={(e) => e.stopPropagation()} style={{width: instrument === 'piano' ? 'auto' : '320px', maxWidth: '95vw'}}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        <h2 className="chord-title">{chord}</h2>

        <div className="instrument-toggle">
          <button 
            className={`toggle-btn ${instrument === 'guitar' ? 'active' : ''}`}
            onClick={() => setInstrument('guitar')}
          >
            🎸 Guitar
          </button>
          <button 
            className={`toggle-btn ${instrument === 'piano' ? 'active' : ''}`}
            onClick={() => setInstrument('piano')}
          >
            🎹 Piano
          </button>
        </div>

        <div className="chord-body">
          {error ? (
            <div className="error-msg">
              <p>{error}</p>
              <p style={{fontSize: '0.8rem', color: '#999', fontWeight: 'normal'}}>
                Dữ liệu đang được cập nhật...
              </p>
            </div>
          ) : (
            data && (
              <div className="diagram-container fade-in" style={{overflowX: 'auto'}}>
                {/* RENDER GUITAR */}
                {instrument === 'guitar' && data.frets ? (
                   <GuitarSVG frets={data.frets} fingers={data.fingers} baseFret={data.baseFret} />
                ) : null}

                {/* RENDER PIANO (3 Quãng Tám) */}
                {instrument === 'piano' && Array.isArray(data) ? (
                   <PianoSVG keys={data} />
                ) : null}
                
                <div className="meta-info">
                  <span>{instrument === 'guitar' ? 'Thế tay Guitar' : 'Phím đàn Piano'}</span>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <style>{`
        .chord-modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999; animation: fadeIn 0.2s ease-out;
        }
        .chord-modal-content {
          background: white; padding: 25px;
          border-radius: 24px; text-align: center; position: relative;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          transition: width 0.3s ease; /* Hiệu ứng chuyển đổi kích thước */
        }
        .close-btn {
          position: absolute; top: 10px; right: 15px;
          background: #f0f0f0; border: none; font-size: 24px; color: #555;
          width: 36px; height: 36px; border-radius: 50%;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: 0.2s; z-index: 10;
        }
        .close-btn:hover { background: #d71920; color: white; transform: rotate(90deg); }
        .chord-title {
          margin: 0 0 15px 0; color: #333; font-size: 3.5rem; font-weight: 800;
          letter-spacing: -1px;
        }
        .instrument-toggle {
          display: flex; background: #f0f0f0; padding: 4px; border-radius: 12px;
          margin-bottom: 20px; max-width: 300px; margin-left: auto; margin-right: auto;
        }
        .toggle-btn {
          flex: 1; padding: 8px 0; border: none; background: transparent;
          font-weight: bold; color: #666; cursor: pointer; border-radius: 10px;
          transition: 0.2s; font-size: 0.9rem;
        }
        .toggle-btn.active {
          background: white; color: #d71920; box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .meta-info { margin-top: 15px; font-weight: bold; color: #888; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px; }
        .error-msg { color: #d71920; font-weight: bold; margin-top: 20px; }
        
        /* Tùy chỉnh thanh cuộn cho piano dài */
        .diagram-container::-webkit-scrollbar { height: 8px; }
        .diagram-container::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};

// --- COMPONENT GUITAR (Giữ nguyên) ---
const GuitarSVG = ({ frets, fingers, baseFret = 1 }) => {
  const width = 200; const height = 240;
  const marginX = 40; const marginY = 40;
  const stringSpacing = (width - 2 * marginX) / 5;
  const fretSpacing = (height - 2 * marginY) / 5;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{margin: '0 auto', display: 'block'}}>
      {baseFret === 1 && <rect x={marginX} y={marginY - 8} width={width - 2 * marginX} height={10} fill="#333" rx="2" />}
      {baseFret > 1 && <text x={marginX - 20} y={marginY + fretSpacing / 2 + 5} fontSize="18" fontWeight="bold" fill="#333" fontFamily="Arial">{baseFret}fr</text>}
      {[0, 1, 2, 3, 4, 5].map(i => (<line key={`str-${i}`} x1={marginX + i * stringSpacing} y1={marginY} x2={marginX + i * stringSpacing} y2={height - marginY} stroke="#999" strokeWidth={i === 5 ? 1 : i === 0 ? 2.5 : 1.5} />))}
      {[0, 1, 2, 3, 4, 5].map(i => (<line key={`fret-${i}`} x1={marginX} y1={marginY + i * fretSpacing} x2={width - marginX} y2={marginY + i * fretSpacing} stroke="#ddd" strokeWidth="2" strokeLinecap="round" />))}
      {frets && frets.map((fret, stringIndex) => {
        const x = marginX + stringIndex * stringSpacing;
        if (fret === 0) return <circle key={`o-${stringIndex}`} cx={x} cy={marginY - 15} r="5" stroke="#444" strokeWidth="2" fill="white" />;
        if (fret === -1) return <g key={`x-${stringIndex}`}><line x1={x-6} y1={marginY-21} x2={x+6} y2={marginY-9} stroke="#888" strokeWidth="3" /><line x1={x+6} y1={marginY-21} x2={x-6} y2={marginY-9} stroke="#888" strokeWidth="3" /></g>;
        const relativeFret = fret - (baseFret - 1);
        if (relativeFret >= 1 && relativeFret <= 5) {
           const y = marginY + relativeFret * fretSpacing - (fretSpacing / 2);
           return <g key={`n-${stringIndex}`}><circle cx={x} cy={y+2} r="14" fill="rgba(0,0,0,0.2)" /><circle cx={x} cy={y} r="14" fill="#d71920" />{fingers && fingers[stringIndex] > 0 && <text x={x} y={y + 5} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial">{fingers[stringIndex]}</text>}</g>;
        }
        return null;
      })}
    </svg>
  );
};

// --- COMPONENT PIANO (ĐÃ NÂNG CẤP LÊN 3 QUÃNG TÁM) ---
const PianoSVG = ({ keys }) => {
  const whiteKeyWidth = 24; const whiteKeyHeight = 120;
  const blackKeyWidth = 16; const blackKeyHeight = 75;
  
  // An toàn dữ liệu
  const safeKeys = Array.isArray(keys) ? keys : [];

  // Pattern vị trí phím đen (Offset chuẩn)
  const pattern = [
    { type: 0 }, 
    { type: 1, offset: 16 },  // C#
    { type: 0 }, 
    { type: 1, offset: 40 },  // D#
    { type: 0 }, 
    { type: 0 }, 
    { type: 1, offset: 88 },  // F#
    { type: 0 }, 
    { type: 1, offset: 112 }, // G#
    { type: 0 }, 
    { type: 1, offset: 136 }, // A#
    { type: 0 }
  ];

  const renderKeys = [];
  let whiteCount = 0;

  // --- THAY ĐỔI Ở ĐÂY: Lặp 3 quãng tám (36 phím) ---
  for (let i = 0; i < 36; i++) {
    const noteInOctave = i % 12;
    const config = pattern[noteInOctave];
    
    const isHighlight = safeKeys.includes(i); 
    
    let x = 0, w = 0, h = 0, zIndex = 0, fill = "";

    if (config.type === 0) {
      x = whiteCount * whiteKeyWidth; w = whiteKeyWidth; h = whiteKeyHeight; zIndex = 1;
      fill = isHighlight ? "#d71920" : "white";
      whiteCount++;
    } else {
      const octaveIndex = Math.floor(i / 12);
      // Logic tính toán tự động mở rộng theo số quãng
      const baseOffset = octaveIndex * (7 * whiteKeyWidth);
      x = baseOffset + config.offset; w = blackKeyWidth; h = blackKeyHeight; zIndex = 2;
      fill = isHighlight ? "#d71920" : "#333";
    }

    renderKeys.push({ i, x, y: 0, width: w, height: h, fill, zIndex, type: config.type });
  }

  // --- THAY ĐỔI Ở ĐÂY: Tổng chiều rộng = 7 phím trắng * 3 quãng = 21 phím ---
  const totalWidth = 21 * whiteKeyWidth;

  return (
    // Thêm padding để không bị cắt viền
    <svg width={totalWidth + 2} height={whiteKeyHeight + 2} style={{margin: '0 auto', display: 'block', overflow: 'visible', padding: '1px'}}>
      {/* Vẽ phím trắng trước */}
      {renderKeys.filter(k => k.type === 0).map(k => (
        <rect key={k.i} x={k.x} y={k.y} width={k.width} height={k.height} fill={k.fill} stroke="#ccc" strokeWidth="1" rx="3" />
      ))}
      {/* Vẽ phím đen sau (để đè lên) */}
      {renderKeys.filter(k => k.type === 1).map(k => (
        <rect key={k.i} x={k.x} y={k.y} width={k.width} height={k.height} fill={k.fill} stroke="#ccc" strokeWidth="1" rx="2" />
      ))}
    </svg>
  );
};

export default ChordViewer;