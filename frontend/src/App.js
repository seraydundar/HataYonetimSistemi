// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import HataYakalama from './pages/HataYakalama';
import Sidebar from './components/Sidebar';
import HataBildirim from './pages/HataBildirim';
import './App.css';
import KullaniciYonetimi from './pages/KullaniciYonetimi';
import ChatPage from './pages/ChatPage'; // ChatBox yerine ChatPage'i import ediyoruz

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Sol taraf sabit Sidebar */}
        <Sidebar />
        {/* Sağdaki ana içerik alanı */}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/hata-yakalama" element={<HataYakalama />} />
            <Route path="/hata-bildirim" element={<HataBildirim />} />
            <Route path="/kullanici-yonetimi" element={<KullaniciYonetimi />} />
            <Route path="/chat" element={<ChatPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
