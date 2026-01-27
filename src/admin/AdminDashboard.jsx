// src/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(userList);
    } catch (error) {
      console.error("Lỗi lấy danh sách user:", error);
      alert("Không thể tải danh sách thành viên.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (userId, newRole) => {
    // ... (Giữ nguyên logic cũ)
    const confirmUpdate = window.confirm(`Bạn có chắc muốn đổi quyền của user này thành "${newRole}" không?`);
    if (!confirmUpdate) return;

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });
      
      alert("Cập nhật thành công!");
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error("Lỗi cập nhật role:", error);
      alert("Lỗi khi cập nhật quyền hạn.");
    }
  };

  const getRoleColor = (role) => {
    if (role === 'admin') return '#d71920'; 
    if (role === 'hdcg_member') return '#28a745'; 
    return '#666'; 
  };

  return (
    <div className="admin-container fade-in">
      <h2 style={{ color: 'var(--primary-color)', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        ⚙️ Quản Trị Hệ Thống
      </h2>

      <div className="stats-box" style={{marginBottom: 20}}>
        <strong>Tổng thành viên: {users.length}</strong>
        <button onClick={fetchUsers} style={{marginLeft: 15, padding: '5px 10px', cursor:'pointer'}}>🔄 Làm mới</button>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        /* Thêm id để CSS dễ bắt */
        <div className="table-wrapper"> 
          <table className="user-table">
            <thead>
              <tr>
                <th>Tên hiển thị</th>
                <th>Số điện thoại</th>
                <th>Ngày tham gia</th>
                <th>Quyền hạn</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  {/* QUAN TRỌNG: Thêm data-label để CSS hiển thị tiêu đề trên mobile */}
                  <td data-label="Tên hiển thị"><strong>{user.name}</strong></td>
                  <td data-label="Số điện thoại">{user.phone}</td>
                  <td data-label="Ngày tham gia">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td data-label="Quyền hạn">
                    <span 
                      style={{
                        padding: '4px 8px', 
                        borderRadius: '12px', 
                        color: 'white',
                        fontSize: '0.8rem',
                        backgroundColor: getRoleColor(user.role),
                        display: 'inline-block' // Fix lỗi hiển thị span
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td data-label="Hành động">
                    <select 
                      value={user.role} 
                      onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                      style={{padding: '5px', borderRadius: '4px', border: '1px solid #ddd', width: '100%'}}
                    >
                      <option value="member">Member</option>
                      <option value="hdcg_member">HDCG Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        /* --- STYLE GỐC (GIỮ NGUYÊN HOẶC SỬA NHẸ) --- */
        .admin-container { 
            padding: 20px; 
            background: white; 
            border-radius: 12px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.05); 
            width: 100%; /* Đảm bảo không vượt quá cha */
            box-sizing: border-box; /* Tính cả padding vào width */
        }
        
        .table-wrapper { width: 100%; }
        
        .user-table { 
            width: 100%; 
            border-collapse: collapse; 
            /* min-width: 600px; <--- NGUYÊN NHÂN LỖI LÀ DÒNG NÀY (Ở PC CÓ THỂ GIỮ, NHƯNG MOBILE PHẢI BỎ) */
        }
        
        .user-table th { text-align: left; padding: 12px; background: #f8f9fa; color: #666; font-weight: bold; border-bottom: 2px solid #eee; }
        .user-table td { padding: 12px; border-bottom: 1px solid #eee; }
        
        /* --- CSS RESPONSIVE (FIX LỖI TRÀN) --- */
        @media (max-width: 768px) {
            /* 1. Giảm padding của container chính để tiết kiệm diện tích */
            .admin-container {
            padding: 10px; 
            }

            /* 2. RESET CHIỀU RỘNG BẢNG */
            .user-table {
            min-width: 0 !important; /* QUAN TRỌNG: Hủy bỏ giới hạn 600px cũ */
            display: block;
            width: 100%;
            }

            /* 3. Ẩn header cũ */
            .user-table thead { display: none; }
            .user-table tbody, .user-table tr, .user-table td { display: block; width: 100%; box-sizing: border-box; }

            /* 4. Style thẻ Card */
            .user-table tr {
            margin-bottom: 15px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            background: #fff;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            overflow: hidden; /* Bo góc gọn gàng */
            }

            /* 5. Căn chỉnh nội dung trong thẻ */
            .user-table td {
            text-align: right; /* Giá trị nằm bên phải */
            padding-left: 45%; /* Dành 45% bên trái cho nhãn (Label) */
            position: relative;
            border-bottom: 1px solid #f0f0f0;
            min-height: 40px; /* Đảm bảo dòng không quá dẹt */
            display: flex; /* Dùng flex để căn giữa dọc */
            align-items: center;
            justify-content: flex-end; /* Đẩy nội dung sang phải */
            }

            /* 6. Nhãn (Label) bên trái */
            .user-table td::before {
            content: attr(data-label);
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%); /* Căn giữa dọc tuyệt đối */
            width: 40%;
            text-align: left;
            font-weight: 600;
            color: #666;
            font-size: 0.9rem;
            }

            /* Dòng cuối cùng không cần gạch dưới */
            .user-table td:last-child { border-bottom: none; }
            
            /* Chỉnh lại cái dropdown cho đẹp trên mobile */
            .user-table select {
            max-width: 100%; /* Không cho tràn */
            }
        }
    `}</style>
    </div>
  );
};

export default AdminDashboard;