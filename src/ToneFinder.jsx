import React, { useState, useEffect, useRef } from 'react';
import myLogo from './assets/logonoback.png';

const ToneFinder = ({ onBack }) => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  
  // --- STATE CHO TAP TEMPO ---
  const [tapBpm, setTapBpm] = useState(0);
  const lastTapTime = useRef(0);
  const tapTimes = useRef([]);
  const essentiaRef = useRef(null);

  // Hàm Reset Tap Tempo
  const resetTap = () => {
    setTapBpm(0);
    lastTapTime.current = 0;
    tapTimes.current = [];
  };

  // Hàm xử lý Tap
  const handleTap = () => {
    const now = Date.now();
    if (lastTapTime.current === 0 || (now - lastTapTime.current > 3000)) {
      lastTapTime.current = now;
      tapTimes.current = [];
      setTapBpm(0);
      return;
    }

    const delta = now - lastTapTime.current;
    tapTimes.current.push(delta);
    if (tapTimes.current.length > 4) tapTimes.current.shift();

    const avgDelta = tapTimes.current.reduce((a, b) => a + b, 0) / tapTimes.current.length;
    setTapBpm(Math.round(60000 / avgDelta));
    lastTapTime.current = now;
  };

  // Logic map Tone Song Song (Relative Key)
  const getRelativeKey = (key, scale) => {
    const majorToMinor = { "C": "A", "C#": "A#", "Db": "Bb", "D": "B", "D#": "C", "Eb": "C", "E": "C#", "F": "D", "F#": "D#", "Gb": "Eb", "G": "E", "G#": "F", "Ab": "F", "A": "F#", "A#": "G", "Bb": "G", "B": "G#" };
    const minorToMajor = { "A": "C", "A#": "C#", "Bb": "Db", "B": "D", "C": "D#", "C#": "E", "D": "F", "D#": "F#", "Eb": "Gb", "E": "G", "F": "G#", "F#": "A", "G": "A#", "G#": "B" };
    if (scale === "major") return { key: majorToMinor[key] || "?", scale: "minor" };
    else return { key: minorToMajor[key] || "?", scale: "major" };
  };

  useEffect(() => {
    const initEssentia = async () => {
      if (!window.EssentiaWASM || !window.Essentia) { setTimeout(initEssentia, 500); return; }
      try {
        if (essentiaRef.current) return;
        const wasmModule = await window.EssentiaWASM({ essentiaWasm: '/essentia-wasm.web.wasm' });
        essentiaRef.current = new window.Essentia(wasmModule);
      } catch (e) { console.error(e); setError("Lỗi load thư viện."); }
    };
    initEssentia();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null); setError(''); 
    }
  };

  const processAudio = async () => {
    if (!file) { alert("Chưa chọn file!"); return; }
    if (!essentiaRef.current) { alert("Đang tải..."); return; }
    setLoading(true);
    
    try {
      setProgress("Đang đọc file...");
      const arrayBuffer = await file.arrayBuffer();
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const duration = 60; 
      const offlineCtx = new OfflineAudioContext(1, 44100 * duration, 44100);
      const source = offlineCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineCtx.destination);
      source.start(0);
      const renderedBuffer = await offlineCtx.startRendering();
      const vectorInput = essentiaRef.current.arrayToVector(renderedBuffer.getChannelData(0));

      setProgress("Đang dò Tone...");
      const keyData = essentiaRef.current.KeyExtractor(vectorInput);

      if (!keyData) throw new Error("Failed");

      const relative = getRelativeKey(keyData.key, keyData.scale);

      setResult({
        primary: { key: keyData.key, scale: keyData.scale },
        relative: { key: relative.key, scale: relative.scale },
        confidence: (keyData.strength * 100).toFixed(0)
      });
      
    } catch (err) { console.error(err); alert("Lỗi: " + err.message); } 
    finally { setLoading(false); }
  };

  return (
    <div className="container" style={{ textAlign: 'center', minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <div className="logo-container" style={{ marginBottom: '20px' }}>
        <img src={myLogo} alt="Logo" className="app-logo" style={{height: '100px'}} />
      </div>
      
      <h1 style={{ color: '#d71920', margin: '0 0 10px 0', fontSize: '1.5rem' }}>Khang Tone Analyzer 🎛️</h1>
      
      <div className="finder-box">
        <label htmlFor="audio-upload" className="upload-btn">
          {file ? `📂 ${file.name}` : '🎵 Chọn file nhạc (MP3/WAV)'}
        </label>
        <input id="audio-upload" type="file" accept="audio/*" onChange={handleFileChange} style={{display: 'none'}} />

        {file && (
          <button onClick={processAudio} disabled={loading} className="btn-detect">
            {loading ? `⏳ ${progress}` : '🔍 DÒ TONE NGAY'}
          </button>
        )}
      </div>

      <div className="result-container fade-in" style={{width: '90%', maxWidth: '600px', marginTop: '30px'}}>
        
        {/* KHU VỰC 1: KẾT QUẢ TONE (Đã đổi màu) */}
        {result && (
          <div className="result-card tone-card">
            <div className="section-title">KẾT QUẢ PHÂN TÍCH</div>
            
            <div className="tone-options">
              {/* Ô 1: Máy đo được - Màu Xanh */}
              <div className="tone-option primary">
                  <span className="tag">MÁY ĐO ĐƯỢC</span>
                  <div className="key-display">{result.primary.key} <small>{result.primary.scale}</small></div>
              </div>

              {/* Ô 2: Song song - Màu Tím/Hồng */}
              <div className="tone-option secondary">
                  <span className="tag">KEY SONG SONG</span>
                  <div className="key-display">{result.relative.key} <small>{result.relative.scale}</small></div>
              </div>
            </div>

            <div style={{marginTop: '15px', fontSize: '0.8rem', color: '#aaa'}}>
                Độ chính xác: {result.confidence}%
            </div>
          </div>
        )}

        {/* KHU VỰC 2: TAP TEMPO */}
        <div className="result-card bpm-card" style={{marginTop: '20px'}}>
           <div className="section-title">TAP TEMPO (THỦ CÔNG)</div>
           <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '15px'}}>
             Nghe nhạc và gõ phím <b>Space</b> (Cách) hoặc bấm nút <b>TAP</b> theo nhịp
           </p>
           
           <div className="bpm-tapper-layout">
              <button 
                className="tap-btn" 
                onClick={handleTap} 
                ref={(btn) => { if (btn) btn.focus(); }}
                onKeyDown={(e) => { if(e.code === 'Space') { e.preventDefault(); handleTap(); } }}
              >
                TAP
              </button>

              <div className="bpm-display-box">
                  <div className="bpm-value">{tapBpm > 0 ? tapBpm : '--'}</div>
                  <div className="bpm-unit">BPM</div>
              </div>

              <button className="reset-btn" onClick={resetTap} title="Làm lại từ đầu">
                 ↺ Reset
              </button>
           </div>
        </div>

      </div>

      <button onClick={onBack} className="btn-back-home">← Quay về trang chủ</button>

      <style>{`
        .finder-box { width: 100%; max-width: 500px; display: flex; flex-direction: column; gap: 15px; align-items: center; }
        .upload-btn { display: inline-block; padding: 20px; background: #f0f0f0; border: 2px dashed #aaa; border-radius: 15px; cursor: pointer; width: 100%; box-sizing: border-box; }
        .upload-btn:hover { border-color: #d71920; color: #d71920; background: #fff0f0; }
        .btn-detect { padding: 15px 40px; border-radius: 50px; background: #d71920; color: white; border: none; font-weight: bold; cursor: pointer; width: 100%; }
        
        .result-card { background: white; padding: 25px; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
        .section-title { font-size: 0.9rem; font-weight: bold; color: #999; letter-spacing: 1px; margin-bottom: 20px; text-transform: uppercase; }
        
        /* --- CSS CHO 2 Ô TONE MỚI --- */
        .tone-options { display: flex; gap: 20px; }
        
        .tone-option { 
            flex: 1; padding: 20px; border-radius: 15px; 
            border: 2px solid transparent; 
            position: relative; 
            transition: transform 0.2s;
        }
        .tone-option:hover { transform: translateY(-3px); }

        /* Ô Màu Xanh (Primary) */
        .tone-option.primary { 
            background: #e3f2fd; /* Xanh nhạt */
            border-color: #2196f3; /* Viền xanh đậm */
            color: #0d47a1;
        }
        .tone-option.primary .tag { background: #2196f3; color: white; }

        /* Ô Màu Tím/Hồng (Secondary) */
        .tone-option.secondary { 
            background: #f3e5f5; /* Tím nhạt */
            border-color: #ab47bc; /* Viền tím đậm */
            color: #4a148c;
        }
        .tone-option.secondary .tag { background: #ab47bc; color: white; }

        .tag { font-size: 0.7rem; font-weight: bold; padding: 5px 10px; border-radius: 20px; text-transform: uppercase; display: inline-block; margin-bottom: 5px;}
        .key-display { font-size: 2.2rem; font-weight: 900; margin-top: 5px; line-height: 1.2; }
        .key-display small { font-size: 1rem; font-weight: normal; text-transform: uppercase; margin-left: 5px; opacity: 0.8; }

        /* Tap Tempo CSS */
        .bpm-tapper-layout { display: flex; align-items: center; justify-content: center; gap: 20px; }
        .tap-btn { 
            width: 90px; height: 90px; border-radius: 50%; 
            background: linear-gradient(145deg, #d71920, #b71c1c);
            color: white; font-weight: bold; font-size: 1.4rem; 
            border: 4px solid #ff8a80; cursor: pointer; 
            box-shadow: 0 5px 15px rgba(215, 25, 32, 0.4);
            transition: transform 0.1s;
        }
        .tap-btn:active { transform: scale(0.92); background: #b71c1c; }
        .bpm-display-box { text-align: center; min-width: 100px; }
        .bpm-value { font-size: 3.5rem; font-weight: 900; color: #333; line-height: 1; }
        .bpm-unit { font-size: 0.9rem; color: #888; font-weight: bold; }
        .reset-btn { width: 50px; height: 50px; border-radius: 50%; background: #f0f0f0; color: #666; border: none; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-direction: column; transition: 0.2s; }
        .reset-btn:hover { background: #e0e0e0; color: #333; }

        .btn-back-home { margin-top: 30px; background: none; border: none; color: #888; cursor: pointer; }
        .btn-back-home:hover { color: #d71920; text-decoration: underline; }
      `}</style>
    </div>
  );
};

export default ToneFinder;