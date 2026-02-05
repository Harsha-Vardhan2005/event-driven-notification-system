const getNotificationIcon = (type) => {
  const icons = {
    comment: '💬',
    like: '❤️',
    mention: '🔔',
    follow: '👤'
  };
  return icons[type] || '🔔';
};

const getNotificationColor = (type) => {
  const colors = {
    comment: '#3b82f6',
    like: '#ef4444',
    mention: '#f59e0b',
    follow: '#8b5cf6'
  };
  return colors[type] || '#667eea';
};

// Single notification email (for high priority)
const singleNotificationTemplate = (notification) => {
  const icon = getNotificationIcon(notification.type);
  const color = getNotificationColor(notification.type);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          margin: 0; 
          padding: 0; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          background-color: #f5f5f5;
        }
        .container { 
          max-width: 600px; 
          margin: 40px auto; 
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 32px 24px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          color: white;
          font-size: 20px;
          font-weight: 600;
        }
        .content { 
          padding: 32px 24px;
        }
        .notification-card {
          background: #f9fafb;
          border-left: 4px solid ${color};
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .notification-icon {
          font-size: 32px;
          margin-bottom: 12px;
        }
        .notification-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }
        .notification-message {
          font-size: 15px;
          color: #6b7280;
          margin: 0;
          line-height: 1.5;
        }
        .priority-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          margin-top: 12px;
          background: #fee2e2;
          color: #991b1b;
        }
        .footer {
          padding: 24px;
          text-align: center;
          color: #9ca3af;
          font-size: 13px;
          border-top: 1px solid #f3f4f6;
        }
        .footer a {
          color: #667eea;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 New Notification</h1>
        </div>
        <div class="content">
          <div class="notification-card">
            <div class="notification-icon">${icon}</div>
            <h2 class="notification-title">${notification.title}</h2>
            ${notification.message ? `<p class="notification-message">${notification.message}</p>` : ''}
            ${notification.priority === 'high' ? '<span class="priority-badge">High Priority</span>' : ''}
          </div>
        </div>
        <div class="footer">
          <p>You're receiving this because you enabled email notifications.</p>
          <p><a href="#">Manage preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Batch notification email (for medium priority - sent every 15 mins)
const batchNotificationTemplate = (notifications) => {
  const count = notifications.length;
  
  const notificationItems = notifications.map(notif => {
    const icon = getNotificationIcon(notif.type);
    const color = getNotificationColor(notif.type);
    
    return `
      <div style="
        background: white;
        border-left: 3px solid ${color};
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
      ">
        <div style="display: flex; align-items: flex-start; gap: 12px;">
          <div style="font-size: 24px;">${icon}</div>
          <div style="flex: 1;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${notif.title}</div>
            ${notif.message ? `<div style="color: #6b7280; font-size: 14px; line-height: 1.5;">${notif.message}</div>` : ''}
            <div style="color: #9ca3af; font-size: 12px; margin-top: 6px;">
              ${new Date(notif.created_at).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          margin: 0; 
          padding: 0; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          background-color: #f5f5f5;
        }
        .container { 
          max-width: 600px; 
          margin: 40px auto; 
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 32px 24px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          color: white;
          font-size: 20px;
          font-weight: 600;
        }
        .header p {
          margin: 8px 0 0 0;
          color: rgba(255,255,255,0.9);
          font-size: 14px;
        }
        .content { 
          padding: 24px;
          background: #f9fafb;
        }
        .footer {
          padding: 24px;
          text-align: center;
          color: #9ca3af;
          font-size: 13px;
          background: white;
        }
        .footer a {
          color: #667eea;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📬 You have ${count} new notification${count > 1 ? 's' : ''}</h1>
          <p>Here's what you missed</p>
        </div>
        <div class="content">
          ${notificationItems}
        </div>
        <div class="footer">
          <p>You're receiving batched notifications every 15 minutes.</p>
          <p><a href="#">Manage preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Daily digest email (for low priority - sent once a day)
const digestNotificationTemplate = (notifications) => {
  const count = notifications.length;
  
  // Group by type
  const grouped = notifications.reduce((acc, notif) => {
    if (!acc[notif.type]) acc[notif.type] = [];
    acc[notif.type].push(notif);
    return acc;
  }, {});
  
  const groupedSections = Object.entries(grouped).map(([type, notifs]) => {
    const icon = getNotificationIcon(type);
    const color = getNotificationColor(type);
    
    return `
      <div style="margin-bottom: 24px;">
        <div style="
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid ${color};
        ">
          <span style="font-size: 24px;">${icon}</span>
          <h3 style="margin: 0; color: #1f2937; font-size: 16px; text-transform: capitalize;">
            ${type} (${notifs.length})
          </h3>
        </div>
        ${notifs.map(n => `
          <div style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
            <div style="font-weight: 500; color: #374151; margin-bottom: 4px;">${n.title}</div>
            ${n.message ? `<div style="color: #6b7280; font-size: 14px;">${n.message}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }).join('');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          margin: 0; 
          padding: 0; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          background-color: #f5f5f5;
        }
        .container { 
          max-width: 600px; 
          margin: 40px auto; 
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 24px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          color: white;
          font-size: 24px;
          font-weight: 600;
        }
        .header p {
          margin: 12px 0 0 0;
          color: rgba(255,255,255,0.9);
          font-size: 15px;
        }
        .content { 
          padding: 32px 24px;
        }
        .footer {
          padding: 24px;
          text-align: center;
          color: #9ca3af;
          font-size: 13px;
          background: #f9fafb;
          border-top: 1px solid #f3f4f6;
        }
        .footer a {
          color: #667eea;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Your Daily Digest</h1>
          <p>${count} notification${count > 1 ? 's' : ''} from the past 24 hours</p>
        </div>
        <div class="content">
          ${groupedSections}
        </div>
        <div class="footer">
          <p>You're receiving a daily digest of low-priority notifications.</p>
          <p><a href="#">Manage preferences</a> · <a href="#">Unsubscribe</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  singleNotificationTemplate,
  batchNotificationTemplate,
  digestNotificationTemplate
};