// src/BackgroundMusic.jsx
import React, { useState, useRef, useEffect } from 'react';

const BackgroundMusic = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5); // Mặc định 50%
  const audioRef = useRef(null);

  // Cập nhật âm lượng khi state volume thay đổi
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div style={styles.musicContainer}>
      <audio ref={audioRef} src={audioUrl} loop />
      
      <button onClick={togglePlay} style={styles.playButton}>
        {isPlaying ? '⏸ Tạm dừng nhạc' : '▶️ Phát nhạc chờ'}
      </button>

      <div style={styles.volumeControl}>
          <span style={{ fontSize: '12px' }}>🔈</span>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume} 
            onChange={(e) => setVolume(e.target.value)}
            style={styles.slider}
          />
          <span style={{ fontSize: '12px' }}>🔊</span>
       </div>
    </div>
  );
};

const styles = {
  musicContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    marginTop: '20px',
    padding: '10px',
    borderRadius: '10px',
    backgroundColor: 'rgba(0,0,0,0.05)'
  },
  playButton: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  volumeControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  slider: {
    width: '100px',
    cursor: 'pointer'
  }
};

export default BackgroundMusic;