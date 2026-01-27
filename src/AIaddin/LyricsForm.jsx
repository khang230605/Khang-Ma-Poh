// src/AIaddin/LyricsForm.jsx
import React, { useState } from 'react';

const LyricsForm = ({ onSearch, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    songwriter: '',
    link: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Vui lòng điền tên bài hát!");
      return;
    }
    onSearch(formData);
  };

  return (
    <div className="lyrics-form-card fade-in">
      <h3 className="form-title">🔍 Nhập thông tin bài hát</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tên bài hát <span className="required">*</span></label>
          <input 
            type="text" name="title" 
            placeholder="Ví dụ: Uptown Funk" 
            value={formData.title} onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group half">
            <label>Ca sĩ / Artist</label>
            <input 
              type="text" name="artist" 
              placeholder="Ví dụ: Bruno Mars" 
              value={formData.artist} onChange={handleChange}
            />
          </div>
          <div className="form-group half">
            <label>Nhạc sĩ (Songwriter)</label>
            <input 
              type="text" name="songwriter" 
              placeholder="Tên nhạc sĩ..." 
              value={formData.songwriter} onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Link tham khảo (Spotify/Youtube)</label>
          <input 
            type="url" name="link" 
            placeholder="https://..." 
            value={formData.link} onChange={handleChange}
          />
        </div>

        <button type="submit" className="search-btn" disabled={isLoading}>
          {isLoading ? '🔮 AI đang tìm kiếm...' : '🚀 Tìm lời bài hát'}
        </button>
      </form>
    </div>
  );
};

export default LyricsForm;