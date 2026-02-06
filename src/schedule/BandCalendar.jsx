import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import EventModal from './EventModal';
import './schedule.css';

// --- IMPORT FIREBASE ---
import { db } from '../firebase'; // Sửa đường dẫn nếu file firebase.js của bạn nằm chỗ khác
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore'; 

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const BandCalendar = ({ currentUser }) => {
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]); // State lưu danh sách user từ DB
  const [modalOpen, setModalOpen] = useState(false);

  // modalMode có các trạng thái: 'create' | 'edit' | 'list_edit' | 'view' (MỚI)
  const [modalMode, setModalMode] = useState('create'); 
  const [selectedEvent, setSelectedEvent] = useState(null);

  // --- Logic check Admin ---
  const isAdmin = currentUser?.role === 'admin';

  // 1. FETCH EVENTS TỪ FIREBASE
  const fetchEvents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "hdcg_schedule"));
      const loadedEvents = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Quan trọng: Convert Firestore Timestamp sang JS Date object
          start: data.start.toDate ? data.start.toDate() : new Date(data.start),
          end: data.end.toDate ? data.end.toDate() : new Date(data.end),
        };
      });
      setEvents(loadedEvents);
    } catch (error) {
      console.error("Lỗi lấy lịch:", error);
    }
  };

  // 2. FETCH USERS TỪ FIREBASE (Để chọn nhân sự)
  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name, // Lấy trường 'name' như trong hình bạn gửi
        // Có thể lấy thêm role nếu cần filter
      }));
      setMembers(userList);
    } catch (error) {
      console.error("Lỗi lấy danh sách user:", error);
    }
  };

  // Chạy khi component load
  useEffect(() => {
    fetchEvents();
    fetchUsers();
  }, []);

// 1. Khi click vào 1 sự kiện trên lịch
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setModalMode('view'); // Mở chế độ xem chi tiết
    setModalOpen(true);
  };

  const handleCreateClick = () => {
    setModalMode('create');
    setSelectedEvent(null);
    setModalOpen(true);
  };

  // Logic chuyển từ Xem -> Sửa (Được gọi từ Modal)
  const handleSwitchToEdit = () => {
    setModalMode('edit');
  };

  // Logic xoá sự kiện (Admin only)
  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Bạn chắc chắn muốn xoá sự kiện này?")) {
        try {
            await deleteDoc(doc(db, "hdcg_schedule", eventId));
            setModalOpen(false);
            fetchEvents(); // Load lại lịch
        } catch (e) {
            alert("Lỗi khi xoá: " + e.message);
        }
    }
  };

  // --- LƯU (THÊM HOẶC SỬA) VÀO DATABASE ---
  const handleSaveEvent = async (eventData) => {
    try {
      if (selectedEvent && eventData.id) {
        // --- LOGIC UPDATE ---
        const eventRef = doc(db, "hdcg_schedule", eventData.id);
        
        // Loại bỏ trường id trước khi update để tránh lỗi dư thừa trong data
        const { id, ...dataToUpdate } = eventData;
        
        await updateDoc(eventRef, dataToUpdate);
        alert("Đã cập nhật sự kiện!");
      } else {
        // --- LOGIC CREATE ---
        // Xóa id null nếu có
        const { id, ...newEventData } = eventData;
        
        await addDoc(collection(db, "hdcg_schedule"), newEventData);
        alert("Đã tạo sự kiện mới!");
      }

      // Đóng modal và tải lại dữ liệu mới nhất
      setModalOpen(false);
      fetchEvents(); 

    } catch (e) {
      console.error("Error adding/updating document: ", e);
      alert("Có lỗi xảy ra khi lưu!");
    }
  };

return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h2>📅 Lịch Hoạt Động HDCG</h2>
        {isAdmin && (
          <div className="admin-controls">
            <button className="btn-create" onClick={handleCreateClick}>+ Tạo sự kiện</button>
          </div>
        )}
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        // style={{ height: 600 }}  <-- XÓA DÒNG NÀY (để CSS tự xử lý)
        views={['month', 'week', 'day']}
        defaultView="month"
        onSelectEvent={handleEventClick} // <--- QUAN TRỌNG: Sự kiện click
        eventPropGetter={(event) => {
            let backgroundColor = '#3174ad';
            if (event.type && event.type.toLowerCase().includes('show')) backgroundColor = '#d9534f'; 
            if (event.type && event.type.toLowerCase().includes('ăn')) backgroundColor = '#5cb85c';
            return { style: { backgroundColor } };
        }}
      />

      <EventModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent} // Truyền hàm xoá
        initialData={selectedEvent}
        mode={modalMode} // Truyền mode vào để Modal biết hiển thị View hay Edit
        members={members}
        isAdmin={isAdmin} // Truyền quyền admin vào modal
        onSwitchToEdit={handleSwitchToEdit} // Hàm chuyển đổi mode
      />
    </div>
  );
};

export default BandCalendar;