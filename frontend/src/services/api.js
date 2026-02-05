import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const notificationAPI = {
  getNotifications: (userId, limit = 20, offset = 0) => 
    axios.get(`${API_BASE_URL}/notifications/user/${userId}?limit=${limit}&offset=${offset}`),
  
  getUnreadCount: (userId) => 
    axios.get(`${API_BASE_URL}/notifications/user/${userId}/unread/count`),
  
  createNotification: (data) => 
    axios.post(`${API_BASE_URL}/notifications`, data),
  
  markAsRead: (id) => 
    axios.put(`${API_BASE_URL}/notifications/${id}/read`),
  
  markAllAsRead: (userId) => 
    axios.put(`${API_BASE_URL}/notifications/user/${userId}/read-all`)
};

export const preferenceAPI = {
  getPreferences: (userId) => 
    axios.get(`${API_BASE_URL}/preferences/${userId}`),
  
  updatePreferences: (userId, data) => 
    axios.put(`${API_BASE_URL}/preferences/${userId}`, data)
};