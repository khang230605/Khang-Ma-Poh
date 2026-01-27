import React, { useState, useEffect, useRef } from 'react';

const Metronome = ({ onClose }) => {
  const [bpm, setBpm] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Refs Audio
  const audioContext = useRef(null);
  const nextNoteTime = useRef(0);
  const timerID = useRef(null);
  const bpmRef = useRef(bpm); 

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext.current = new AudioContext();
    return () => {
      setIsPlaying(false);
      if (timerID.current) clearTimeout(timerID.current);
      if (audioContext.current) audioContext.current.close();
    };
  }, []);

  const playBeep = (time) => {
    const osc = audioContext.current.createOscillator();
    const gain = audioContext.current.createGain();
    osc.connect(gain);
    gain.connect(audioContext.current.destination);
    osc.frequency.value = 1000; 
    gain.gain.value = 1;
    osc.start(time);
    osc.stop(time + 0.1); 
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
  };

  const scheduler = () => {
    const secondsPerBeat = 60.0 / bpmRef.current;
    const scheduleAheadTime = 0.1; 

    while (nextNoteTime.current < audioContext.current.currentTime + scheduleAheadTime) {
      playBeep(nextNoteTime.current);
      nextNoteTime.current += secondsPerBeat;
    }
    timerID.current = setTimeout(scheduler, 25);
  };

  const togglePlay = () => {
    if (isPlaying) {
      clearTimeout(timerID.current);
      setIsPlaying(false);
    } else {
      if (audioContext.current.state === 'suspended') {
        audioContext.current.resume();
      }
      nextNoteTime.current = audioContext.current.currentTime + 0.05;
      scheduler();
      setIsPlaying(true);
    }
  };

  const changeBpm = (amount) => {
    setBpm(prev => Math.max(30, Math.min(250, prev + amount)));
  };

  return (
    <div className="metronome-overlay">
      <div className="metronome-dialog">
        <div className="metronome-header">
          <h3>⏱️ Metronome</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="metronome-visual">
            <div className="visual-track">
                {/* Vạch TRÁI & PHẢI */}
                <div className="marker left"></div>
                <div className="marker right"></div>
                
                {/* Vạch GIỮA (Có hiệu ứng chớp) */}
                {/* Ta truyền animationDuration vào đây để nó chớp đồng bộ với chấm tròn */}
                <div 
                    className={`marker center ${isPlaying ? 'flashing' : ''}`}
                    style={{ animationDuration: `${60 / bpm}s` }}
                ></div>
                
                {/* Chấm tròn di chuyển */}
                <div 
                    className={`visual-dot ${isPlaying ? 'animating' : ''}`}
                    style={{ animationDuration: `${60 / bpm}s` }}
                ></div>
            </div>
        </div>

        <div className="bpm-display">
          <div className="bpm-number">{bpm}</div>
          <div className="bpm-label">BPM</div>
        </div>

        <div className="metronome-controls">
          <button className="adjust-btn" onClick={() => changeBpm(-5)}>-5</button>
          <button className="adjust-btn" onClick={() => changeBpm(-1)}>-</button>
          
          <button 
            className={`play-btn ${isPlaying ? 'playing' : ''}`} 
            onClick={togglePlay}
          >
            {isPlaying ? "STOP ⏹" : "START ▶"}
          </button>

          <button className="adjust-btn" onClick={() => changeBpm(1)}>+</button>
          <button className="adjust-btn" onClick={() => changeBpm(5)}>+5</button>
        </div>

        <input 
          type="range" min="30" max="250" value={bpm} 
          onChange={(e) => setBpm(Number(e.target.value))}
          className="bpm-slider"
        />
      </div>

      <style>{`
        .metronome-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
          animation: fadeIn 0.2s ease-out;
        }

        .metronome-dialog {
          background: white;
          padding: 25px;
          border-radius: 16px;
          width: 340px; 
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          text-align: center;
          position: relative;
          animation: scaleUp 0.2s ease-out;
        }

        /* --- VISUAL --- */
        .metronome-visual {
            margin: 20px 0;
            padding: 10px 0;
            display: flex;
            justify-content: center;
        }

        .visual-track {
            position: relative;
            width: 100%;
            height: 40px; 
            border-bottom: 2px solid #eee;
            display: flex;
            align-items: flex-end;
        }

        .marker {
            position: absolute;
            bottom: 0;
            width: 2px;
            height: 15px;
            background-color: #ccc;
            transform-origin: bottom; /* Để khi scale thì nó mọc lên trên */
            transition: background-color 0.1s;
        }
        .marker.left { left: 0; height: 25px; background-color: #333; } 
        .marker.right { right: 0; height: 25px; background-color: #333; }
        
        /* Style riêng cho vạch giữa */
        .marker.center { 
            left: 50%; 
            transform: translateX(-50%); 
            height: 20px; /* Cao hơn vạch thường tí cho đẹp */
        }

        /* Hiệu ứng chớp (Flash) cho vạch giữa */
        .marker.center.flashing {
            animation-name: flashMarker;
            animation-timing-function: linear; /* Quan trọng để đồng bộ thời gian */
            animation-iteration-count: infinite;
            animation-direction: alternate; /* Chớp khi đi -> và cả khi đi <- */
        }

        .visual-dot {
            position: absolute;
            bottom: -6px; 
            left: 0;
            width: 14px;
            height: 14px;
            background-color: #d71920;
            border-radius: 50%;
            box-shadow: 0 2px 5px rgba(215, 25, 32, 0.5);
            opacity: 0.3; 
            transition: opacity 0.2s;
        }

        .visual-dot.animating {
            opacity: 1;
            animation-name: pendulum;
            animation-timing-function: ease-in-out; 
            animation-iteration-count: infinite;
            animation-direction: alternate; 
        }

        /* --- KEYFRAMES --- */
        
        /* Chấm tròn chạy qua lại */
        @keyframes pendulum {
            from { left: 0%; transform: translateX(0); }
            to { left: 100%; transform: translateX(-100%); }
        }

        /* Vạch giữa chớp sáng đúng lúc 50% (khi chấm tròn đi qua) */
        @keyframes flashMarker {
            0%, 45%, 55%, 100% {
                background-color: #ccc;
                transform: translateX(-50%) scaleY(1);
                box-shadow: none;
            }
            50% {
                background-color: #28a745; /* Đổi màu xanh lá hoặc đỏ khi chạm */
                transform: translateX(-50%) scaleY(1.5); /* Vạch dài ra */
                box-shadow: 0 0 8px #28a745; /* Phát sáng */
            }
        }

        /* Các style khác giữ nguyên */
        .metronome-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        .metronome-header h3 { margin: 0; color: #333; }
        .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999; padding: 0 5px; }
        .close-btn:hover { color: #333; }
        .bpm-display { margin-bottom: 20px; }
        .bpm-number { font-size: 3.5rem; font-weight: 800; color: #d71920; line-height: 1; }
        .bpm-label { font-size: 0.9rem; color: #666; font-weight: bold; letter-spacing: 1px; }
        .metronome-controls { display: flex; justify-content: space-between; align-items: center; gap: 5px; margin-bottom: 20px; }
        .adjust-btn { width: 40px; height: 40px; border-radius: 8px; border: 1px solid #ddd; background: #f8f9fa; font-weight: bold; color: #555; cursor: pointer; }
        .adjust-btn:active { background: #e2e6ea; transform: scale(0.95); }
        .play-btn { flex-grow: 1; height: 50px; border-radius: 25px; border: none; background: #28a745; color: white; font-weight: bold; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 10px rgba(40,167,69,0.3); margin: 0 10px; }
        .play-btn.playing { background: #dc3545; box-shadow: 0 4px 10px rgba(220,53,69,0.3); animation: pulse 1s infinite; }
        .bpm-slider { width: 100%; height: 6px; background: #ddd; border-radius: 3px; accent-color: #d71920; cursor: pointer; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.9); } to { transform: scale(1); } }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.8; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default Metronome;