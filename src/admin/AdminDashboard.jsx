// src/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Import từ folder cha
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load danh sách user
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

  // Hàm cập nhật Role
  const handleUpdateRole = async (userId, newRole) => {
    const confirmUpdate = window.confirm(`Bạn có chắc muốn đổi quyền của user này thành "${newRole}" không?`);
    if (!confirmUpdate) return;

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });
      
      alert("Cập nhật thành công!");
      // Cập nhật lại giao diện (local) để đỡ phải gọi API lại
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error("Lỗi cập nhật role:", error);
      alert("Lỗi khi cập nhật quyền hạn.");
    }
  };

  const getRoleColor = (role) => {
    if (role === 'admin') return '#d71920'; // Đỏ
    if (role === 'hdcg_member') return '#28a745'; // Xanh lá
    return '#666'; // Xám (Member thường)
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
        <div className="table-responsive">
          <table className="user-table">
            <thead>
              <tr>
                <th>Tên hiển thị</th>
                <th>Số điện thoại (ID)</th>
                <th>Ngày tham gia</th>
                <th>Quyền hạn (Role)</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td><strong>{user.name}</strong></td>
                  <td>{user.phone}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <span 
                      style={{
                        padding: '4px 8px', 
                        borderRadius: '12px', 
                        color: 'white',
                        fontSize: '0.8rem',
                        backgroundColor: getRoleColor(user.role)
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <select 
                      value={user.role} 
                      onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                      style={{padding: '5px', borderRadius: '4px', border: '1px solid #ddd'}}
                      disabled={user.role === 'admin' && user.id === 'YOUR_PHONE_NUMBER'} // (Optional) Tránh tự hủy quyền admin của mình
                    >
                      <option value="member">Member (Thường)</option>
                      <option value="hdcg_member">HDCG Member (VIP)</option>
                      <option value="admin">Admin (Quản trị)</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .admin-container { padding: 20px; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .table-responsive { overflow-x: auto; }
        .user-table { width: 100%; border-collapse: collapse; min-width: 600px; }
        .user-table th { text-align: left; padding: 12px; background: #f8f9fa; color: #666; font-weight: bold; border-bottom: 2px solid #eee; }
        .user-table td { padding: 12px; border-bottom: 1px solid #eee; }
        .user-table tr:hover { background-color: #f9f9f9; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;