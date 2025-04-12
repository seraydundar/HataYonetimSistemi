// src/pages/Login.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
// react-icons'dan hata ikonunu ekliyoruz:
import { MdErrorOutline } from 'react-icons/md';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await api.post('accounts/login/', { username, password });
      console.log("Login response:", response.data);

      // Backend'den gelen kullanıcı bilgilerini direkt alıyoruz:
      const loggedUser = response.data.user;

      // AuthContext'e ve localStorage'e kullanıcı bilgisini kaydediyoruz:
      setUser(loggedUser);
      localStorage.setItem("user", JSON.stringify(loggedUser));

      navigate("/hata-yakalama");
    } catch (err) {
      console.error("Giriş hatası:", err);
      setError("Giriş başarısız. Lütfen kullanıcı adı ve şifrenizi kontrol edin.");
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Giriş Yap</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '10px' }}>
          <label>Kullanıcı Adı:</label><br />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '300px', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Şifre:</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '300px', padding: '8px' }}
          />
        </div>
        {error && (
          <p style={{ color: 'red', display: 'flex', alignItems: 'center' }}>
            <MdErrorOutline style={{ marginRight: '8px', fontSize: '1.5em' }} />
            {error}
          </p>
        )}
        <button type="submit" style={{ padding: '8px 16px' }}>Giriş Yap</button>
      </form>
      <p style={{ marginTop: '10px' }}>
        Hesabınız yok mu? <a href="/register">Kayıt Olun</a>
      </p>
    </div>
  );
};

export default Login;
