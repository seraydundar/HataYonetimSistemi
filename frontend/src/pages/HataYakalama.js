// src/pages/HataYonetimi.js
import React, { useState, useEffect, useContext } from 'react';
import { FaBug, FaFilter, FaSort, FaEllipsisH, FaEye, FaEdit, FaReply, FaTrashAlt, FaCalendarAlt, FaInfoCircle, FaExclamationCircle } from 'react-icons/fa';
import './HataYakalama.css';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

const HataYonetimi = () => {
  const { user } = useContext(AuthContext);
  console.log('User from AuthContext:', user);
  const isAdmin = user && (user.role === 'admin' || user.isAdmin === true);
  console.log('isAdmin computed:', isAdmin);

  const [errors, setErrors] = useState([]);
  const [filteredErrors, setFilteredErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtre alanları
  const [tarih, setTarih] = useState('');
  const [hataDurumu, setHataDurumu] = useState('');
  const [oncelik, setOncelik] = useState('');
  const [search, setSearch] = useState('');

  // Modal ve düzenleme state'leri
  const [selectedError, setSelectedError] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  // Düzenleme formu
  const [editForm, setEditForm] = useState({
    baslik: '',
    konu: '',
    aciklama: '',
    oncelik: '',
    durum: '',
  });

  useEffect(() => {
    const fetchErrors = async () => {
      try {
        let url = 'errors/';
        if (user && user.role !== 'admin') {
          url = `errors/?userId=${user.userId}`;
        }
        const response = await api.get(url);
        setErrors(response.data);
        setFilteredErrors(response.data);
      } catch (error) {
        console.error('Hata verileri alınırken bir sorun oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchErrors();
    }
  }, [user]);

  // Filtreleme fonksiyonu
  const handleFilter = () => {
    const searchTerm = search.trim().toLowerCase();
    const filtered = errors.filter((item) => {
      const matchDate = tarih
        ? item.olusturulma_tarihi?.toLowerCase().includes(tarih.toLowerCase())
        : true;
      const matchStatus = hataDurumu
        ? item.durum?.toLowerCase() === hataDurumu.toLowerCase()
        : true;
      const matchPriority = oncelik
        ? item.oncelik?.toLowerCase() === oncelik.toLowerCase()
        : true;
      const matchSearch = searchTerm
        ? (item.baslik?.toLowerCase().includes(searchTerm) ||
           item.user_name?.toLowerCase().includes(searchTerm))
        : true;
      return matchDate && matchStatus && matchPriority && matchSearch;
    });
    setFilteredErrors(filtered);
  };

  // Tarihe göre sıralama fonksiyonu
  const handleSort = () => {
    const sorted = [...filteredErrors].sort((a, b) => {
      const parseDate = (str) => {
        if (!str) return new Date('1970-01-01');
        const [gun, ay, yil] = str.split('.');
        return new Date(`${yil}-${ay}-${gun}`);
      };
      return parseDate(a.olusturulma_tarihi) - parseDate(b.olusturulma_tarihi);
    });
    setFilteredErrors(sorted);
  };

  const handleOther = () => {
    alert('Diğer butonuna tıklandı! Burada ekstra işlemler yapabilirsiniz.');
  };

  // Modal işlemleri
  const handleView = (id) => {
    const err = errors.find((item) => item.id === id);
    if (err) {
      setSelectedError(err);
      setIsViewModalOpen(true);
    }
  };

  const handleEdit = (id) => {
    const err = errors.find((item) => item.id === id);
    if (err) {
      setSelectedError(err);
      setEditForm({
        baslik: err.baslik,
        konu: err.konu,
        aciklama: err.aciklama,
        oncelik: err.oncelik,
        durum: err.durum,
      });
      setIsEditModalOpen(true);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`ID ${id} numaralı hatayı silmek istediğinize emin misiniz?`)) {
      try {
        await api.delete(`errors/${id}/`);
        setErrors(prev => prev.filter(item => item.id !== id));
        setFilteredErrors(prev => prev.filter(item => item.id !== id));
        alert(`ID ${id} numaralı hata başarıyla silindi!`);
      } catch (error) {
        console.error('Hata silinirken sorun oluştu:', error);
        alert('Hata silinemedi.');
      }
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.patch(`errors/${selectedError.id}/`, editForm);
      alert('Hata güncellendi!');
      const updatedError = response.data;
      setErrors(prev => prev.map(item => item.id === updatedError.id ? updatedError : item));
      setFilteredErrors(prev => prev.map(item => item.id === updatedError.id ? updatedError : item));
      setIsEditModalOpen(false);
      setSelectedError(null);
    } catch (error) {
      console.error('Hata güncellenirken sorun oluştu:', error);
      alert('Hata güncellenemedi.');
    }
  };

  const handleReply = (id) => {
    const err = errors.find((item) => item.id === id);
    if (err) {
      setSelectedError(err);
      setReplyMessage(err.yanit || '');
      setIsReplyModalOpen(true);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.patch(`errors/${selectedError.id}/`, { yanit: replyMessage });
      alert('Yanıt başarıyla gönderildi!');
      const updatedError = response.data;
      setErrors(prev => prev.map(item => item.id === updatedError.id ? updatedError : item));
      setFilteredErrors(prev => prev.map(item => item.id === updatedError.id ? updatedError : item));
      setIsReplyModalOpen(false);
      setSelectedError(null);
    } catch (error) {
      console.error('Yanıt gönderilirken sorun oluştu:', error);
      alert('Yanıt gönderilemedi.');
    }
  };

  return (
    <div className="hata-container">
      <h1 className="hata-header">
        <FaBug style={{ marginRight: '10px' }} />
        Hata Yönetimi
      </h1>
      <p className="hata-description">
        Sistemde oluşan hatalar aşağıda listelenmektedir.
      </p>

      {/* Filtre Alanı */}
      <div className="filter-bar">
        <div>
          <label htmlFor="tarih">
            <FaCalendarAlt style={{ marginRight: '5px' }} />
            Tarih:
          </label>
          <input
            type="text"
            id="tarih"
            placeholder="gg.aa.yyyy"
            value={tarih}
            onChange={(e) => setTarih(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="hataDurumu">
            <FaExclamationCircle style={{ marginRight: '5px' }} />
            Hata Durumu:
          </label>
          <select
            id="hataDurumu"
            value={hataDurumu}
            onChange={(e) => setHataDurumu(e.target.value)}
          >
            <option value="">Hata Durumu Seç</option>
            <option value="Beklemede">Beklemede</option>
            <option value="İşlemde">İşlemde</option>
            <option value="Çözüldü">Çözüldü</option>
          </select>
        </div>
        <div>
          <label htmlFor="oncelik">
            <FaInfoCircle style={{ marginRight: '5px' }} />
            Öncelik:
          </label>
          <select
            id="oncelik"
            value={oncelik}
            onChange={(e) => setOncelik(e.target.value)}
          >
            <option value="">Öncelik Seç</option>
            <option value="Düşük">Düşük</option>
            <option value="Orta">Orta</option>
            <option value="Yüksek">Yüksek</option>
            <option value="Kritik">Kritik</option>
          </select>
        </div>
        <div>
          <label htmlFor="search">
            <FaFilter style={{ marginRight: '5px' }} />
            Ara/Filtrele:
          </label>
          <input
            type="text"
            id="search"
            placeholder="Hata başlığı veya kullanıcı ismi"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="filter-btn" onClick={handleFilter}>
          <FaFilter style={{ marginRight: '5px' }} />
          FİLTRELE
        </button>
        <button className="sort-btn" onClick={handleSort}>
          <FaSort style={{ marginRight: '5px' }} />
          SIRALA
        </button>
        <button className="other-btn" onClick={handleOther}>
          <FaEllipsisH style={{ marginRight: '5px' }} />
          Diğer
        </button>
      </div>

      {/* Hata Tablosu */}
      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <div className="table-wrapper">
          <table className="table-custom">
            <thead>
              <tr>
                <th>Oluşturma Tarihi</th>
                <th>Hata Başlığı</th>
                <th>Kullanıcı</th>
                <th>Öncelik</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredErrors.map((item) => (
                <tr key={item.id}>
                  <td>{item.olusturulma_tarihi}</td>
                  <td>{item.baslik}</td>
                  <td>{item.user_name || 'Bilinmiyor'}</td>
                  <td>{item.oncelik || '-'}</td>
                  <td>
                    {item.durum === 'Beklemede' && <span className="status-label status-beklemede">Beklemede</span>}
                    {item.durum === 'İşlemde' && <span className="status-label status-islemde">İşlemde</span>}
                    {item.durum === 'Çözüldü' && <span className="status-label status-cozuldu">Çözüldü</span>}
                  </td>
                  <td>
                    <button className="action-btn view-btn" onClick={() => handleView(item.id)}>
                      <FaEye style={{ marginRight: '5px' }} />
                      Görüntüle
                    </button>
                    {isAdmin && (
                      <>
                        <button className="action-btn edit-btn" onClick={() => handleEdit(item.id)}>
                          <FaEdit style={{ marginRight: '5px' }} />
                          Düzenle
                        </button>
                        <button className="action-btn reply-btn" onClick={() => handleReply(item.id)}>
                          <FaReply style={{ marginRight: '5px' }} />
                          Yanıtla
                        </button>
                      </>
                    )}
                    <button className="action-btn delete-btn" onClick={() => handleDelete(item.id)}>
                      <FaTrashAlt style={{ marginRight: '5px' }} />
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Görüntüle Modalı */}
      {isViewModalOpen && selectedError && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>
              <FaEye style={{ marginRight: '5px' }} />
              Hata Detayları
            </h2>
            <p><strong>Açıklama:</strong></p>
            <p>{selectedError.aciklama}</p>
            {selectedError.yanit && (
              <>
                <p><strong>Admin Yanıtı:</strong></p>
                <p>{selectedError.yanit}</p>
              </>
            )}
            <button onClick={() => { setIsViewModalOpen(false); setSelectedError(null); }}>
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* Yanıt Modalı */}
      {isReplyModalOpen && selectedError && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>
              <FaReply style={{ marginRight: '5px' }} />
              Hata Yanıtı
            </h2>
            <form onSubmit={handleReplySubmit}>
              <div>
                <label>Yanıt Mesajı:</label>
                <textarea
                  name="yanit"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  required
                />
              </div>
              <button type="submit">Gönder</button>
              <button type="button" onClick={() => { setIsReplyModalOpen(false); setSelectedError(null); }}>
                İptal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Düzenle Modalı */}
      {isEditModalOpen && selectedError && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>
              <FaEdit style={{ marginRight: '5px' }} />
              Hata Düzenle
            </h2>
            <form onSubmit={handleEditSubmit}>
              <div>
                <label>Hata Başlığı:</label>
                <input
                  type="text"
                  name="baslik"
                  value={editForm.baslik}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div>
                <label>Hata Konusu:</label>
                <input
                  type="text"
                  name="konu"
                  value={editForm.konu}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div>
                <label>Açıklama:</label>
                <textarea
                  name="aciklama"
                  value={editForm.aciklama}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div>
                <label>Öncelik:</label>
                <select
                  name="oncelik"
                  value={editForm.oncelik}
                  onChange={handleEditChange}
                  required
                >
                  <option value="">Öncelik Seç</option>
                  <option value="Düşük">Düşük</option>
                  <option value="Orta">Orta</option>
                  <option value="Yüksek">Yüksek</option>
                  <option value="Kritik">Kritik</option>
                </select>
              </div>
              <div>
                <label>Durum:</label>
                <select
                  name="durum"
                  value={editForm.durum}
                  onChange={handleEditChange}
                  required
                >
                  <option value="">Durum Seç</option>
                  <option value="Beklemede">Beklemede</option>
                  <option value="İşlemde">İşlemde</option>
                  <option value="Çözüldü">Çözüldü</option>
                </select>
              </div>
              <button type="submit">Güncelle</button>
              <button type="button" onClick={() => { setIsEditModalOpen(false); setSelectedError(null); }}>
                İptal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HataYonetimi;
