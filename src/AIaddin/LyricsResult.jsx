// src/AIaddin/LyricsResult.jsx
import React from 'react';

const LyricsResult = ({ result, status }) => {
  if (!result && status !== 'error') return (
    <div className="empty-state">
      <div className="empty-icon">🎵</div>
      <p>Nhập tên bài hát để tìm kiếm lời chính xác từ internet!</p>
    </div>
  );

  // Xử lý loading
  if (status === 'loading') {
    return (
      <div className="lyrics-result-card" style={{textAlign:'center', padding: '50px'}}>
        <div className="spinner">🔮</div>
        <p>Đang quét dữ liệu từ internet & phân tích cấu trúc...</p>
        <style>{`
          .spinner { font-size: 3rem; animation: spin 2s infinite linear; display: inline-block; margin-bottom: 20px;}
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // Xử lý dữ liệu trả về
  // result bây giờ là object { type, content, meta } hoặc string lỗi
  let content = "";
  let meta = null;
  let isReal = false;

  if (typeof result === 'string') {
    content = result; // Trường hợp lỗi hoặc fallback cũ
  } else if (result && result.content) {
    content = result.content;
    meta = result.meta;
    isReal = result.type === 'REAL_SEARCH';
  }

  const renderContent = () => {
    if (content.includes("NOT_FOUND")) {
      return (
        <div className="error-box">
          <h3>❌ Không tìm thấy</h3>
          <p>Hệ thống đã tìm trên Internet nhưng không thấy bài này. Có thể bài hát quá mới hoặc chưa có lời trên Genius.</p>
        </div>
      );
    }

    return (
      <div className="success-box fade-in">
        <div className="result-header">
          <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
             {meta && meta.image && (
                 <img src={meta.image} alt="Cover" style={{width:'60px', height:'60px', borderRadius:'8px', objectFit:'cover'}} />
             )}
             <div>
                <h3 style={{margin:0, fontSize:'1.2rem'}}>
                    {meta ? meta.title : "Kết quả lời bài hát"}
                </h3>
                {meta && <span style={{fontSize:'0.9rem', color:'#666'}}>{meta.artist}</span>}
                {isReal && <span style={{marginLeft:'10px', fontSize:'0.7rem', background:'#28a745', color:'white', padding:'2px 6px', borderRadius:'4px'}}>✓ Verified Source</span>}
             </div>
          </div>
          
          <button className="copy-btn" onClick={() => navigator.clipboard.writeText(content)}>
            📋 Copy
          </button>
        </div>
        <pre className="lyrics-content">{content}</pre>
        {isReal && <p style={{textAlign:'right', fontSize:'0.8rem', color:'#999', marginTop:'10px'}}>Nguồn: Genius • Format bởi Gemini AI</p>}
      </div>
    );
  };

  return (
    <div className="lyrics-result-card">
      {renderContent()}
    </div>
  );
};

export default LyricsResult;