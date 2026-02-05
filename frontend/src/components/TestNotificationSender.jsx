import { useState } from 'react';
import { notificationAPI } from '../services/api';

function TestNotificationSender() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('medium');
  const [type, setType] = useState('comment');
  const [sending, setSending] = useState(false);

  const sendNotification = async (e) => {
    e.preventDefault();
    setSending(true);
    
    try {
      await notificationAPI.createNotification({
        userId: 1,
        type,
        title,
        message,
        priority
      });
      
      setTitle('');
      setMessage('');
      console.log('Notification sent successfully');
      
      // Quick success feedback
      setTimeout(() => setSending(false), 500);
    } catch (error) {
      console.error('Error sending notification:', error);
      setSending(false);
    }
  };

  const quickTests = [
    { type: 'comment', title: 'New comment', message: 'Sarah commented on your post', priority: 'medium', icon: '💬' },
    { type: 'like', title: 'New like', message: 'John liked your photo', priority: 'low', icon: '❤️' },
    { type: 'mention', title: 'You were mentioned', message: 'Alex mentioned you in a comment', priority: 'high', icon: '🔔' },
    { type: 'follow', title: 'New follower', message: 'Mike started following you', priority: 'medium', icon: '👤' }
  ];

  const sendQuickTest = async (test) => {
    try {
      await notificationAPI.createNotification({
        userId: 1,
        ...test
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Quick Test Buttons */}
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        marginBottom: '24px'
      }}>
        <h2 style={{ 
          margin: '0 0 16px 0',
          fontSize: '20px',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          Quick Test
        </h2>
        <p style={{
          margin: '0 0 20px 0',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          Send a sample notification with one click
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px'
        }}>
          {quickTests.map((test) => (
            <button
              key={test.type}
              onClick={() => sendQuickTest(test)}
              style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = '#667eea';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{test.icon}</div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>{test.type}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>{test.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Notification Form */}
      <div style={{
        background: 'white',
        padding: '32px',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}>
        <h2 style={{ 
          margin: '0 0 8px 0',
          fontSize: '20px',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          Custom Notification
        </h2>
        <p style={{
          margin: '0 0 24px 0',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          Create a custom notification with your own content
        </p>

        <form onSubmit={sendNotification}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter notification title"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid #e5e7eb',
                fontSize: '15px',
                transition: 'all 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="3"
              placeholder="Enter notification message (optional)"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid #e5e7eb',
                fontSize: '15px',
                transition: 'all 0.2s',
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #e5e7eb',
                  fontSize: '15px',
                  transition: 'all 0.2s',
                  outline: 'none',
                  cursor: 'pointer',
                  background: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="comment">💬 Comment</option>
                <option value="like">❤️ Like</option>
                <option value="mention">🔔 Mention</option>
                <option value="follow">👤 Follow</option>
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Priority *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #e5e7eb',
                  fontSize: '15px',
                  transition: 'all 0.2s',
                  outline: 'none',
                  cursor: 'pointer',
                  background: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="low">🔵 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={sending}
            style={{
              width: '100%',
              padding: '14px',
              background: sending ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: sending ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.2s',
              boxShadow: sending ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!sending) {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = sending ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.3)';
            }}
          >
            {sending ? '✓ Sent!' : '📤 Send Notification'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TestNotificationSender;