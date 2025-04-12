// src/pages/ChatPage.js
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import ChatBox from './ChatBox';
//import './ChatPage.css';

const ChatTabs = ({ openConversations, activeConversation, setActiveConversation, handleCloseTab }) => {
  return (
    <div className="chat-tabs">
      {openConversations.map(conv => (
        <div
          key={conv.id}
          className={`chat-tab ${activeConversation && activeConversation.id === conv.id ? 'active' : ''}`}
        >
          <span onClick={() => setActiveConversation(conv)}>
            {conv.participants.map(p => p.username).join(', ')}
          </span>
          <button className="close-tab" onClick={() => handleCloseTab(conv.id)}>x</button>
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

  // Konuşma listesini API'den çekiyoruz.
  useEffect(() => {
    if (!user) return;

    // Admin kontrollerini is_superuser üzerinden yapıyoruz
    if (user.is_superuser) {
      api.get('accounts/conversations/')
        .then(response => {
          console.log("Admin konuşmaları:", response.data);
          setConversations(response.data);
        })
        .catch(error => console.error("Konuşmalar yüklenirken hata:", error));
    } else {
      // Normal kullanıcıda admin ile yapılan sohbetleri çekiyoruz.
      api.get('accounts/conversations/?partner=admin')
        .then(response => {
          console.log("Normal kullanıcı konuşmaları:", response.data);
          setConversations(response.data);
        })
        .catch(error => console.error("Konuşma yüklenirken hata:", error));
    }
  }, [user]);

  // Admin için kullanıcı listesini çekiyoruz.
  useEffect(() => {
    if (user && user.is_superuser) {
      api.get('accounts/users/')
        .then(response => {
          console.log("Kullanıcı listesi:", response.data);
          setUserList(response.data);
        })
        .catch(error => console.error("Kullanıcı listesi çekilirken hata:", error));
    }
  }, [user]);

  // Yeni sohbet oluşturma (var mı? kontrolü API tarafında yapılıyor).
  const createConversation = () => {
    let partnerId;
    if (user.is_superuser) {
      if (!selectedPartner) {
        alert("Lütfen bir kullanıcı seçiniz.");
        return;
      }
      partnerId = parseInt(selectedPartner, 10);
    } else {
      partnerId = "admin";
    }
  
    api.post('accounts/conversations/', { partnerId })
      .then(response => {
        const conv = response.data;
        console.log("Yeni oluşturulan konuşma:", conv);
        // Burada backend'den gelen konuşma nesnesinde participants alanı olup olmadığını kontrol edin
        if (!conv.participants) {
          console.error("Konuşma nesnesi beklenen 'participants' alanına sahip değil:", conv);
        }
        if (!openConversations.find(c => c.id === conv.id)) {
          setOpenConversations(prev => [...prev, conv]);
        }
        setActiveConversation(conv);
      })
      .catch(error => console.error("Yeni sohbet oluşturulurken hata:", error));
  };
  

  // Sidebar benzeri sohbet listesi: Konuşma seçildiğinde o conversation açık sohbetler listesine eklenir.
  const handleSelectConversation = conv => {
    if (!openConversations.find(c => c.id === conv.id)) {
      setOpenConversations(prev => [...prev, conv]);
    }
    setActiveConversation(conv);
  };

  const handleCloseTab = convId => {
    setOpenConversations(prev => prev.filter(c => c.id !== convId));
    if (activeConversation && activeConversation.id === convId) {
      const remainingConversations = openConversations.filter(c => c.id !== convId);
      setActiveConversation(remainingConversations.length > 0 ? remainingConversations[0] : null);
    }
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
                onClick={() => handleSelectConversation(conv)}
                className={activeConversation && activeConversation.id === conv.id ? "active" : ""}
              >
                {conv.participants.map(p => p.username).join(', ')}
              </li>
            ))}
          </ul>
        ) : (
          <div>
            <p>Henüz sohbet bulunamadı.</p>
          </div>
        )}
        {user && user.is_superuser && (
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
            <button onClick={createConversation}>Yeni Sohbet Başlat</button>
          </div>
        )}
        {user && !user.is_superuser && (
          <button onClick={createConversation}>Yeni Sohbet Başlat</button>
        )}
      </div>
      <div className="chat-box-area">
        <ChatTabs
          openConversations={openConversations}
          activeConversation={activeConversation}
          setActiveConversation={setActiveConversation}
          handleCloseTab={handleCloseTab}
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
