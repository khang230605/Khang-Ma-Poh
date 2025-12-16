// src/LoginGuard.jsx
import React, { useState } from 'react';
import { APP_CONFIG } from './config';

function LoginGuard({ children }) {
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === APP_CONFIG.ACCESS_PASSWORD) {
      setIsAuthorized(true);
      setError("");
    } else {
      setError("Mật khẩu không chính xác!");
    }
  };

  if (!isAuthorized) {
    return (
      <div style={styles.overlay}>
        <form onSubmit={handleLogin} style={styles.form}>
          <h2 style={{color: '#d71920'}}>Khang Ma Poh</h2>
          <p>Vui lòng nhập mật khẩu để truy cập</p>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            placeholder="Mật khẩu..."
            autoFocus
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button}>VÀO HỆ THỐNG</button>
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