// src/services/api.js
import axios from 'axios';

// Django'dan gelen CSRF token'ı cookie'den çekmeye yarayan yardımcı fonksiyon
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

// Axios instance'ı session/cookie tabanlı auth için yapılandırıyoruz.
const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Session/cookie bilgilerini gönderir.
});

// İstek öncesi interceptor
api.interceptors.request.use(
  (config) => {
    // Eğer token kullanmıyorsanız, Authorization kısmını kaldırabilirsiniz.
    // Eğer kullanıcı hesabına ait ek bir token varsa ve AuthContext’te saklanıyorsa,
    // bunu localStorage'dan veya başka yoldan alıp header'a ekleyebilirsiniz.
    // Örneğin:
    // const storedUser = localStorage.getItem('user');
    // if (storedUser) {
    //   const parsedUser = JSON.parse(storedUser);
    //   if (parsedUser.token) {
    //     config.headers.Authorization = `Bearer ${parsedUser.token}`;
    //   }
    // }

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
