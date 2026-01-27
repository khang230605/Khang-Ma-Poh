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
        .admin-container { 
          padding: 20px; 
          background: white; 
          border-radius: 12px; 
          box-shadow: 0 2px 10px rgba(0,0,0,0.05); 
          /* Đảm bảo container không bị tràn khỏi màn hình cha */
          max-width: 100%; 
          box-sizing: border-box;
        }
        
        .user-table { width: 100%; border-collapse: collapse; }
        .user-table th { text-align: left; padding: 12px; background: #f8f9fa; color: #666; font-weight: bold; border-bottom: 2px solid #eee; }
        .user-table td { padding: 12px; border-bottom: 1px solid #eee; }
        
        /* --- CSS RESPONSIVE (Card View cho Mobile) --- */
        @media (max-width: 768px) {
          /* 1. Ẩn tiêu đề bảng (thead) vì mình sẽ đưa tiêu đề vào từng dòng */
          .user-table thead {
            display: none;
          }

          /* 2. Biến table, tbody, tr, td thành dạng block để xếp chồng lên nhau */
          .user-table, .user-table tbody, .user-table tr, .user-table td {
            display: block;
            width: 100%;
          }

          /* 3. Style cho từng dòng (tr) thành một cái Card */
          .user-table tr {
            margin-bottom: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background: #fff;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }

          /* 4. Style cho từng ô (td) */
          .user-table td {
            text-align: right; /* Nội dung nằm bên phải */
            padding-left: 50%; /* Chừa chỗ cho label bên trái */
            position: relative;
            border-bottom: 1px solid #eee;
          }

          /* Dòng cuối cùng của card không cần gạch dưới */
          .user-table td:last-child {
            border-bottom: none;
          }

          /* 5. Dùng pseudo-element ::before để hiện tiêu đề (lấy từ data-label) */
          .user-table td::before {
            content: attr(data-label); /* Lấy giá trị từ attribute data-label */
            position: absolute;
            left: 15px;
            width: 45%;
            text-align: left;
            font-weight: bold;
            color: #555;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;