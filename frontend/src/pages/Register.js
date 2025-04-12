// src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { FaUserPlus } from 'react-icons/fa';
import { MdErrorOutline } from 'react-icons/md';
import './Register.css'; // Özel stiller varsa ekleyebilirsiniz

const Register = () => {
  // Form durumları
  const [username, setUsername] = useState('');
  const [first_name, setFirst_name] = useState('');
  const [last_name, setLast_name] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await api.post('accounts/register/', { 
        username, 
        first_name, 
        last_name, 
        email, 
        password 
      });
      console.log("Kayıt başarılı:", response.data);
      alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
      navigate('/login');
    } catch (err) {
      console.error("Kayıt hatası:", err);
      setError("Kayıt yapılamadı, lütfen bilgilerinizi kontrol edin.");
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ display: 'flex', alignItems: 'center' }}>
        <FaUserPlus style={{ marginRight: '8px', fontSize: '1.5em' }} />
        Kayıt Ol
      </h2>
      <form onSubmit={handleRegister}>
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
          <label>İsim:</label><br />
          <input
            type="text"
            value={first_name}
            onChange={(e) => setFirst_name(e.target.value)}
            required
            style={{ width: '300px', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Soy İsim:</label><br />
          <input
            type="text"
            value={last_name}
            onChange={(e) => setLast_name(e.target.value)}
            required
            style={{ width: '300px', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>E-posta:</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <button type="submit" style={{ padding: '8px 16px' }}>Kayıt Ol</button>
      </form>
      <p style={{ marginTop: '10px' }}>
        Zaten bir hesabınız var mı? <Link to="/login">Giriş Yap</Link>
      </p>
    </div>
  );
};

export default Register;
