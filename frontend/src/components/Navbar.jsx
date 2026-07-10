import React from 'react';

export default function Navbar({ setCurrentPage }) {
  return (
    <div style={{ padding: '1rem', backgroundColor: '#111827', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h2>Navbar (Placeholder)</h2>
      <div>
        <button 
          onClick={() => setCurrentPage('home')} 
          style={{ marginRight: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
        >
          หน้าหลัก (Home)
        </button>
        <button 
          onClick={() => setCurrentPage('login')} 
          style={{ padding: '0.5rem 1rem', cursor: 'pointer', backgroundColor: '#00F5FF', color: '#000', border: 'none', fontWeight: 'bold' }}
        >
          ไปหน้า Login (สำหรับ Dev 1)
        </button>
      </div>
    </div>
  );
}
