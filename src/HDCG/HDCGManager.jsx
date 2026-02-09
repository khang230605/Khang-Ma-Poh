// src/HDCG/HDCGManager.jsx
import React, { useState } from 'react';
import CollectionView from './CollectionView';
import SongListView from './SongListView';
import OfficialSongDetail from './OfficialSongDetail';

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
      <div className="hdcg-header" style={{ marginBottom: 20, paddingBottom: 10, borderBottom: '2px solid #eee' }}>
        <h2 style={{ margin: 0, color: '#d71920' }}>💎 HDCG OFFICIAL SONGS</h2>
        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Kho lưu trữ bài hát độc quyền & Phân phổ nhạc cụ</p>
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