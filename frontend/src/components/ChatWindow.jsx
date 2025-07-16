import { useState, useEffect, useRef } from 'react';
import '../styles/ChatWindow.css';

export default function ChatWindow({ 
  isOpen, 
  agentName, 
  onClose, 
  onSendMessage, 
  messages, 
  isTyping 
}) {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-window-overlay">
      <div className="chat-window">
        <div className="chat-header">
          <h3>Talking to {agentName}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <div className="message ai-message">
                <div className="message-sender">{agentName}</div>
                <div className="message-content">
                  Hello! I'm {agentName}. What would you like to talk about?
                </div>
              </div>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.sender === 'player' ? 'player-message' : 'ai-message'}`}
            >
              <div className="message-sender">
                {message.sender === 'player' ? 'You' : agentName}
              </div>
              <div className="message-content">{message.content}</div>
              <div className="message-time">{message.timestamp}</div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message ai-message typing">
              <div className="message-sender">{agentName}</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <form className="chat-input-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="chat-input"
            disabled={isTyping}
            autoFocus
          />
          <button 
            type="submit" 
            disabled={isTyping || !inputMessage.trim()}
            className="chat-send-btn"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
