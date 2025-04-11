// src/components/Header.js
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Kullanıcı çıkışı için /logout rotasına yönlendiriyoruz
    navigate("/logout");
  };

  return (
    <header className="header">
      <div className="logo">Hata Yönetim Sistemi</div>
      <div className="user-info">
        {user && (
          <>
            <span>{user.name}</span>
            <button onClick={handleLogout}>Çıkış</button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
