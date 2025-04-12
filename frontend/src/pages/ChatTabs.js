// ChatTabs.js veya ChatPage.js içindeki ChatTabs bileşeniniz
import React from 'react';
import { FaTimes } from 'react-icons/fa';

const ChatTabs = ({ openConversations, activeConversation, setActiveConversation, handleCloseTab, currentUser }) => {
  return (
    <div className="chat-tabs">
      {openConversations.map((conv) => {
        // Sekme başlığı
        const isActive = activeConversation && activeConversation.id === conv.id;

        return (
          <div
            key={conv.id}
            className={`chat-tab ${isActive ? 'active' : ''}`}
            onClick={() => setActiveConversation(conv)}
          >
            <span className="tab-title">
              {/* Sekme başlığını dilediğiniz gibi oluşturabilirsiniz */}
              {conv.participants
                .filter((p) => p.id !== currentUser.id)
                .map((p) => p.username)
                .join(', ') || 'Kendinle Sohbet'}
            </span>
            <button
              className="close-tab-btn"
              onClick={(e) => {
                e.stopPropagation(); // Sekmeye tıklamayı engellemek için
                handleCloseTab(conv.id);
              }}
              title="Sohbeti Kapat"
            >
              <FaTimes className="close-icon" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ChatTabs;
