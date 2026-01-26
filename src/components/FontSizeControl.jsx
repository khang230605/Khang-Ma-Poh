import React, { useState, useRef, useEffect } from 'react';

const FontSizeControl = ({ fontSize, setFontSize }) => {
  // 1. State lưu vị trí (X, Y). Mặc định nằm góc dưới trái
  // window.innerHeight - 160 để nó nằm cách đáy một đoạn
  const [position, setPosition] = useState({ 
    x: 20, 
    y: typeof window !== 'undefined' ? window.innerHeight - 160 : 500 
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 }); // Lưu khoảng cách từ chuột đến góc nút

  // --- XỬ LÝ KÉO THẢ (DRAG LOGIC) ---

  // Bắt đầu kéo (Chuột hoặc Chạm)
  const handleStart = (clientX, clientY) => {
    setIsDragging(true);
    // Tính khoảng cách từ điểm click đến góc trái trên của nút
    dragOffset.current = {
      x: clientX - position.x,
      y: clientY - position.y
    };
  };

  const onMouseDown = (e) => handleStart(e.clientX, e.clientY);
  const onTouchStart = (e) => handleStart(e.touches[0].clientX, e.touches[0].clientY);

  // Đang kéo (Di chuyển)
  const handleMove = (clientX, clientY) => {
    if (!isDragging) return;
    
    // Tính vị trí mới
    let newX = clientX - dragOffset.current.x;
    let newY = clientY - dragOffset.current.y;

    // Giới hạn không cho kéo ra ngoài màn hình (Boundary)
    const maxX = window.innerWidth - 50; // Trừ đi chiều rộng nút
    const maxY = window.innerHeight - 120; // Trừ chiều cao

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    setPosition({ x: newX, y: newY });
  };

  // Kết thúc kéo
  const handleEnd = () => {
    setIsDragging(false);
  };

  // Gắn sự kiện vào window để khi kéo chuột nhanh ra ngoài nút vẫn bắt được
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
  }, [isDragging]); // Chỉ chạy lại khi trạng thái kéo thay đổi

  return (
    <div 
      className="font-size-floater"
      style={{ 
        left: position.x, 
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.8 : 1 // Làm mờ nhẹ khi đang kéo
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      {/* Nút Tăng */}
      <button 
        className="font-btn" 
        // onMouseDown stoppropagation để tránh kích hoạt kéo khi bấm nút
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={() => setFontSize(prev => Math.min(2.5, prev + 0.1))}
        title="Tăng cỡ chữ"
      >
        A+
      </button>
      
      <div className="font-display">{Math.round(fontSize * 10) / 10}</div>
      
      {/* Nút Giảm */}
      <button 
        className="font-btn" 
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={() => setFontSize(prev => Math.max(0.8, prev - 0.1))}
        title="Giảm cỡ chữ"
      >
        A-
      </button>

      {/* Icon di chuyển nhỏ để gợi ý */}
      <div className="drag-handle">✥</div>

      <style>{`
        .font-size-floater {
          position: fixed;
          /* Loại bỏ bottom/right cứng, dùng top/left từ state */
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 5px;
          background: rgba(255, 255, 255, 0.95);
          padding: 8px;
          border-radius: 50px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          border: 1px solid #ccc;
          align-items: center;
          touch-action: none; /* Quan trọng: Ngăn cuộn trang khi kéo nút trên mobile */
          user-select: none;
          transition: transform 0.1s; /* Mượt mà hơn chút */
        }
        
        .font-btn {
          width: 36px; 
          height: 36px; 
          border-radius: 50%; 
          border: 1px solid #ddd;
          background: white; 
          cursor: pointer; 
          font-weight: bold; 
          color: #333;
          font-size: 0.9rem;
          transition: 0.2s;
          display: flex; align-items: center; justify-content: center;
        }
        
        .font-btn:active {
          background: #eee;
          transform: scale(0.95);
        }
        
        .font-display {
          font-size: 0.75rem;
          color: #666;
          font-weight: bold;
          margin: 2px 0;
          pointer-events: none; /* Không cho chọn text */
        }

        .drag-handle {
          font-size: 1rem;
          color: #ccc;
          cursor: grab;
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
};

export default FontSizeControl;