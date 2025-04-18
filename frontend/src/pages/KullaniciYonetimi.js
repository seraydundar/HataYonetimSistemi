import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { 
  FaUsers, 
  FaUserPlus, 
  FaEdit, 
  FaTrashAlt, 
  FaExclamationCircle, 
  FaEye 
} from 'react-icons/fa';
import './KullaniciYonetimi.css';

const KullaniciYonetimi = () => {
  const { user, setUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("viewUsers"); // Sekme yönetimi için state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Yeni kullanıcı ekleme formu için state
  const [newUser, setNewUser] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'kullanıcı'
  });

  // Güncelleme için state
  const [editingUser, setEditingUser] = useState(null);
  const [editData, setEditData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    is_superuser: false,
  });

  // Seçilen kullanıcının hata kayıtlarını görüntülemek için state
  const [selectedUserErrors, setSelectedUserErrors] = useState([]);
  const [showErrorsModal, setShowErrorsModal] = useState(false);

  // Kullanıcı listesini API'den çekme (sadece admin erişimine izin veriliyor)
  useEffect(() => {
    if (user && user.role === 'admin') {
      const fetchUsers = async () => {
        try {
          const response = await api.get('accounts/');
          setUsers(response.data);
        } catch (err) {
          console.error("Kullanıcı listesi alınamadı", err);
        } finally {
          setLoading(false);
        }
      };
      fetchUsers();
    } else {
      alert("Bu sayfaya erişim yetkiniz yok.");
      setLoading(false);
    }
  }, [user]);

  // Kullanıcı silme işlemi
  const handleDelete = async (id) => {
    if (window.confirm("Kullanıcıyı silmek istediğinize emin misiniz?")) {
      try {
        await api.delete(`accounts/${id}/`);
        setUsers(prev => prev.filter(u => u.id !== id));
      } catch (err) {
        console.error("Kullanıcı silinemedi", err);
        alert("Kullanıcı silinemedi.");
      }
    }
  };

  // Güncelleme formunu açma: Seçilen kullanıcının verilerini editData state'ine aktarıyoruz.
  const handleEdit = (selectedUser) => {
    setEditingUser(selectedUser);
    setEditData({
      username: selectedUser.username || '',
      first_name: selectedUser.first_name || selectedUser.name || '',
      last_name: selectedUser.last_name || '',
      email: selectedUser.email || '',
      password: '', // Şifre güncellemesi isteğe bağlı; boş gönderilirse değiştirilmez.
      is_superuser: selectedUser.is_superuser || false,
    });
  };

  // Güncelleme formundaki değişiklikleri yakalama
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData({
      ...editData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Kullanıcı güncelleme işlemi
  const handleUpdate = async () => {
    try {
      const dataToSend = { ...editData };
      if (!dataToSend.password || dataToSend.password.trim() === '') {
        delete dataToSend.password;
      }
      const response = await api.patch(`accounts/${editingUser.id}/`, dataToSend);
      const updatedUser = response.data;
      setUsers(users.map(u => (u.id === editingUser.id ? updatedUser : u)));
      setEditingUser(null);
      setEditData({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        is_superuser: false,
      });
      alert("Kullanıcı güncellendi!");

      if (user && editingUser.id === user.id) {
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("Kullanıcı güncellenemedi", err);
      alert("Güncelleme başarısız.");
    }
  };

  // Yeni kullanıcı ekleme işlemleri
  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleNewUserSubmit = async (e) => {
    e.preventDefault();
    const newUserData = {
      username: newUser.username,
      first_name: newUser.firstName, // anahtar adı düzenlendi
      last_name: newUser.lastName,     // anahtar adı düzenlendi
      email: newUser.email,
      password: newUser.password,
      role: newUser.role,
    };
    try {
      const response = await api.post('accounts/register/', newUserData);
      setUsers([...users, response.data]);
      setNewUser({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'kullanıcı'
      });
      alert("Yeni kullanıcı eklenmiştir.");
    } catch (err) {
      console.error("Yeni kullanıcı eklenemedi", err);
      alert("Yeni kullanıcı eklenemedi.");
    }
  };

  // Seçilen kullanıcının hata kayıtlarını görüntüleme işlemi
  const handleViewErrors = async (selectedUser) => {
    try {
      const response = await api.get(`errors/?user=${selectedUser.id}`);
      setSelectedUserErrors(response.data);
      setShowErrorsModal(true);
    } catch (err) {
      console.error("Hata kayıtları alınamadı", err);
      alert("Kullanıcının hata kayıtları alınamadı.");
    }
  };

  return (
    <div className="kullanici-yonetimi-container">
      <h1>Kullanıcı Yönetimi</h1>
      <div className="tabs">
        <button 
          className={activeTab === "viewUsers" ? "active" : ""}
          onClick={() => setActiveTab("viewUsers")}
        >
          <FaUsers style={{ marginRight: '5px' }} />
          Mevcut Kullanıcıları Görüntüle
        </button>
        <button 
          className={activeTab === "addUser" ? "active" : ""}
          onClick={() => setActiveTab("addUser")}
        >
          <FaUserPlus style={{ marginRight: '5px' }} />
          Yeni Kullanıcı Ekle
        </button>
      </div>

      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <>
          {activeTab === "viewUsers" && (
            <>
              <table className="user-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Kullanıcı Adı</th>
                    <th>Ad</th>
                    <th>Soyad</th>
                    <th>E-posta</th>
                    <th>Admin</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.username}</td>
                      <td>{u.first_name || u.name}</td>
                      <td>{u.last_name || '-'}</td>
                      <td>{u.email}</td>
                      <td>{u.is_superuser ? "Evet" : "Hayır"}</td>
                      <td>
                        <button 
                          className="action-btn update-btn" 
                          onClick={() => handleEdit(u)}
                        >
                          <FaEdit style={{ marginRight: '5px' }} />
                          Güncelle
                        </button>
                        <button 
                          className="action-btn delete-btn" 
                          onClick={() => handleDelete(u.id)}
                        >
                          <FaTrashAlt style={{ marginRight: '5px' }} />
                          Sil
                        </button>
                        <button 
                          className="action-btn errors-btn" 
                          onClick={() => handleViewErrors(u)}
                        >
                          <FaExclamationCircle style={{ marginRight: '5px' }} />
                          Hata Kayıtlarını Gör
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {activeTab === "addUser" && (
            <div className="new-user-form">
              <h2>
                <FaUserPlus style={{ marginRight: '5px' }} />
                Yeni Kullanıcı Ekle
              </h2>
              <form onSubmit={handleNewUserSubmit}>
                <label>
                  Kullanıcı Adı:
                  <input
                    type="text"
                    name="username"
                    placeholder="Kullanıcı Adı"
                    value={newUser.username}
                    onChange={handleNewUserChange}
                    required
                  />
                </label>
                <label>
                  Ad:
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Ad"
                    value={newUser.firstName}
                    onChange={handleNewUserChange}
                    required
                  />
                </label>
                <label>
                  Soyad:
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Soyad"
                    value={newUser.lastName}
                    onChange={handleNewUserChange}
                    required
                  />
                </label>
                <label>
                  E-posta:
                  <input
                    type="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleNewUserChange}
                    required
                  />
                </label>
                <label>
                  Şifre:
                  <input
                    type="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleNewUserChange}
                    required
                  />
                </label>
                <label>
                  Rol:
                  <select name="role" value={newUser.role} onChange={handleNewUserChange}>
                    <option value="admin">Admin</option>
                    <option value="kullanıcı">Kullanıcı</option>
                  </select>
                </label>
                <button type="submit">
                  <FaUserPlus style={{ marginRight: '5px' }} />
                  Yeni Kullanıcı Ekle
                </button>
              </form>
            </div>
          )}
        </>
      )}

      {/* Güncelleme formunu modal pencerede gösteriyoruz */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>
              <FaEdit style={{ marginRight: '5px' }} />
              Kullanıcıyı Güncelle
            </h2>
            <label>
              Kullanıcı Adı:
              <input
                type="text"
                name="username"
                value={editData.username}
                onChange={handleEditChange}
                className="modal-input"
              />
            </label>
            <label>
              Ad:
              <input
                type="text"
                name="first_name"
                value={editData.first_name}
                onChange={handleEditChange}
                className="modal-input"
              />
            </label>
            <label>
              Soyad:
              <input
                type="text"
                name="last_name"
                value={editData.last_name}
                onChange={handleEditChange}
                className="modal-input"
              />
            </label>
            <label>
              E-posta:
              <input
                type="email"
                name="email"
                value={editData.email}
                onChange={handleEditChange}
                className="modal-input"
              />
            </label>
            <label>
              Şifre:
              <input
                type="password"
                name="password"
                value={editData.password}
                onChange={handleEditChange}
                placeholder="Yeni şifre (boş bırakılırsa güncellenmez)"
                className="modal-input"
              />
            </label>
            <label>
              Admin:
              <div className="switch-wrapper">
                <label className="switch">
                  <input
                    type="checkbox"
                    name="is_superuser"
                    checked={editData.is_superuser}
                    onChange={handleEditChange}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </label>
            <button onClick={handleUpdate}>
              <FaEdit style={{ marginRight: '5px' }} />
              Güncelle
            </button>
            <button onClick={() => setEditingUser(null)}>
              <FaTrashAlt style={{ marginRight: '5px' }} />
              İptal
            </button>
          </div>
        </div>
      )}

      {showErrorsModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>
              <FaExclamationCircle style={{ marginRight: '5px' }} />
              Kullanıcının Hata Kayıtları
            </h2>
            {selectedUserErrors.length === 0 ? (
              <p>Bu kullanıcı için hata kaydı bulunamadı.</p>
            ) : (
              <table className="error-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Başlık</th>
                    <th>Oluşturulma Tarihi</th>
                    <th>İşlem Durumu</th>
                    <th>Yanıt</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedUserErrors.map(error => (
                    <tr key={error.id}>
                      <td>{error.id}</td>
                      <td>{error.baslik}</td>
                      <td>{error.olusturulma_tarihi}</td>
                      <td>{error.durum}</td>
                      <td>{error.yanit ? error.yanit : "Yok"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button onClick={() => setShowErrorsModal(false)}>
              <FaEye style={{ marginRight: '5px' }} />
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KullaniciYonetimi;
