// src/components/AutoScroll.jsx
import React, { useState, useEffect } from 'react';

const AutoScroll = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(3); // Tốc độ mặc định (1-10)

  useEffect(() => {
    let scrollInterval = null;

    if (isPlaying) {
      // Công thức tính tốc độ:
      // Tốc độ càng cao -> thời gian chờ (delay) càng thấp
      // Speed 1: 100ms/lần cuộn | Speed 10: 10ms/lần cuộn
      const delay = 110 - (speed * 10); 

      scrollInterval = setInterval(() => {
        // Cuộn xuống 1px
        window.scrollBy(0, 1);

        // Kiểm tra nếu đã chạm đáy thì dừng
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
          setIsPlaying(false);
        }
      }, delay);
    } else {
      clearInterval(scrollInterval);
    }

    return () => clearInterval(scrollInterval);
  }, [isPlaying, speed]);

  return (
    <div className="autoscroll-wrapper">
      {/* Nút Play/Pause */}
      <button 
        className={`scroll-btn ${isPlaying ? 'active' : ''}`}
        onClick={() => setIsPlaying(!isPlaying)}
        title={isPlaying ? "Dừng cuộn" : "Bắt đầu cuộn tự động"}
      >
        {isPlaying ? "⏸️" : "▶️"}
      </button>

      {/* Thanh chỉnh tốc độ (Chỉ hiện khi đang Play hoặc Hover) */}
      <div className="speed-control">
        <span className="speed-label">🐢</span>
        <input 
          type="range" 
          min="1" 
          max="10" 
          value={speed} 
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="speed-slider"
        />
        <span className="speed-label">🐇</span>
      </div>

      <style>{`
        .autoscroll-wrapper {
          position: fixed;
          bottom: 90px; /* Nằm trên thanh menu mobile một chút */
          right: 20px;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(5px);
          padding: 8px 12px;
          border-radius: 30px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          border: 1px solid rgba(0,0,0,0.1);
          z-index: 990; /* Thấp hơn ToneFinder/Menu một chút */
          transition: 0.3s;
        }

        .autoscroll-wrapper:hover {
          box-shadow: 0 6px 20px rgba(0,0,0,0.25);
          transform: translateY(-2px);
        }

        .scroll-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: #f0f0f0;
          font-size: 1.2rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.2s;
          margin-right: 10px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .scroll-btn.active {
          background: #d71920; /* Màu đỏ chủ đạo */
          color: white;
          animation: pulse-red 1.5s infinite;
        }

        .speed-control {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .speed-slider {
          width: 80px !important; /* Ghi đè style input range mặc định */
          height: 6px !important;
          background: #ddd;
          border-radius: 3px;
          accent-color: #d71920;
        }

        .speed-label {
          font-size: 0.8rem;
          user-select: none;
        }

        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(215, 25, 32, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(215, 25, 32, 0); }
          100% { box-shadow: 0 0 0 0 rgba(215, 25, 32, 0); }
        }

        /* Responsive: Trên mobile thu gọn lại cho đỡ vướng */
        @media (max-width: 768px) {
          .autoscroll-wrapper {
            bottom: 85px; /* Cách bottom bar */
            right: 15px;
            padding: 5px 10px;
          }
          .speed-slider {
            width: 60px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AutoScroll;