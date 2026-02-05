import { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import { connectWebSocket, disconnectWebSocket } from '../services/websocket';

// Notification type icons and colors
const NOTIFICATION_CONFIG = {
  comment: { icon: '💬', color: '#3b82f6' },
  like: { icon: '❤️', color: '#ef4444' },
  mention: { icon: '🔔', color: '#f59e0b' },
  follow: { icon: '👤', color: '#8b5cf6' }
};

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const userId = 1;

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();

    const socket = connectWebSocket(userId, (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => disconnectWebSocket();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await notificationAPI.getNotifications(userId);
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount(userId);
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead(userId);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          fontSize: '24px',
          background: 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          padding: '10px 14px',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            borderRadius: '12px',
            minWidth: '20px',
            height: '20px',
            fontSize: '11px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 6px',
            animation: 'pulse 2s infinite',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="fade-in" style={{
          position: 'absolute',
          top: '50px',
          right: '-35px',
          width: '380px',
          maxHeight: '520px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          zIndex: 1000,
          overflow: 'hidden',
          border: '1px solid rgba(0, 0, 0, 0.08)'
        }}>
          {/* Header */}
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(to bottom, #fafafa, #ffffff)'
          }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937'
            }}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div style={{
            maxHeight: '440px',
            overflowY: 'auto'
          }}>
            {notifications.length === 0 ? (
              <div style={{ 
                padding: '60px 20px', 
                textAlign: 'center',
                color: '#9ca3af'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔕</div>
                <div style={{ fontSize: '15px', fontWeight: '500' }}>No notifications yet</div>
                <div style={{ fontSize: '13px', marginTop: '4px' }}>We'll notify you when something arrives</div>
              </div>
            ) : (
              notifications.map((notif, index) => {
                const config = NOTIFICATION_CONFIG[notif.type] || { icon: '🔔', color: '#6b7280' };
                
                return (
                  <div
                    key={notif.id}
                    onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                    className="slide-in"
                    style={{
                      padding: '16px 20px',
                      borderBottom: index < notifications.length - 1 ? '1px solid #f3f4f6' : 'none',
                      cursor: notif.is_read ? 'default' : 'pointer',
                      background: notif.is_read ? 'white' : '#f0f4ff',
                      transition: 'all 0.2s ease',
                      animationDelay: `${index * 0.05}s`
                    }}
                    onMouseEnter={(e) => {
                      if (!notif.is_read) {
                        e.currentTarget.style.background = '#e5edff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = notif.is_read ? 'white' : '#f0f4ff';
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {/* Icon */}
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: `${config.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        flexShrink: 0
                      }}>
                        {config.icon}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '4px'
                        }}>
                          <strong style={{ 
                            fontSize: '14px',
                            color: '#1f2937',
                            fontWeight: '600',
                            display: 'block',
                            lineHeight: '1.4'
                          }}>
                            {notif.title}
                          </strong>
                          {!notif.is_read && (
                            <span style={{
                              width: '8px',
                              height: '8px',
                              background: config.color,
                              borderRadius: '50%',
                              marginTop: '4px',
                              marginLeft: '8px',
                              flexShrink: 0
                            }}></span>
                          )}
                        </div>
                        {notif.message && (
                          <div style={{ 
                            fontSize: '13px', 
                            color: '#6b7280',
                            marginBottom: '6px',
                            lineHeight: '1.5'
                          }}>
                            {notif.message}
                          </div>
                        )}
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#9ca3af',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span>{getTimeAgo(notif.created_at)}</span>
                          {notif.priority === 'high' && (
                            <>
                              <span>•</span>
                              <span style={{ 
                                color: '#ef4444',
                                fontWeight: '500',
                                fontSize: '11px',
                                background: '#fef2f2',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}>
                                HIGH
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;