// src/components/Sidebar.js
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  FaHome, 
  FaExclamationTriangle, 
  FaUsers, 
  FaComments, 
  FaSignOutAlt,
  FaSignInAlt, // Giriş yap butonu için
  FaUserPlus   // Kayıt ol butonu için
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('User object in Sidebar:', user);
    if (user) {
      console.log('User username:', user.username);
      console.log('User role:', user.role);
    }
  }, [user]);

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

  const handleGoToHataYakalama = () => {
    navigate('/hata-yakalama');
  };

  // Eğer kullanıcı giriş yapmamışsa sadece Giriş Yap ve Kayıt Ol seçeneklerini ikonlarla göster.
  if (!user) {
    return (
      <nav className="sidebar">
        <ul>
          <li>
            <button onClick={() => navigate('/login')}>
              <FaSignInAlt style={{ marginRight: '8px' }} />
              Giriş Yap
            </button>
          </li>
          <li>
            <button onClick={() => navigate('/register')}>
              <FaUserPlus style={{ marginRight: '8px' }} />
              Kayıt Ol
            </button>
          </li>
        </ul>
      </nav>
    );
  }

  return (
    <nav className="sidebar">
      <ul>
        <li>
          <button onClick={handleGoToHataYakalama}>
            <FaHome style={{ marginRight: '8px' }} />
            Ana Sayfa
          </button>
        </li>
        {isAdmin ? (
          <>
            <li>
              <button onClick={() => navigate('/hata-bildirim')}>
                <FaExclamationTriangle style={{ marginRight: '8px' }} />
                Hata Bildir
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/kullanici-yonetimi')}>
                <FaUsers style={{ marginRight: '8px' }} />
                Kullanıcı Yönetimi
              </button>
            </li>
          </>
        ) : (
          <li>
            <button onClick={() => navigate('/hata-bildirim')}>
              <FaExclamationTriangle style={{ marginRight: '8px' }} />
              Hata Bildir
            </button>
          </li>
        )}
        {/* Yeni sohbet butonu */}
        <li>
          <button onClick={() => navigate('/chat')}>
            <FaComments style={{ marginRight: '8px' }} />
            Sohbet
          </button>
        </li>
        <li>
          <button onClick={handleLogout}>
            <FaSignOutAlt style={{ marginRight: '8px' }} />
            Çıkış Yap
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
