// ChatTabs.js örneği
import React from 'react';
import ChatBox from './ChatBox'; // Önceden oluşturduğunuz sohbet kutusu bileşeni

const ChatTabs = ({ openConversations, setActiveConversation, activeConversation }) => (
  <div className="chat-tabs">
    {openConversations.map(conv => (
      <button
        key={conv.id}
        onClick={() => setActiveConversation(conv)}
        className={activeConversation && activeConversation.id === conv.id ? 'active' : ''}
      >
        {conv.participants.map(p => p.username).join(', ')}
      </button>
    ))}
  </div>
);

export default ChatTabs;
