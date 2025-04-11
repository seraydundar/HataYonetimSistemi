// src/components/Sidebar.js
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import './Sidebar.css';

const Sidebar = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Kullanıcı objesini ve role bilgisini konsola yazdırıyoruz:
  useEffect(() => {
    console.log('User object in Sidebar:', user);
    if (user) {
      console.log('User username:', user.username);
      console.log('User role:', user.role);
    }
  }, [user]);

  // Artık admin kontrolü user.role üzerinden yapılıyor:
  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    console.log('isAdmin:', isAdmin);
  }, [isAdmin]);

  const handleLogout = async () => {
    try {
      const response = await api.post('accounts/logout/');
      if (response.status === 200) {
        setUser(null);
        localStorage.removeItem('user');
        navigate('/login');
        localStorage.removeItem('authToken');
      } else {
        console.error("Logout işlemi başarısız oldu. Yanıt durumu:", response.status);
      }
    } catch (error) {
      console.error("Logout sırasında hata oluştu:", error);
    }
  };

  // Ana sayfaya yönlendirme
  const handleGoToHataYakalama = () => {
    navigate('/hata-yakalama');
  };

  return (
    <nav className="sidebar">
      <ul>
        <li>
          <button onClick={handleGoToHataYakalama}>Ana Sayfa</button>
        </li>
        {isAdmin ? (
          <>
            <li>
              <button onClick={() => navigate('/hata-bildirim')}>
                Hata Bildir
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/Kullanici-Yonetimi')}>
                Kullanıcı Yönetimi
              </button>
            </li>
          </>
        ) : (
          <li>
            <button onClick={() => navigate('/hata-bildirim')}>
              Hata Bildirim
            </button>
          </li>
        )}
        {user && (
          <li>
            <button onClick={handleLogout}>Çıkış Yap</button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Sidebar;
