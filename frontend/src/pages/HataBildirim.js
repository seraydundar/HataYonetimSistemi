// src/pages/HataBildirim.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { 
  FaPlusSquare, 
  FaListAlt, 
  FaArrowLeft, 
  FaEye 
} from 'react-icons/fa';
import './HataBildirim.css';

const subjectOptions = [
  "Kullanıcı Arayüzü Sorunu",
  "Veri İşleme Sorunu",
  "Performans Sorunu",
  "Güvenlik Sorunu",
  "Diğer"
];

const subjectToPriorityMap = {
  "Kullanıcı Arayüzü Sorunu": "Düşük",
  "Veri İşleme Sorunu": "Orta",
  "Performans Sorunu": "Yüksek",
  "Güvenlik Sorunu": "Kritik",
  "Diğer": "Düşük"
};

const HataBildirim = () => {
  const { user } = useContext(AuthContext);
  const [errors, setErrors] = useState([]);
  const [newError, setNewError] = useState({
    baslik: '',
    konu: '',
    aciklama: '',
    oncelik: ''
  });
  // Detay modalı için state
  const [selectedError, setSelectedError] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  // Sekme kontrolü için state: "create" veya "list"
  const [activeTab, setActiveTab] = useState("create");

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUserErrors();
    }
  }, [user]);

  const fetchUserErrors = async () => {
    try {
      const response = await api.get('errors/');
      setErrors(response.data);
    } catch (error) {
      console.error('Hata listesi çekilirken sorun oluştu:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewError((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubjectChange = (selected) => {
    setNewError((prev) => ({
      ...prev,
      konu: selected,
      oncelik: subjectToPriorityMap[selected] || 'Düşük'
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Hata bildirimi oluşturmak için lütfen giriş yapın.');
      return;
    }
    try {
      const payload = {
        ...newError,
        durum: 'Beklemede'
      };

      const response = await api.post('errors/', payload);
      alert('Hata bildirimi başarıyla oluşturuldu!');
      setErrors((prev) => [...prev, response.data]);
      setNewError({
        baslik: '',
        konu: '',
        aciklama: '',
        oncelik: ''
      });
    } catch (error) {
      console.error('Hata bildirimi oluşturulurken hata:', error);
      alert('Hata bildirimi oluşturulamadı, lütfen tekrar deneyin.');
    }
  };

  // "Detaya Git" butonuna basıldığında ilgili hata detayını modalda göster
  const handleViewDetail = (errorId) => {
    const err = errors.find((item) => item.id === errorId);
    if (err) {
      setSelectedError(err);
      setIsDetailModalOpen(true);
    }
  };

  const handleGoBack = () => {
    window.location.href = 'http://localhost:3000/hata-yakalama';
  };

  return (
    <div className="hata-bildirim-container">
      <h1>
        Hata Bildirim Paneli
      </h1>

      {/* Sekme Kontrolü */}
      <div className="tab-header">
        <button 
          className={activeTab === "create" ? "active-tab" : ""} 
          onClick={() => setActiveTab("create")}
        >
          <FaPlusSquare style={{ marginRight: '5px' }} />
          Yeni Hata Oluştur
        </button>
        <button 
          className={activeTab === "list" ? "active-tab" : ""} 
          onClick={() => setActiveTab("list")}
        >
          <FaListAlt style={{ marginRight: '5px' }} />
          Bildirdiğim Hatalar
        </button>
      </div>

      {/* Sekme İçeriği */}
      {activeTab === "create" && (
        <section className="yeni-hata-formu">
          <h2>
            <FaPlusSquare style={{ marginRight: '5px' }} />
            Yeni Hata Oluştur
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Hata Başlığı:</label>
              <input
                type="text"
                name="baslik"
                value={newError.baslik}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Hata Konusu (Seçiniz):</label>
              <div>
                {subjectOptions.map((option) => (
                  <label key={option} style={{ marginRight: '1rem' }}>
                    <input
                      type="radio"
                      name="konu"
                      value={option}
                      checked={newError.konu === option}
                      onChange={() => handleSubjectChange(option)}
                      required
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Açıklama:</label>
              <textarea
                name="aciklama"
                value={newError.aciklama}
                onChange={handleInputChange}
                required
              />
            </div>

            {newError.oncelik && (
              <div className="form-group">
                <label>Otomatik Belirlenen Öncelik:</label>
                <input
                  type="text"
                  value={newError.oncelik}
                  readOnly
                />
              </div>
            )}

            <div className="button-group">
              <button type="submit">
                <FaPlusSquare style={{ marginRight: '5px' }} />
                Hata Oluştur
              </button>
              <button
                type="button"
                className="geri-buton"
                onClick={handleGoBack}
              >
                <FaArrowLeft style={{ marginRight: '5px' }} />
                Geri
              </button>
            </div>
          </form>
        </section>
      )}

      {activeTab === "list" && (
        <section className="hata-listesi">
          <h2>
            <FaListAlt style={{ marginRight: '5px' }} />
            Bildirdiğim Hatalar
          </h2>
          <table>
            <thead>
              <tr>
                <th>Başlık</th>
                <th>Konu</th>
                <th>Öncelik</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {errors.map((error) => (
                <tr key={error.id}>
                  <td>{error.baslik}</td>
                  <td>{error.konu}</td>
                  <td>{error.oncelik}</td>
                  <td>{error.durum}</td>
                  <td>
                    <button onClick={() => handleViewDetail(error.id)}>
                      <FaEye style={{ marginRight: '5px' }} />
                      Detaya Git
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Detay Modalı */}
      {isDetailModalOpen && selectedError && (
        <div className="modal-overlay">
          <div className="modal-content detail-modal">
            <h2>
              <FaEye style={{ marginRight: '5px' }} />
              Hata Detayları
            </h2>
            <p><strong>Başlık:</strong> {selectedError.baslik}</p>
            <p><strong>Konu:</strong> {selectedError.konu}</p>
            <p><strong>Açıklama:</strong> {selectedError.aciklama}</p>
            {selectedError.olusturulma_tarihi && (
              <p><strong>Kaydedildiği Tarih:</strong> {selectedError.olusturulma_tarihi}</p>
            )}
            <p><strong>Öncelik:</strong> {selectedError.oncelik}</p>
            <p><strong>Durum:</strong> {selectedError.durum}</p>
            {selectedError.yanit && (
              <p><strong>Admin Yanıtı:</strong> {selectedError.yanit}</p>
            )}
            <button onClick={() => setIsDetailModalOpen(false)}>Kapat</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HataBildirim;
