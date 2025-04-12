// src/services/api.js
import axios from 'axios';

// Django'dan gelen CSRF token'ı cookie'den çekmek için yardımcı fonksiyon
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Session/cookie bilgilerini gönderir.
});

api.interceptors.request.use(
  (config) => {
    // AuthContext'te saklanan kullanıcı bilgisi (token) localStorage'de de tutuluyor.
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.token) {
          config.headers.Authorization = `Bearer ${parsedUser.token}`;
        }
      } catch (error) {
        console.error("User parse error:", error);
      }
    }

    // Django CSRF token'ı ekleme
    const csrftoken = getCookie('csrftoken');
    if (csrftoken) {
      config.headers['X-CSRFToken'] = csrftoken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
