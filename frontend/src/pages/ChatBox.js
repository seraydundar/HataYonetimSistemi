// src/pages/ChatBox.js
import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import './ChatBox.css';

let socket;

const ChatBox = ({ conversation }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!conversation || !conversation.participants) return;
    api.get(`accounts/conversations/${conversation.id}/messages/`)
      .then(response => setMessages(response.data))
      .catch(error => console.error("Mesajlar yüklenirken hata:", error));
  }, [conversation]);

  useEffect(() => {
    if (!conversation) return;

    const wsUrl = `ws://localhost:8000/ws/chat/${conversation.id}/`;
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket bağlantısı başarılı. Konuşma:", conversation.id);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, data]);
    };

    socket.onerror = (error) => {
      console.error("WebSocket hatası:", error);
    };

    socket.onclose = (e) => {
      console.log("WebSocket bağlantısı kapandı.", e);
    };

    return () => {
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        socket.close();
      }
    };
  }, [conversation]);

  const sendMessage = () => {
    if (newMessage.trim() === "" || !conversation) return;
    
    const messageData = {
      senderId: user.id,
      message: newMessage,
    };

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(messageData));
    } else {
      console.warn("Mesaj gönderilemedi: WebSocket bağlantısı açık değil.");
    }
    setNewMessage("");
  };

  return (
    <div className="chat-box">
      {(!conversation || !conversation.participants) ? (
        <div>Lütfen bir sohbet seçin.</div>
      ) : (
        <>
          <div className="chat-header">
            <h2>{conversation.participants.map(p => p.username).join(', ')}</h2>
          </div>
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={msg.senderId === user.id ? "sent" : "received"}>
                {msg.senderId !== user.id && msg.sender && msg.sender.username && (
                  <div className="sender-label">{msg.sender.username}</div>
                )}
                {msg.message}
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Mesajınızı yazın..."
            />
            <button onClick={sendMessage}>Gönder</button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBox;
