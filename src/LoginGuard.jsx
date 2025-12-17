import React, { useState, useEffect } from 'react';
import { db } from './firebase'; // Import db từ cấu hình firebase của bạn
import { doc, getDoc } from 'firebase/firestore';
import myLogo from './assets/logonoback.png'; // Đường dẫn tới logo của bạn
import BackgroundMusic from './BackgroundMusic';
import bgAudio from './assets/BeatKhongCon_BGM.mp3'; // Đường dẫn tới file nhạc nền

function LoginGuard({ children }) {
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState("");
  const [dbPassword, setDbPassword] = useState(null); // Lưu pass lấy từ Firebase
  const [loading, setLoading] = useState(true);

  // Lấy mật khẩu từ Firebase Console khi web load
  useEffect(() => {
    const fetchPassword = async () => {
      try {
        const docRef = doc(db, "Settings", "web_config");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setDbPassword(docSnap.data().ACCESS_PASSWORD);
        } else {
          console.error("Không tìm thấy document app_config trên Firebase!");
        }
      } catch (err) {
        console.error("Lỗi lấy pass từ Firebase:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPassword();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (dbPassword && password === dbPassword) {
      setIsAuthorized(true);
      setError("");
    } else {
      setError("Mật khẩu truy cập không chính xác!");
    }
  };

  if (loading) return <div>Đang kiểm tra bảo mật...</div>;

  if (!isAuthorized) {
    return (
      <div style={styles.overlay}>
        <form onSubmit={handleLogin} style={styles.form}>
            {/* 1. Phần Logo */}
            <div className="logo-login-container" onClick={() => window.location.reload()}>
              <img src={myLogo} alt="Logo" className="app-logo-login" />
            </div>

            <h2 style={styles.title}>Khang Ma Poh</h2>

            {/* 2. CHÈN NHẠC NỀN VÀO ĐÂY */}
            {/* Bạn đặt nó dưới tiêu đề để giao diện cân đối */}
            <BackgroundMusic audioUrl={bgAudio} />
            
            <div style={{ marginTop: '20px' }}> {/* Thêm chút khoảng cách */}
              <input 
                type="password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                placeholder="Nhập mật khẩu hệ thống..."
                autoFocus
              />
              {error && <p style={{color: 'red'}}>{error}</p>}
              <button type="submit" style={styles.button}>VÀO HỆ THỐNG</button>
            </div>
            
        </form>
      </div>
    );
  }

  return children;
}

const styles = {
  overlay: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f4f4f4' },
  form: { background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', textAlign: 'center' },
  input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' },
  error: { color: 'red', fontSize: '0.9rem', marginBottom: '10px' },
  button: { width: '100%', padding: '10px', background: '#d71920', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};

export default LoginGuard;