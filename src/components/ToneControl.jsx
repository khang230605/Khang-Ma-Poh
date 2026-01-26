import React, { useState, useRef, useEffect } from 'react';

// Icon SVG
const MinusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{display: 'block'}}>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{display: 'block'}}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const ToneControl = ({ transpose, setTranspose, currentKey }) => {
  const controlRef = useRef(null);
  
  // Vị trí mặc định (Sẽ được tính lại trong useEffect để khớp màn hình)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false); // Check xem người dùng đã kéo chưa

  // --- HÀM GIỚI HẠN VỊ TRÍ AN TOÀN ---
  const clampPosition = (x, y) => {
    if (!controlRef.current) return { x, y };
    const { width, height } = controlRef.current.getBoundingClientRect();
    const maxX = window.innerWidth - width - 5; // Cách mép phải 5px
    const maxY = window.innerHeight - height - 5; // Cách mép dưới 5px
    return {
      x: Math.min(Math.max(5, x), maxX),
      y: Math.min(Math.max(5, y), maxY)
    };
  };

  // --- KHỞI TẠO VỊ TRÍ BAN ĐẦU ---
  useEffect(() => {
    // Chỉ set vị trí mặc định nếu người dùng chưa tự kéo đi chỗ khác
    if (!hasMoved && typeof window !== 'undefined' && controlRef.current) {
        const { width } = controlRef.current.getBoundingClientRect();
        
        // Tính toán vị trí: Góc phải, cách đáy 160px (nằm trên AutoScroll)
        const initialX = window.innerWidth - width - 15; // Cách lề phải 20px
        const initialY = window.innerHeight - 200;       // Cách đáy 160px
        
        setPosition({ x: Math.max(5, initialX), y: initialY });
    }

    // Logic giữ nút trong màn hình khi xoay
    const handleResize = () => setPosition(prev => clampPosition(prev.x, prev.y));
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
    };
  }, [hasMoved]); 

  // --- LOGIC KÉO THẢ (DRAG ANYWHERE) ---
  const handleStart = (clientX, clientY) => {
    setIsDragging(true);
    setHasMoved(true); // Đánh dấu là đã di chuyển thủ công
    
    if (controlRef.current) {
        const rect = controlRef.current.getBoundingClientRect();
        dragOffset.current = { x: clientX - rect.left, y: clientY - rect.top };
    }
  };

  const onMouseDown = (e) => handleStart(e.clientX, e.clientY);
  const onTouchStart = (e) => {
      // e.preventDefault(); // Không chặn default ở đây để nút bấm vẫn ăn
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleMove = (clientX, clientY) => {
    if (!isDragging) return;
    const newX = clientX - dragOffset.current.x;
    const newY = clientY - dragOffset.current.y;
    setPosition(clampPosition(newX, newY));
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
      ref={controlRef}
      className="tone-floater"
      // Kích hoạt kéo khi chạm vào Container
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      style={{ 
        left: position.x, 
        top: position.y,
        opacity: isDragging ? 0.8 : 1,
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      {/* Nút Giảm */}
      <button 
        className="tone-btn minus-btn" 
        onClick={() => setTranspose(prev => prev - 1)}
        // QUAN TRỌNG: Ngăn sự kiện kéo kích hoạt khi bấm nút
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <MinusIcon />
      </button>
      
      <div className="tone-display">
        <span className="tone-label">TONE</span>
        <span className="tone-value">{currentKey}</span>
      </div>
      
      {/* Nút Tăng */}
      <button 
        className="tone-btn plus-btn" 
        onClick={() => setTranspose(prev => prev + 1)}
        // QUAN TRỌNG: Ngăn sự kiện kéo kích hoạt khi bấm nút
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <PlusIcon />
      </button>

      <style>{`
        .tone-floater {
          position: fixed;
          z-index: 2147483647; 
          
          /* Layout ngang */
          display: flex !important;
          flex-direction: row !important; 
          align-items: center;
          gap: 10px;
          
          /* Giao diện */
          background: rgba(255, 255, 255, 0.98);
          padding: 8px 15px;
          border-radius: 60px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.25);
          border: 1px solid #ccc;
          border-bottom: 3px solid var(--primary-color, #d71920);
          
          /* Ngăn chọn text */
          user-select: none;
          touch-action: none;
          white-space: nowrap;
          width: fit-content;
        }
        
        .tone-btn {
          /* Cố định kích thước nút */
          flex: 0 0 40px !important;
          width: 40px !important; 
          height: 40px !important; 
          min-width: 40px !important;
          min-height: 40px !important;
          
          border-radius: 50%; 
          border: 1px solid #eee;
          cursor: pointer; 
          
          display: flex; 
          align-items: center; 
          justify-content: center;
          background: #f8f9fa;
          color: #333;
          margin: 0; padding: 0;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .minus-btn:active { background: #ff5252; color: white; }
        .plus-btn:active { background: #28a745; color: white; }
        
        .tone-display {
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 45px;
          pointer-events: none; /* Text không cản trở việc kéo */
        }
        
        .tone-label { 
            font-size: 0.65rem; 
            color: #888; 
            font-weight: 700; 
            line-height: 1;
        }
        .tone-value { 
            font-size: 1.2rem; 
            color: var(--primary-color, #d71920); 
            font-weight: 800; 
            line-height: 1.1; 
        }
      `}</style>
    </div>
  );
};

export default ToneControl;