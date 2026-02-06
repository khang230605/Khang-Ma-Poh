import React, { useState } from 'react';
import { db } from '../firebase';
// THÊM: updateDoc để cập nhật mật khẩu mới
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

const UserAuth = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isResetting, setIsResetting] = useState(false); // THÊM: State cho màn hình quên mật khẩu
  
  // State cho form
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    systemPass: '' 
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Xử lý nhập liệu
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. XỬ LÝ ĐĂNG KÝ
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { name, phone, password, systemPass } = formData;

    if (!name || !phone || !password || !systemPass) {
      setError("Vui lòng điền đầy đủ thông tin!");
      setLoading(false);
      return;
    }

    try {
      const configRef = doc(db, "Settings", "web_config");
      const configSnap = await getDoc(configRef);

      if (!configSnap.exists() || configSnap.data().ACCESS_PASSWORD !== systemPass) {
        setError("Mã ủy quyền hệ thống không đúng!");
        setLoading(false);
        return;
      }

      const userRef = doc(db, "users", phone);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setError("Số điện thoại này đã được đăng ký!");
        setLoading(false);
        return;
      }

      const newUser = {
        name: name,
        phone: phone,
        password: password,
        role: 'member',
        createdAt: new Date().toISOString()
      };

      await setDoc(userRef, newUser);
      
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      setIsRegistering(false); 
      setFormData({ name: '', phone: '', password: '', systemPass: '' });

    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối Server.");
    }
    setLoading(false);
  };

  // 2. XỬ LÝ ĐĂNG NHẬP
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { phone, password } = formData;

    try {
      const userRef = doc(db, "users", phone);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.password === password) {
          onLoginSuccess(userData);
        } else {
          setError("Sai mật khẩu!");
        }
      } else {
        setError("Số điện thoại này chưa đăng ký.");
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi đăng nhập.");
    }
    setLoading(false);
  };

  // 3. (MỚI) XỬ LÝ QUÊN MẬT KHẨU
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { phone, password, systemPass } = formData; // password ở đây là mật khẩu mới

    if (!phone || !password || !systemPass) {
        setError("Vui lòng điền SĐT, Mật khẩu mới và Mã ủy quyền!");
        setLoading(false);
        return;
    }

    try {
        // B1: Check Mã ủy quyền
        const configRef = doc(db, "Settings", "web_config");
        const configSnap = await getDoc(configRef);

        if (!configSnap.exists() || configSnap.data().ACCESS_PASSWORD !== systemPass) {
            setError("Mã ủy quyền hệ thống sai! Không thể reset.");
            setLoading(false);
            return;
        }

        // B2: Check user có tồn tại không
        const userRef = doc(db, "users", phone);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            setError("Số điện thoại này chưa từng đăng ký!");
            setLoading(false);
            return;
        }

        // B3: Cập nhật mật khẩu mới
        await updateDoc(userRef, {
            password: password // Update field password
        });

        alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
        setIsResetting(false);
        setFormData({ name: '', phone: '', password: '', systemPass: '' });

    } catch (err) {
        console.error(err);
        setError("Lỗi khi đặt lại mật khẩu.");
    }
    setLoading(false);
  };

  // --- RENDER ---
  // Tiêu đề form thay đổi theo trạng thái
  let formTitle = 'ĐĂNG NHẬP';
  if (isRegistering) formTitle = 'ĐĂNG KÝ TÀI KHOẢN';
  if (isResetting) formTitle = 'ĐẶT LẠI MẬT KHẨU';

  // Hàm xử lý submit tương ứng
  let handleSubmit = handleLogin;
  if (isRegistering) handleSubmit = handleRegister;
  if (isResetting) handleSubmit = handleResetPassword;

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 style={{color: 'var(--primary-color)', marginBottom: '20px'}}>
          {formTitle}
        </h2>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Tên chỉ hiện khi Đăng ký */}
          {isRegistering && (
            <input 
              name="name" 
              placeholder="Họ và Tên" 
              value={formData.name} 
              onChange={handleChange} 
              className="auth-input"
            />
          )}
          
          {/* Phone luôn hiện */}
          <input 
            name="phone" 
            placeholder="Số điện thoại" 
            value={formData.phone} 
            onChange={handleChange} 
            className="auth-input"
          />
          
          {/* Password luôn hiện (Là mật khẩu mới nếu đang Reset) */}
          <input 
            type="password"
            name="password" 
            placeholder={isResetting ? "Mật khẩu MỚI" : "Mật khẩu"} 
            value={formData.password} 
            onChange={handleChange} 
            className="auth-input"
          />

          {/* System Pass hiện khi Đăng ký HOẶC Reset */}
          {(isRegistering || isResetting) && (
            <div style={{marginTop: 10, borderTop: '1px dashed #ccc', paddingTop: 10}}>
                <label style={{fontSize: '0.8rem', color: '#666'}}>
                    {isResetting ? "Nhập Mã ủy quyền để xác minh (*):" : "Mã ủy quyền hệ thống (*):"}
                </label>
                <input 
                  type="password"
                  name="systemPass" 
                  placeholder="Nhập Access Password..." 
                  value={formData.systemPass} 
                  onChange={handleChange} 
                  className="auth-input"
                  style={{marginTop: 5}}
                />
            </div>
          )}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Đang xử lý...' : (isRegistering ? 'Đăng Ký' : (isResetting ? 'Lưu Mật Khẩu Mới' : 'Đăng Nhập'))}
          </button>
        </form>

        {/* --- KHU VỰC CHUYỂN ĐỔI (SWITCH) --- */}
        <div className="auth-switch">
          {!isResetting ? (
             // Khi đang ở màn hình Login hoặc Register
             <>
                {isRegistering ? (
                    <p>Đã có tài khoản? <span onClick={() => {setIsRegistering(false); setError('');}}>Đăng nhập ngay</span></p>
                ) : (
                    <>
                        <p>Chưa có tài khoản? <span onClick={() => {setIsRegistering(true); setError('');}}>Đăng ký mới</span></p>
                        {/* Link quên mật khẩu */}
                        <p style={{marginTop: '10px', fontSize: '0.85rem'}}>
                            <span onClick={() => {setIsResetting(true); setError('');}} style={{color: '#666', textDecoration: 'none'}}>Quên mật khẩu?</span>
                        </p>
                    </>
                )}
             </>
          ) : (
             // Khi đang ở màn hình Reset
             <p>
                <span onClick={() => {setIsResetting(false); setError('');}}>← Quay lại Đăng nhập</span>
             </p>
          )}
        </div>
      </div>

      <style>{`
        .auth-container {
          display: flex; justify-content: center; align-items: center;
          height: 100vh; background: #f4f4f4;
        }
        .auth-box {
          background: white; padding: 40px; border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1); width: 100%; max-width: 400px;
          text-align: center;
        }
        .auth-input {
          width: 100%; padding: 12px; margin-bottom: 15px;
          border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box;
          font-size: 1rem;
        }
        .auth-btn {
          width: 100%; padding: 12px; background: var(--primary-color);
          color: white; border: none; border-radius: 8px; font-weight: bold;
          cursor: pointer; font-size: 1rem; transition: 0.3s;
        }
        .auth-btn:hover { opacity: 0.9; transform: translateY(-2px); }
        .auth-switch { margin-top: 20px; font-size: 0.9rem; color: #666; }
        .auth-switch span {
          color: var(--primary-color); font-weight: bold; cursor: pointer;
          text-decoration: underline;
        }
        .error-alert {
          background: #ffebee; color: #c62828; padding: 10px;
          border-radius: 6px; margin-bottom: 15px; font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default UserAuth;