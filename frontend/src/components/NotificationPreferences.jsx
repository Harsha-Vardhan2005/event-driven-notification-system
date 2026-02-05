import { useState, useEffect } from 'react';
import { preferenceAPI } from '../services/api';

function NotificationPreferences() {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const userId = 1;

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await preferenceAPI.getPreferences(userId);
      setPreferences(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading preferences:', error);
      setLoading(false);
    }
  };

  const handleToggleChannel = async (channel) => {
    const updatedPrefs = {
      ...preferences,
      [`${channel}_enabled`]: !preferences[`${channel}_enabled`]
    };
    
    try {
      await preferenceAPI.updatePreferences(userId, updatedPrefs);
      setPreferences(updatedPrefs);
      showSavedFeedback();
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const handleToggleNotificationType = async (type) => {
    const updatedTypes = {
      ...preferences.notification_types,
      [type]: !preferences.notification_types[type]
    };
    
    const updatedPrefs = {
      ...preferences,
      notification_types: updatedTypes
    };
    
    try {
      await preferenceAPI.updatePreferences(userId, updatedPrefs);
      setPreferences(updatedPrefs);
      showSavedFeedback();
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const showSavedFeedback = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '400px'
      }}>
        <div style={{ 
          fontSize: '48px',
          animation: 'pulse 1.5s infinite'
        }}>⚙️</div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px',
        color: '#ef4444'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <div style={{ fontSize: '18px', fontWeight: '600' }}>Error loading preferences</div>
      </div>
    );
  }

  const typeIcons = {
    comment: '💬',
    like: '❤️',
    mention: '🔔',
    follow: '👤'
  };

  const typeDescriptions = {
    comment: 'When someone comments on your posts',
    like: 'When someone likes your content',
    mention: 'When someone mentions you',
    follow: 'When someone follows you'
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      {/* Saved Feedback */}
      {saved && (
        <div className="fade-in" style={{
          position: 'fixed',
          top: '100px',
          right: '24px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontWeight: '500'
        }}>
          <span style={{ fontSize: '20px' }}>✓</span>
          Preferences saved!
        </div>
      )}

      {/* Header */}
      <div style={{
        background: 'white',
        padding: '32px',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</div>
        <h1 style={{ 
          margin: '0 0 8px 0',
          fontSize: '28px',
          fontWeight: '700',
          color: '#1f2937'
        }}>
          Notification Preferences
        </h1>
        <p style={{
          margin: 0,
          fontSize: '15px',
          color: '#6b7280'
        }}>
          Customize how and when you receive notifications
        </p>
      </div>

      {/* Channels Section */}
      <div style={{
        background: 'white',
        padding: '28px',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        marginBottom: '24px'
      }}>
        <h2 style={{ 
          margin: '0 0 8px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>📡</span>
          Notification Channels
        </h2>
        <p style={{
          margin: '0 0 20px 0',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          Choose where you want to receive notifications
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* In-App Channel */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            padding: '20px',
            background: preferences.inapp_enabled ? 'linear-gradient(135deg, #f0f4ff 0%, #e5edff 100%)' : '#f9fafb',
            border: `2px solid ${preferences.inapp_enabled ? '#667eea' : '#e5e7eb'}`,
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!preferences.inapp_enabled) {
              e.currentTarget.style.borderColor = '#d1d5db';
            }
          }}
          onMouseLeave={(e) => {
            if (!preferences.inapp_enabled) {
              e.currentTarget.style.borderColor = '#e5e7eb';
            }
          }}>
            <input
              type="checkbox"
              checked={preferences.inapp_enabled}
              onChange={() => handleToggleChannel('inapp')}
              style={{ 
                marginRight: '16px', 
                width: '20px', 
                height: '20px', 
                cursor: 'pointer',
                accentColor: '#667eea'
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontWeight: '600',
                fontSize: '15px',
                color: '#1f2937',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>🔔</span>
                In-App Notifications
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                Get notified while using the app with real-time updates
              </div>
            </div>
            {preferences.inapp_enabled && (
              <span style={{
                background: '#667eea',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                Active
              </span>
            )}
          </label>

          {/* Email Channel */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            padding: '20px',
            background: preferences.email_enabled ? 'linear-gradient(135deg, #f0f4ff 0%, #e5edff 100%)' : '#f9fafb',
            border: `2px solid ${preferences.email_enabled ? '#667eea' : '#e5e7eb'}`,
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!preferences.email_enabled) {
              e.currentTarget.style.borderColor = '#d1d5db';
            }
          }}
          onMouseLeave={(e) => {
            if (!preferences.email_enabled) {
              e.currentTarget.style.borderColor = '#e5e7eb';
            }
          }}>
            <input
              type="checkbox"
              checked={preferences.email_enabled}
              onChange={() => handleToggleChannel('email')}
              style={{ 
                marginRight: '16px', 
                width: '20px', 
                height: '20px', 
                cursor: 'pointer',
                accentColor: '#667eea'
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontWeight: '600',
                fontSize: '15px',
                color: '#1f2937',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>📧</span>
                Email Notifications
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                Receive notifications in your inbox 
              </div>
            </div>
            {preferences.email_enabled && (
              <span style={{
                background: '#667eea',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                Active
              </span>
            )}
          </label>
        </div>
      </div>

      {/* Notification Types Section */}
      <div style={{
        background: 'white',
        padding: '28px',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}>
        <h2 style={{ 
          margin: '0 0 8px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>🎯</span>
          Notification Types
        </h2>
        <p style={{
          margin: '0 0 20px 0',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          Select which types of notifications you want to receive
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.entries(preferences.notification_types).map(([type, enabled]) => (
            <label
              key={type}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '18px',
                background: enabled ? 'linear-gradient(135deg, #f0f4ff 0%, #e5edff 100%)' : '#f9fafb',
                border: `2px solid ${enabled ? '#667eea' : '#e5e7eb'}`,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!enabled) {
                  e.currentTarget.style.borderColor = '#d1d5db';
                }
              }}
              onMouseLeave={(e) => {
                if (!enabled) {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }
              }}
            >
              <input
                type="checkbox"
                checked={enabled}
                onChange={() => handleToggleNotificationType(type)}
                style={{ 
                  marginRight: '16px', 
                  width: '20px', 
                  height: '20px', 
                  cursor: 'pointer',
                  accentColor: '#667eea'
                }}
              />
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: enabled ? '#667eea15' : '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                marginRight: '16px',
                transition: 'all 0.2s'
              }}>
                {typeIcons[type]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontWeight: '600',
                  fontSize: '15px',
                  color: '#1f2937',
                  textTransform: 'capitalize',
                  marginBottom: '2px'
                }}>
                  {type}
                </div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                  {typeDescriptions[type]}
                </div>
              </div>
              {enabled && (
                <span style={{
                  color: '#667eea',
                  fontSize: '20px'
                }}>
                  ✓
                </span>
              )}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NotificationPreferences;