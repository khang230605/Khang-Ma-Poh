import { useState, useEffect } from 'react';
import ScheduleSelector from 'react-schedule-selector';
import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const TimeFinder = ({ currentUser }) => {
  const [polls, setPolls] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);
  
  // State cho việc chọn giờ
  const [schedule, setSchedule] = useState([]);
  
  // State tạo poll mới (Ai cũng tạo được)
  const [newPollName, setNewPollName] = useState('');
  
  // Khởi tạo ngày mặc định cho form tạo: Hôm nay và 7 ngày sau
  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 6);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];

  const [startDateInput, setStartDateInput] = useState(todayStr);
  const [endDateInput, setEndDateInput] = useState(nextWeekStr);

  const isAdmin = currentUser?.role === 'admin';

  // 1. Fetch danh sách các đợt khảo sát
  const fetchPolls = async () => {
    try {
      const q = await getDocs(collection(db, "hdcg_polls"));
      // Sort để đợt mới nhất lên đầu
      const list = q.docs.map(d => ({ id: d.id, ...d.data() }))
                     .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPolls(list);
    } catch (e) {
      console.error("Lỗi lấy polls:", e);
    }
  };

  useEffect(() => { fetchPolls(); }, []);

  // 2. Tạo đợt khảo sát mới (Ai cũng tạo được)
  const handleCreatePoll = async () => {
    if (!newPollName) return alert("Vui lòng nhập tên đợt khảo sát!");
    if (!startDateInput || !endDateInput) return alert("Vui lòng chọn ngày bắt đầu và kết thúc!");
    
    const start = new Date(startDateInput);
    const end = new Date(endDateInput);
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);

    if (end < start) return alert("Ngày kết thúc phải sau ngày bắt đầu!");

    // Tính số ngày cần hiển thị
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 

    // Giới hạn max 10 ngày để tránh lag giao diện
    if (diffDays > 10) return alert("Chỉ nên tạo tối đa 10 ngày để dễ nhìn!");

    try {
      await addDoc(collection(db, "hdcg_polls"), {
        title: newPollName,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.name,
        // Lưu cấu hình ngày tháng để hiển thị lại cho đúng
        config: {
            startDate: start.toISOString(), // Lưu mốc bắt đầu
            numDays: diffDays               // Lưu số lượng ngày
        },
        responses: {} 
      });
      alert("Đã tạo đợt dò lịch mới!");
      setNewPollName('');
      setStartDateInput(todayStr); // Reset form
      fetchPolls();
    } catch (e) {
      console.error(e);
      alert("Lỗi khi tạo: " + e.message);
    }
  };

  // 3. Xử lý khi chọn giờ (Lưu vào state tạm)
  const handleChange = (newSchedule) => {
    setSchedule(newSchedule);
  };

  // 4. Gửi kết quả lên Firebase
  const handleSubmitAvailability = async () => {
    if (!selectedPoll) return;
    
    const stringDates = schedule.map(d => d.toISOString());

    try {
      const pollRef = doc(db, "hdcg_polls", selectedPoll.id);
      
      await updateDoc(pollRef, {
        [`responses.${currentUser.id}`]: {
            name: currentUser.name,
            slots: stringDates
        }
      });
      
      alert("Đã cập nhật lịch rảnh của bạn! ✅");
      
      // Update local state
      const updatedPolls = polls.map(p => {
          if (p.id === selectedPoll.id) {
              return {
                  ...p,
                  responses: {
                      ...p.responses,
                      [currentUser.id]: { name: currentUser.name, slots: stringDates }
                  }
              };
          }
          return p;
      });
      setPolls(updatedPolls);
      setSelectedPoll(updatedPolls.find(p => p.id === selectedPoll.id));

    } catch (e) {
      console.error(e);
      alert("Lỗi lưu lịch!");
    }
  };

  const handleDeletePoll = async (id) => {
      if(window.confirm("Xóa đợt dò lịch này?")) {
          await deleteDoc(doc(db, "hdcg_polls", id));
          fetchPolls();
          if(selectedPoll?.id === id) setSelectedPoll(null);
      }
  }

  // --- LOGIC HIỂN THỊ ---
  
  const getAggregateSchedule = () => {
      if (!selectedPoll || !selectedPoll.responses) return [];
      let allSlots = [];
      Object.values(selectedPoll.responses).forEach(resp => {
          if(resp.slots) {
              const dates = resp.slots.map(s => new Date(s));
              allSlots = [...allSlots, ...dates];
          }
      });
      return allSlots;
  };

  const renderCustomDateCell = (time, selected, innerProps) => {
      if (!selectedPoll) return <div {...innerProps}></div>;
      let count = 0;
      let totalPeople = Object.keys(selectedPoll.responses || {}).length;
      const timeISO = time.toISOString();
      Object.values(selectedPoll.responses || {}).forEach(resp => {
          if (resp.slots && resp.slots.includes(timeISO)) count++;
      });
      const alpha = totalPeople > 0 ? (count / totalPeople) : 0;
      const backgroundColor = count > 0 ? `rgba(40, 167, 69, ${Math.max(0.2, alpha)})` : '#eee'; 
      return (
          <div {...innerProps} style={{ 
              ...innerProps.style, backgroundColor, border: '1px solid #fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', color: alpha > 0.5 ? 'white' : 'black'
          }}>
              {count > 0 && count}
          </div>
      );
  };

  // Helper function để format ngày hiển thị ở List
  const formatPollRange = (poll) => {
      if (!poll.config) return '(Không có ngày cụ thể)';
      const start = new Date(poll.config.startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + (poll.config.numDays - 1));
      return `${start.toLocaleDateString('vi-VN')} - ${end.toLocaleDateString('vi-VN')}`;
  };

  return (
    <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
      
      {/* 1. DANH SÁCH CÁC ĐỢT DÒ LỊCH */}
      {!selectedPoll ? (
        <div className="poll-list">
            <h2 style={{borderBottom: '2px solid #333', paddingBottom: 10}}>🕵️‍♀️ Dò lịch rảnh (When2Meet)</h2>
            
            {/* FORM TẠO MỚI - AI CŨNG THẤY */}
            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd' }}>
                <h4 style={{marginTop: 0}}>+ Tạo đợt dò mới</h4>
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <input 
                        placeholder="Tên đợt (VD: Tập show 20/11)" 
                        value={newPollName} 
                        onChange={e => setNewPollName(e.target.value)}
                        style={{padding: 8, border: '1px solid #ccc', borderRadius: 4}}
                    />
                    <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                        <div style={{flex: 1}}>
                            <label style={{fontSize: '0.8rem', display: 'block', marginBottom: 2}}>Từ ngày:</label>
                            <input type="date" value={startDateInput} onChange={e => setStartDateInput(e.target.value)} style={{width: '100%', padding: 6}} />
                        </div>
                        <div style={{flex: 1}}>
                             <label style={{fontSize: '0.8rem', display: 'block', marginBottom: 2}}>Đến ngày:</label>
                            <input type="date" value={endDateInput} onChange={e => setEndDateInput(e.target.value)} style={{width: '100%', padding: 6}} />
                        </div>
                        <button onClick={handleCreatePoll} className="btn-create" style={{height: '36px', marginTop: '16px'}}>Tạo ngay</button>
                    </div>
                </div>
            </div>

            <div className="list-group">
                {polls.map(poll => (
                    <div key={poll.id} style={{
                        padding: '15px', border: '1px solid #ddd', margin: '10px 0', borderRadius: '8px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                    }}>
                        <div>
                            <h3 style={{margin: '0 0 5px 0'}}>{poll.title}</h3>
                            <div style={{color: '#555', fontSize: '0.9rem', marginBottom: '5px'}}>
                                📅 <strong>{formatPollRange(poll)}</strong>
                            </div>
                            <small style={{color: '#888'}}>Tạo bởi: {poll.createdBy} • {Object.keys(poll.responses || {}).length} người đã điền</small>
                        </div>
                        <div style={{display: 'flex', gap: '10px'}}>
                            <button onClick={() => {
                                setSelectedPoll(poll);
                                const myResp = poll.responses?.[currentUser.id];
                                setSchedule(myResp?.slots ? myResp.slots.map(s => new Date(s)) : []);
                            }} style={{background: '#007bff', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer'}}>
                                👉 Vào điền / Xem
                            </button>
                            {isAdmin && <button onClick={() => handleDeletePoll(poll.id)} style={{background: '#dc3545', color: 'white', border: 'none', padding: '8px', borderRadius: '4px'}}>🗑</button>}
                        </div>
                    </div>
                ))}
                {polls.length === 0 && <p style={{textAlign: 'center', color: '#777'}}>Chưa có đợt dò lịch nào.</p>}
            </div>
        </div>
      ) : (
        // 2. GIAO DIỆN CHI TIẾT
        <div className="poll-detail">
            <button onClick={() => setSelectedPoll(null)} style={{marginBottom: 10, cursor: 'pointer', background: 'none', border: 'none', fontSize: '1rem'}}>
                ← Quay lại danh sách
            </button>
            
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
                <div>
                    <h2 style={{margin: 0}}>{selectedPoll.title}</h2>
                    <span style={{color: '#666'}}>⏱ {formatPollRange(selectedPoll)}</span>
                </div>
                <div style={{textAlign: 'right'}}>
                    <span style={{display: 'block', fontSize: '0.9rem', color: '#666'}}>Bạn đang chọn giờ cho: <strong>{currentUser.name}</strong></span>
                    <button onClick={handleSubmitAvailability} className="btn-create" style={{marginTop: 5}}>
                        💾 Lưu lịch rảnh của tôi
                    </button>
                </div>
            </div>

            <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
                {/* CỘT TRÁI: CHỌN GIỜ CÁ NHÂN */}
                <div style={{flex: 1, minWidth: '300px'}}>
                    <h4 style={{textAlign: 'center', background: '#e3f2fd', padding: 5, margin: 0}}>1. Tô màu giờ BẠN rảnh</h4>
                    <ScheduleSelector
                        selection={schedule}
                        // Lấy startDate và numDays từ DB
                        startDate={selectedPoll.config ? new Date(selectedPoll.config.startDate) : new Date()}
                        numDays={selectedPoll.config ? selectedPoll.config.numDays : 7}
                        minTime={8}
                        maxTime={23}
                        hourlyChunk={60}
                        dateFormat="ddd DD/MM"
                        onChange={handleChange}
                        selectedColor={'#007bff'}
                        unselectedColor={'#f8f9fa'}
                        hoveredColor={'#b3d7ff'}
                    />
                </div>

                {/* CỘT PHẢI: KẾT QUẢ CHUNG */}
                <div style={{flex: 1, minWidth: '300px'}}>
                     <h4 style={{textAlign: 'center', background: '#d4edda', padding: 5, margin: 0}}>2. Kết quả chung ({Object.keys(selectedPoll.responses || {}).length} người)</h4>
                     <ScheduleSelector
                        selection={getAggregateSchedule()}
                        // Lấy startDate và numDays giống bên trái
                        startDate={selectedPoll.config ? new Date(selectedPoll.config.startDate) : new Date()}
                        numDays={selectedPoll.config ? selectedPoll.config.numDays : 7}
                        minTime={8}
                        maxTime={23}
                        dateFormat="ddd DD/MM"
                        onChange={() => {}}
                        renderDateCell={renderCustomDateCell}
                    />
                    <div style={{marginTop: 10, fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center'}}>
                        * Màu càng đậm = Càng nhiều người rảnh
                    </div>
                </div>
            </div>

            <div style={{marginTop: 30, padding: 15, background: '#f1f1f1', borderRadius: 8}}>
                <strong>Đã nhận phản hồi từ: </strong>
                {Object.values(selectedPoll.responses || {}).map((r, i) => (
                    <span key={i} style={{marginRight: 10, background: 'white', padding: '2px 8px', borderRadius: 10, fontSize: '0.85rem'}}>
                        ✅ {r.name}
                    </span>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default TimeFinder;