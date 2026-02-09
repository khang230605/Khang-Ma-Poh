// src/HDCG/HDCGManager.jsx
import React, { useState } from 'react';
import CollectionView from './CollectionView';
import SongListView from './SongListView';
import OfficialSongDetail from './OfficialSongDetail';
import hdcgLogo from '../assets/hdcglogo.jpg';

const HDCGManager = ({ currentUser }) => {
  const [viewMode, setViewMode] = useState('collections'); // 'collections', 'songs', 'detail'
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);

  // 1. Chọn Album -> Vào xem danh sách bài
  const handleSelectCollection = (col) => {
    setSelectedCollection(col);
    setViewMode('songs');
  };

  // 2. Chọn Bài -> Vào xem chi tiết/sửa
  const handleSelectSong = (song) => {
    setSelectedSong(song);
    setViewMode('detail');
  };

  // 3. Back ra ngoài
  const handleBackToCollections = () => {
    setSelectedCollection(null);
    setViewMode('collections');
  };

  const handleBackToSongList = () => {
    setSelectedSong(null);
    setViewMode('songs');
  };

  return (
    <div className="hdcg-manager fade-in">
      <div className="hdcg-header" style={{ 
          marginBottom: 20, 
          paddingBottom: 10, 
          borderBottom: '2px solid #eee',
          display: 'flex',        /* Xếp Logo và Khối Text nằm ngang */
          alignItems: 'center',   /* Căn giữa theo chiều dọc */
          gap: '15px'             /* Khoảng cách giữa Logo và Text */
      }}>
        
        {/* CỘT TRÁI: LOGO */}
        <img 
          src={hdcgLogo} 
          alt="HDCG Logo" 
          style={{ 
            height: '55px',       /* Chiều cao vừa đủ khớp với 2 dòng chữ */
            width: 'auto',
            flexShrink: 0         /* Đảm bảo logo không bị bóp méo trên mobile */
          }} 
        />

        {/* CỘT PHẢI: CHỨA CẢ 2 DÒNG TEXT */}
        <div style={{ display: 'flex', flexDirection: 'column' , width: '300px' }}>
            <h2 style={{ margin: 0, color: '#191fd7', lineHeight: '1.2', fontSize: '1rem' }}>
              HDCG OFFICIAL SONGS
            </h2>
            <p style={{ margin: 0, color: '#666', fontSize: '0.6rem' }}>
              Kho lưu trữ bài hát độc quyền HDCG
            </p>
        </div>

      </div>

      {viewMode === 'collections' && (
        <CollectionView onSelect={handleSelectCollection} currentUser={currentUser} />
      )}

      {viewMode === 'songs' && selectedCollection && (
        <SongListView 
          collection={selectedCollection} 
          onSelectSong={handleSelectSong} 
          onBack={handleBackToCollections}
          currentUser={currentUser}
        />
      )}

      {viewMode === 'detail' && selectedSong && (
        <OfficialSongDetail 
          song={selectedSong} 
          onBack={handleBackToSongList}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default HDCGManager;