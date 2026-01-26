// src/components/ToneControl.jsx
import React, { useState, useRef, useEffect } from 'react';

const ToneControl = ({ transpose, setTranspose, currentKey }) => {
  // 1. Khởi tạo vị trí an toàn
  const [position, setPosition] = useState({ 
    x: typeof window !== 'undefined' ? window.innerWidth - 70 : 300, 
    y: typeof window !== 'undefined' ? window.innerHeight - 200 : 500 
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // --- LOGIC MỚI: TỰ ĐỘNG CĂN CHỈNH KHI XOAY MÀN HÌNH ---
  useEffect(() => {
    const handleResize = () => {
      setPosition((prevPos) => {
        // Tính toán giới hạn mới của màn hình
        const maxX = window.innerWidth - 60; // Trừ bề rộng nút
        const maxY = window.innerHeight - 140; // Trừ chiều cao nút

        // Nếu vị trí cũ đang nằm ngoài giới hạn mới -> Đẩy nó vào trong
        return {
          x: Math.min(Math.max(0, prevPos.x), maxX),
          y: Math.min(Math.max(0, prevPos.y), maxY)
        };
      });
    };

    window.addEventListener('resize', handleResize);
    // Gọi 1 lần ngay khi mount để đảm bảo vị trí đúng
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // -------------------------------------------------------

  const handleStart = (clientX, clientY) => {
    setIsDragging(true);
    dragOffset.current = { x: clientX - position.x, y: clientY - position.y };
  };

  const onMouseDown = (e) => handleStart(e.clientX, e.clientY);
  const onTouchStart = (e) => handleStart(e.touches[0].clientX, e.touches[0].clientY);

  const handleMove = (clientX, clientY) => {
    if (!isDragging) return;
    let newX = clientX - dragOffset.current.x;
    let newY = clientY - dragOffset.current.y;
    
    // Giới hạn không cho kéo ra ngoài
    const maxX = window.innerWidth - 60; 
    const maxY = window.innerHeight - 140;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    setPosition({ x: newX, y: newY });
  };

  const handleEnd = () => setIsDragging(false);

  useEffect(() => {
    const onMouseMove = (e) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
    
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  return (
    <div 
      className="tone-floater"
      style={{ 
        left: position.x, 
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.8 : 1
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      <button 
        className="tone-btn" 
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={() => setTranspose(prev => prev + 1)}
      >
        ♯
      </button>
      
      <div className="tone-display">{currentKey}</div>
      
      <button 
        className="tone-btn" 
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={() => setTranspose(prev => prev - 1)}
      >
        ♭
      </button>

      <div className="drag-handle">✥</div>

      <style>{`
        .tone-floater {
          position: fixed;
          z-index: 10000; /* Tăng Z-Index cao hơn nữa */
          display: flex;
          flex-direction: column;
          gap: 5px;
          background: rgba(255, 255, 255, 0.95);
          padding: 8px;
          border-radius: 50px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          border: 2px solid var(--primary-color, #d71920);
          align-items: center;
          touch-action: none; 
          user-select: none;
          transition: transform 0.1s; /* Chỉ transition transform để kéo cho mượt */
          min-width: 40px;
        }
        
        .tone-btn {
          width: 36px; height: 36px; 
          border-radius: 50%; border: 1px solid #ddd;
          background: white; cursor: pointer; 
          font-weight: bold; color: #333; font-size: 1.2rem;
          display: flex; align-items: center; justify-content: center;
          padding-bottom: 3px;
        }
        
        .tone-btn:active { background: #eee; transform: scale(0.95); }
        
        .tone-display {
          font-size: 1rem;
          color: var(--primary-color, #d71920);
          font-weight: bold;
          margin: 2px 0;
          pointer-events: none;
        }

        .drag-handle { font-size: 1rem; color: #ccc; cursor: grab; margin-top: 2px; }
      `}</style>
    </div>
  );
};

export default ToneControl;