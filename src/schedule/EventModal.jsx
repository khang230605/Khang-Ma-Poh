import { useState, useEffect } from 'react';

// Tạo danh sách khung giờ (00:00 - 23:30)
const TIME_SLOTS = [];
for (let i = 0; i < 24; i++) {
  const hour = i.toString().padStart(2, '0');
  TIME_SLOTS.push(`${hour}:00`, `${hour}:30`);
}

const EventModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  initialData, 
  mode,           // 'view', 'create', 'edit'
  members,        // Danh sách user từ Firebase
  isAdmin,        // Biến kiểm tra quyền admin
  onSwitchToEdit  // Hàm chuyển từ View -> Edit
}) => {
  
  if (!isOpen) return null;

  // =========================================================================
  // 1. CHẾ ĐỘ XEM CHI TIẾT (VIEW MODE)
  // =========================================================================
  if (mode === 'view' && initialData) {
    const startDate = new Date(initialData.start);
    const endDate = new Date(initialData.end);

    return (
      <div className="modal-overlay">
        <div className="modal-content view-mode">
          {/* Header: Tiêu đề & Loại sự kiện */}
          <div style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
             <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>{initialData.title}</h2>
             <span style={{ 
                backgroundColor: '#eee', 
                padding: '4px 10px', 
                borderRadius: '4px', 
                fontSize: '0.9rem',
                color: '#555',
                display: 'inline-block'
             }}>
                🏷️ {initialData.type || 'Sự kiện chung'}
             </span>
          </div>

          {/* Nội dung chi tiết */}
          <div className="view-details" style={{ lineHeight: '1.8', fontSize: '1rem' }}>
             <p>
               <strong>📅 Thời gian:</strong> {startDate.toLocaleDateString('vi-VN')} <br/> 
               <span style={{ color: '#666', marginLeft: '25px' }}>
                 🕒 {startDate.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })} - 
                 {endDate.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
               </span>
             </p>
             
             <p><strong>📍 Địa điểm:</strong> {initialData.resource?.location || 'Chưa cập nhật'}</p>
             
             <div style={{ marginTop: '15px' }}>
                <strong>👥 Thành viên tham gia:</strong>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {initialData.resource?.participants && initialData.resource.participants.length > 0 ? (
                        initialData.resource.participants.map((p, idx) => (
                            <span key={idx} style={{ 
                                backgroundColor: '#e3f2fd', 
                                color: '#1565c0', 
                                padding: '4px 12px', 
                                borderRadius: '15px', 
                                fontSize: '0.9rem',
                                border: '1px solid #bbdefb'
                            }}>
                                {p}
                            </span>
                        ))
                    ) : <span style={{ color: '#999', fontStyle: 'italic' }}>(Chưa có thành viên nào)</span>}
                </div>
             </div>
          </div>

          {/* Nút tác vụ (Footer) */}
          <div className="modal-actions" style={{ marginTop: '25px', borderTop: '1px solid #eee', paddingTop: '15px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button onClick={onClose} style={{ marginRight: 'auto', backgroundColor: '#6c757d', color: 'white' }}>Đóng</button>
            
            {/* Chỉ hiện nút Sửa/Xóa nếu là Admin */}
            {isAdmin && (
                <>
                    <button 
                        onClick={() => onDelete(initialData.id)} 
                        style={{ backgroundColor: '#dc3545', color: 'white', border: 'none' }}>
                        🗑 Xóa
                    </button>
                    <button 
                        onClick={onSwitchToEdit} 
                        className="btn-create"
                        style={{ backgroundColor: '#ffc107', color: '#212529' }}>
                        ✎ Chỉnh sửa
                    </button>
                </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. CHẾ ĐỘ FORM NHẬP LIỆU (CREATE / EDIT MODE)
  // =========================================================================
  
  // State quản lý form
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    date: '', 
    startTime: '19:00',
    endTime: '21:00',
    location: '',
    participants: []
  });

  // Load dữ liệu vào form khi mở Edit
  useEffect(() => {
    if (initialData && mode === 'edit') {
      const start = new Date(initialData.start);
      const end = new Date(initialData.end);
      
      // Chuyển ngày sang format YYYY-MM-DD cho input type="date"
      const dateStr = start.getFullYear() + '-' + String(start.getMonth() + 1).padStart(2, '0') + '-' + String(start.getDate()).padStart(2, '0');
      
      setFormData({
        title: initialData.title,
        type: initialData.type || '',
        date: dateStr,
        startTime: start.toTimeString().slice(0, 5), // Lấy HH:mm
        endTime: end.toTimeString().slice(0, 5),
        location: initialData.resource?.location || '',
        participants: initialData.resource?.participants || []
      });
    } else if (mode === 'create') {
        // Reset form khi tạo mới
        setFormData({
            title: '', type: '', date: '', startTime: '19:00', endTime: '21:00', location: '', participants: []
        });
    }
  }, [initialData, isOpen, mode]);

  // Xử lý khi bấm nút Lưu
  const handleSubmit = () => {
    if(!formData.date || !formData.title) {
        alert("Vui lòng nhập tên sự kiện và ngày!");
        return;
    }

    // Gộp Ngày + Giờ thành Date Object
    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

    // Kiểm tra giờ kết thúc phải sau giờ bắt đầu
    if (endDateTime <= startDateTime) {
        alert("Giờ kết thúc phải sau giờ bắt đầu!");
        return;
    }

    const newEvent = {
      // Nếu đang edit thì giữ ID cũ, tạo mới thì null
      id: (initialData && mode === 'edit') ? initialData.id : null, 
      title: formData.title,
      start: startDateTime,
      end: endDateTime,
      type: formData.type,
      resource: {
        location: formData.location,
        participants: formData.participants
      }
    };
    onSave(newEvent);
  };

  // Xử lý chọn/bỏ chọn thành viên
  const toggleParticipant = (name) => {
    setFormData(prev => {
      const exists = prev.participants.includes(name);
      return {
        ...prev,
        participants: exists 
          ? prev.participants.filter(p => p !== name) // Bỏ chọn
          : [...prev.participants, name] // Chọn thêm
      };
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{mode === 'edit' ? '✏️ Cập nhật sự kiện' : '➕ Tạo sự kiện mới'}</h3>
        
        <div className="form-group">
          <label>Tên sự kiện <span style={{color:'red'}}>*</span>:</label>
          <input 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
            placeholder="VD: Tập nhạc, Show Cafe..." 
          />
        </div>

        <div className="form-group" style={{display: 'flex', gap: '30px'}}>
           <div style={{flex: 1}}>
             <label>Loại sự kiện:</label>
             <input 
                type="text" 
                value={formData.type} 
                onChange={e => setFormData({...formData, type: e.target.value})} 
                placeholder="VD: Acoucstic, Full Band, Quay..."
             />
           </div>
           <div style={{flex: 1}}>
             <label>Ngày <span style={{color:'red'}}>*</span>:</label>
             <input 
                type="date" 
                value={formData.date} 
                onChange={e => setFormData({...formData, date: e.target.value})} 
             />
           </div>
        </div>

        <div className="form-group" style={{display: 'flex', gap: '30px'}}>
           <div style={{flex: 1}}>
             <label>Bắt đầu:</label>
             <select value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})}>
               {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
             </select>
           </div>
           <div style={{flex: 1}}>
             <label>Kết thúc:</label>
             <select value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})}>
               {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
             </select>
           </div>
        </div>

        <div className="form-group">
          <label>Địa điểm:</label>
          <input 
            value={formData.location} 
            onChange={e => setFormData({...formData, location: e.target.value})}
            placeholder="VD: Studio A, Cafe acoustic..." 
          />
        </div>

        <div className="form-group">
          <label>Nhân sự tham gia:</label>
          <div style={{
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '8px', 
              maxHeight: '120px', 
              overflowY: 'auto',
              border: '1px solid #ddd',
              padding: '10px',
              borderRadius: '5px',
              backgroundColor: '#fafafa'
          }}>
            {members && members.length > 0 ? members.map(mem => (
              <button 
                key={mem.id}
                onClick={() => toggleParticipant(mem.name)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: formData.participants.includes(mem.name) ? '1px solid #0056b3' : '1px solid #ccc',
                  backgroundColor: formData.participants.includes(mem.name) ? '#007bff' : 'white',
                  color: formData.participants.includes(mem.name) ? 'white' : '#333',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s'
                }}
              >
                {mem.name}
              </button>
            )) : <small style={{color: '#999'}}>Đang tải danh sách thành viên...</small>}
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose}>Hủy</button>
          <button className="btn-create" onClick={handleSubmit}>
            {mode === 'edit' ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;