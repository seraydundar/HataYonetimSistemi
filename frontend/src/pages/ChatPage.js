// src/pages/ChatPage.js
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import ChatBox from './ChatBox';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';

const getConversationTitle = (conversation, currentUser) => {
  if (!conversation || !conversation.participants) return '';
  const otherParticipants = conversation.participants.filter(p => p.id !== currentUser.id);
  return otherParticipants.length ? otherParticipants.map(p => p.username).join(', ') : "Kendinle Sohbet";
};

const ChatTabs = ({ openConversations, activeConversation, setActiveConversation, handleCloseTab, currentUser }) => {
  return (
    <div className="chat-tabs">
      {openConversations.map(conv => (
        <div
          key={conv.id}
          className={`chat-tab ${activeConversation && activeConversation.id === conv.id ? 'active' : ''}`}
          onClick={() => setActiveConversation(conv)}
        >
          <span className="tab-title">
            {getConversationTitle(conv, currentUser)}
          </span>
          <button 
            className="close-tab-btn" 
            onClick={(e) => {
              e.stopPropagation();
              handleCloseTab(conv.id);
            }}
            title="Sohbeti Kapat"
          >
            <FaTimes className="close-icon" />
          </button>
        </div>
      ))}
    </div>
  );
};

const ChatPage = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [openConversations, setOpenConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [userList, setUserList] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState("");

  // Kullanıcı listesini API'den çekiyoruz.
  useEffect(() => {
    if (user) {
      api.get('accounts/users/')
        .then(response => {
          console.log("Kullanıcı listesi:", response.data);
          if (!user.is_superuser) {
            const adminList = response.data.filter(u => u.is_superuser);
            setUserList(adminList);
          } else {
            // Superuser için; kendisini listeden çıkarıyoruz:
            const filteredList = response.data.filter(u => u.id !== user.id);
            setUserList(filteredList);
          }
        })
        .catch(error => console.error("Kullanıcı listesi çekilirken hata:", error));
    }
  }, [user]);

  // Konuşma listesini API'den çekme
  useEffect(() => {
    if (!user) return;
    const endpoint = user.is_superuser ? 'accounts/conversations/' : 'accounts/conversations/?partner=admin';
    api.get(endpoint)
      .then(response => {
        console.log("Konuşmalar:", response.data);
        setConversations(response.data);
      })
      .catch(error => console.error("Konuşmalar yüklenirken hata:", error));
  }, [user]);

  // handleSelectConversation'ı fonksiyonel güncelleme biçimiyle yazalım.
  const handleSelectConversation = conv => {
    setOpenConversations(prev => {
      const exists = prev.some(c => c.id === conv.id);
      return exists ? prev : [...prev, conv];
    });
    setActiveConversation(conv);
  };

  const handleCloseTab = convId => {
    setOpenConversations(prev => prev.filter(c => c.id !== convId));
    setActiveConversation(prevActive =>
      prevActive && prevActive.id === convId 
        ? openConversations.find(c => c.id !== convId) || null 
        : prevActive
    );
  };

  // Yeni sohbet oluşturma
const createConversation = () => {
  if (!selectedPartner) {
    alert("Lütfen bir kullanıcı seçiniz.");
    return;
  }
  const data = { partnerId: parseInt(selectedPartner, 10) };
  api.post('accounts/conversations/', data)
    .then(response => {
      const conv = response.data;
      console.log("Yeni oluşturulan konuşma:", conv);
      // Open conversations state'ine ekle
      setOpenConversations(prev => prev.some(c => c.id === conv.id) ? prev : [...prev, conv]);
      setActiveConversation(conv);
      // Ana sohbet listesini de güncelleyerek yeni sohbetin görünmesini sağla
      setConversations(prev => prev.some(c => c.id === conv.id) ? prev : [...prev, conv]);
    })
    .catch(error => console.error("Yeni sohbet oluşturulurken hata:", error));
};


  // Sohbeti silme (DELETE isteği)
  const deleteConversation = (convId) => {
    if (!window.confirm("Sohbeti silmek istediğinize emin misiniz?")) return;
    api.delete(`accounts/conversations/${convId}/`)
      .then(response => {
        console.log("Sohbet silindi:", response.data);
        setConversations(prev => prev.filter(c => c.id !== convId));
        setOpenConversations(prev => prev.filter(c => c.id !== convId));
        if (activeConversation && activeConversation.id === convId) {
          setActiveConversation(null);
        }
      })
      .catch(error => console.error("Sohbet silinirken hata:", error));
  };

  // Silme butonunun görünme koşulu
  // Eğer giriş yapan admin ve (sohbete katılan tüm kullanıcılar adminse veya created_by giriş yapan adminse)
  const canDeleteConversation = (conv) => {
    if (!user.is_superuser) return false;
    if (!conv.created_by) return false;
    const createdById = typeof conv.created_by === 'object' ? conv.created_by.id : conv.created_by;
    const allAdmins = conv.participants && conv.participants.every(p => p.is_superuser);
    return allAdmins || createdById === user.id;
  };

  return (
    <div className="chat-page">
      <div className="conversation-list">
        <h3>Sohbetler</h3>
        {conversations.length > 0 ? (
          <ul>
            {conversations.map(conv => (
              <li
                key={conv.id}
                className={activeConversation && activeConversation.id === conv.id ? "active" : ""}
                onClick={() => handleSelectConversation(conv)}
              >
                <span>{getConversationTitle(conv, user)}</span>
                {user.is_superuser && conv.created_by && canDeleteConversation(conv) && (
                  <button 
                    className="delete-conv-btn" 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    title="Sohbeti Sil"
                  >
                    <FaTrash className="delete-icon" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div>
            <p>Henüz sohbet bulunamadı.</p>
          </div>
        )}
        {user && (
          <div className="new-chat">
            <select
              onChange={e => {
                console.log("Select değişti:", e.target.value);
                setSelectedPartner(e.target.value);
              }}
              value={selectedPartner || ""}
            >
              <option value="">Kullanıcı Seç</option>
              {userList.map(u => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
            </select>
            <button onClick={createConversation}>
              <FaPlus className="plus-icon" /> Yeni Sohbet Başlat
            </button>
          </div>
        )}
      </div>
      <div className="chat-box-area">
        <ChatTabs
          openConversations={openConversations}
          activeConversation={activeConversation}
          setActiveConversation={setActiveConversation}
          handleCloseTab={handleCloseTab}
          currentUser={user}
        />
        {activeConversation ? (
          <ChatBox conversation={activeConversation} />
        ) : (
          <p>Lütfen bir sohbet seçiniz veya yeni sohbet başlatınız.</p>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
