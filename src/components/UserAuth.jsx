    import React, { useState } from 'react';
    import { db } from '../firebase';
    import { doc, setDoc, getDoc } from "firebase/firestore";

    const UserAuth = ({ onLoginSuccess }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    
    // State cho form
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        systemPass: '' // Mật khẩu hệ thống để được phép tạo nick
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
        // B1: Kiểm tra mật khẩu hệ thống (Access Password)
        // Lưu ý: Bạn yêu cầu lấy ở Settings/web_config/ACCESS_PASSWORD
        const configRef = doc(db, "Settings", "web_config");
        const configSnap = await getDoc(configRef);

        if (!configSnap.exists() || configSnap.data().ACCESS_PASSWORD !== systemPass) {
            setError("Mật khẩu hệ thống (Access Password) không đúng! Bạn không có quyền tạo tài khoản.");
            setLoading(false);
            return;
        }

        // B2: Kiểm tra xem số điện thoại đã tồn tại chưa
        const userRef = doc(db, "users", phone);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            setError("Số điện thoại này đã được đăng ký!");
            setLoading(false);
            return;
        }

        // B3: Tạo tài khoản mới
        const newUser = {
            name: name,
            phone: phone,
            password: password, // Lưu ý: Dự án nhỏ thì lưu text, dự án lớn nên mã hóa
            role: 'member', // Mặc định là member
            createdAt: new Date().toISOString()
        };

        await setDoc(userRef, newUser);
        
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        setIsRegistering(false); // Chuyển về trang đăng nhập
        setFormData({ name: '', phone: '', password: '', systemPass: '' }); // Reset form

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
            // Đăng nhập thành công -> Gọi hàm ở App.jsx để lưu trạng thái
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

    return (
        <div className="auth-container">
        <div className="auth-box">
            <h2 style={{color: 'var(--primary-color)', marginBottom: '20px'}}>
            {isRegistering ? 'ĐĂNG KÝ TÀI KHOẢN' : 'ĐĂNG NHẬP'}
            </h2>

            {error && <div className="error-alert">{error}</div>}

            <form onSubmit={isRegistering ? handleRegister : handleLogin}>
            {isRegistering && (
                <input 
                name="name" 
                placeholder="Họ và Tên" 
                value={formData.name} 
                onChange={handleChange} 
                className="auth-input"
                />
            )}
            
            <input 
                name="phone" 
                placeholder="Số điện thoại" 
                value={formData.phone} 
                onChange={handleChange} 
                className="auth-input"
            />
            
            <input 
                type="password"
                name="password" 
                placeholder="Mật khẩu" 
                value={formData.password} 
                onChange={handleChange} 
                className="auth-input"
            />

            {isRegistering && (
                <div style={{marginTop: 10, borderTop: '1px dashed #ccc', paddingTop: 10}}>
                    <label style={{fontSize: '0.8rem', color: '#666'}}>Mã ủy quyền hệ thống (*):</label>
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
                {loading ? 'Đang xử lý...' : (isRegistering ? 'Đăng Ký' : 'Đăng Nhập')}
            </button>
            </form>

            <div className="auth-switch">
            {isRegistering ? (
                <p>Đã có tài khoản? <span onClick={() => setIsRegistering(false)}>Đăng nhập ngay</span></p>
            ) : (
                <p>Chưa có tài khoản? <span onClick={() => setIsRegistering(true)}>Đăng ký mới</span></p>
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