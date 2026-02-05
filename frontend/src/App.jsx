import { useState } from 'react';
import NotificationBell from './components/NotificationBell';
import TestNotificationSender from './components/TestNotificationSender';
import NotificationPreferences from './components/NotificationPreferences';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Header with gradient */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: '24px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '28px' }}>🔔</span>
              NotifyHub
            </h1>
            <nav style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setCurrentPage('home')}
                style={{
                  background: currentPage === 'home' ? 'rgba(255,255,255,0.25)' : 'transparent',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '500',
                  backdropFilter: currentPage === 'home' ? 'blur(10px)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 'home') {
                    e.target.style.background = 'rgba(255,255,255,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 'home') {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentPage('preferences')}
                style={{
                  background: currentPage === 'preferences' ? 'rgba(255,255,255,0.25)' : 'transparent',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '500',
                  backdropFilter: currentPage === 'preferences' ? 'blur(10px)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 'preferences') {
                    e.target.style.background = 'rgba(255,255,255,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 'preferences') {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                ⚙️ Preferences
              </button>
            </nav>
          </div>
          <NotificationBell />
        </div>
      </header>

      {/* Page Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {currentPage === 'home' && <TestNotificationSender />}
        {currentPage === 'preferences' && <NotificationPreferences />}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '24px',
        color: '#666',
        fontSize: '14px',
        marginTop: '60px'
      }}>
        Built with Node.js, React, PostgreSQL & RabbitMQ 🚀
      </footer>
    </div>
  );
}

export default App;