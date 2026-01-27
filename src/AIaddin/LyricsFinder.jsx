// src/AIaddin/LyricsFinder.jsx
import React, { useState } from 'react';
import LyricsForm from './LyricsForm';
import LyricsResult from './LyricsResult';
import { findLyricsWithGemini } from './geminiService';

const LyricsFinder = () => {
  const [lyricsResult, setLyricsResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (data) => {
    setLoading(true);
    setLyricsResult(null); 
    try {
      const result = await findLyricsWithGemini(data);
      // result bây giờ là Object, component LyricsResult đã được update để xử lý nó
      setLyricsResult(result);
    } catch (error) {
      console.error(error);
      setLyricsResult("NOT_FOUND"); 
      // alert(error.message); // Có thể bỏ alert đỡ phiền
    }
    setLoading(false);
  };

  return (
    <div className="lyrics-finder-container">
      <h2 className="page-title">✨ AI Lyrics Finder</h2>
      <p className="page-subtitle">Sử dụng trí tuệ nhân tạo Gemini để tìm kiếm lời bài hát chuẩn xác</p>
      
      <div className="finder-layout">
        <div className="finder-left">
          <LyricsForm onSearch={handleSearch} isLoading={loading} />
        </div>
        <div className="finder-right">
          <LyricsResult result={lyricsResult} status={loading ? 'loading' : 'done'} />
        </div>
      </div>

      {/* --- CSS STYLE NẰM TRONG CÙNG FILE CHO GỌN --- */}
      <style>{`
        .lyrics-finder-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-title {
          color: var(--primary-color, #d71920);
          margin-bottom: 5px;
          font-size: 2rem;
        }
        .page-subtitle { color: #666; margin-bottom: 30px; }

        .finder-layout {
          display: flex;
          gap: 30px;
          align-items: flex-start;
        }

        /* Responsive: Mobile thì xếp dọc */
        @media (max-width: 900px) {
          .finder-layout { flex-direction: column; }
          .finder-left, .finder-right { width: 100% !important; }
        }

        .finder-left { flex: 1; width: 40%; }
        .finder-right { flex: 1.5; width: 60%; }

        /* --- FORM STYLE --- */
        .lyrics-form-card, .lyrics-result-card {
          background: white;
          padding: 25px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          border: 1px solid #eee;
        }

        .form-title { margin-top: 0; margin-bottom: 20px; color: #333; }
        
        .form-group { margin-bottom: 15px; }
        .form-row { display: flex; gap: 15px; }
        .form-group.half { flex: 1; }
        
        .form-group label {
          display: block; margin-bottom: 8px; font-weight: 600; color: #555; font-size: 0.9rem;
        }
        .required { color: red; }

        input {
          width: 100%; padding: 12px;
          border: 1px solid #ddd; border-radius: 8px;
          font-size: 1rem; transition: 0.3s;
          box-sizing: border-box;
        }
        input:focus { border-color: var(--primary-color, #d71920); outline: none; }

        .search-btn {
          width: 100%; padding: 12px;
          background: linear-gradient(135deg, #d71920, #ff4b5c);
          color: white; border: none; border-radius: 8px;
          font-size: 1.1rem; font-weight: bold; cursor: pointer;
          margin-top: 10px; transition: transform 0.2s, box-shadow 0.2s;
        }
        .search-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(215, 25, 32, 0.3); }
        .search-btn:disabled { background: #ccc; cursor: wait; transform: none; }

        /* --- RESULT STYLE --- */
        .empty-state { text-align: center; color: #999; padding: 40px 0; }
        .empty-icon { font-size: 4rem; margin-bottom: 10px; opacity: 0.5; }

        .lyrics-content {
          white-space: pre-wrap; /* Giữ nguyên xuống dòng */
          font-family: 'Courier New', Courier, monospace;
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          line-height: 1.8;
          font-size: 1rem;
          color: #333;
          border-left: 4px solid var(--primary-color, #d71920);
          max-height: 600px;
          overflow-y: auto;
        }

        .result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .copy-btn {
          background: #eee; border: none; padding: 5px 10px;
          border-radius: 5px; cursor: pointer; font-size: 0.8rem;
        }
        .copy-btn:hover { background: #ddd; }

        .error-box { text-align: center; color: #dc3545; padding: 20px; background: #fff5f5; border-radius: 8px; }
        .warning-box { color: #856404; background-color: #fff3cd; padding: 20px; border-radius: 8px; }

        .fade-in { animation: fadeIn 0.5s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default LyricsFinder;