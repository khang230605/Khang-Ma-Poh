import { useState } from 'react';
import BandCalendar from './BandCalendar';
import TimeFinder from './TimeFinder';

const ScheduleWrapper = ({ currentUser }) => {
  const [tab, setTab] = useState('calendar'); // 'calendar' hoặc 'finder'

  return (
    <div className="schedule-wrapper" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* THANH TAB NAVIGATION */}
      <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid #ddd', 
          background: 'white',
          padding: '0 20px'
      }}>
        <button 
            onClick={() => setTab('calendar')}
            style={{
                padding: '15px 20px',
                background: 'none',
                border: 'none',
                borderBottom: tab === 'calendar' ? '3px solid #d71920' : '3px solid transparent',
                fontWeight: tab === 'calendar' ? 'bold' : 'normal',
                cursor: 'pointer',
                fontSize: '1rem'
            }}
        >
            📅 Lịch Sự Kiện
        </button>
        <button 
            onClick={() => setTab('finder')}
            style={{
                padding: '15px 20px',
                background: 'none',
                border: 'none',
                borderBottom: tab === 'finder' ? '3px solid #d71920' : '3px solid transparent',
                fontWeight: tab === 'finder' ? 'bold' : 'normal',
                cursor: 'pointer',
                fontSize: '1rem'
            }}
        >
            🕵️‍♀️ Dò Lịch Rảnh (When2Meet)
        </button>
      </div>

      {/* NỘI DUNG CHÍNH */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {tab === 'calendar' ? (
            <BandCalendar currentUser={currentUser} />
        ) : (
            <TimeFinder currentUser={currentUser} />
        )}
      </div>
    </div>
  );
};

export default ScheduleWrapper;