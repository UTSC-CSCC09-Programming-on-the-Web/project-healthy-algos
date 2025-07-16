import { io } from 'socket.io-client';

class ChatService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.chatSessions = new Map(); // agentId -> chat session
    this.messageCallbacks = new Map(); // agentId -> callback function
  }

  // Initialize WebSocket connection (reuse same socket as aiService)
  initialize() {
    if (this.socket) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.socket = io('http://localhost:3001', {
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
          console.log('🗨️ Connected to Chat Service');
          this.isConnected = true;
          resolve();
        });

        this.socket.on('disconnect', () => {
          console.log('🗨️ Disconnected from Chat Service');
          this.isConnected = false;
        });

        // Listen for AI chat responses
        this.socket.on('chat.response', (data) => {
          console.log('💬 Chat response received:', data);
          const { agentId, message, timestamp } = data;
          const callback = this.messageCallbacks.get(agentId);
          if (callback) {
            callback({
              sender: 'ai',
              content: message,
              timestamp: new Date(timestamp).toLocaleTimeString()
            });
          }
        });

        this.socket.on('chat.error', (data) => {
          console.error('💬 Chat error:', data);
          const callback = this.messageCallbacks.get(data.agentId);
          if (callback) {
            callback({
              sender: 'ai',
              content: 'Sorry, I had trouble understanding that. Could you try again?',
              timestamp: new Date().toLocaleTimeString()
            });
          }
        });

        this.socket.on('connect_error', (error) => {
          console.error('Chat service connection error:', error);
          reject(error);
        });

        // Timeout connection attempt
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('Chat service connection timeout'));
          }
        }, 5000);

      } catch (error) {
        reject(error);
      }
    });
  }

  startChatSession(agentId, agentName, onMessage) {
    if (!this.isConnected) {
      console.warn('Chat service not connected');
      return false;
    }

    // Store the callback for this agent
    this.messageCallbacks.set(agentId, onMessage);

    // Initialize local chat session
    this.chatSessions.set(agentId, {
      agentId,
      agentName,
      messages: [],
      startTime: Date.now()
    });

    // Tell the backend to start a chat session
    this.socket.emit('chat.start', {
      agentId,
      agentName,
      timestamp: Date.now()
    });

    console.log(`🗨️ Started chat session with ${agentName} (${agentId})`);
    return true;
  }

  sendMessage(agentId, message) {
    if (!this.isConnected || !this.chatSessions.has(agentId)) {
      console.warn('No active chat session for agent:', agentId);
      return false;
    }

    const session = this.chatSessions.get(agentId);
    
    // Add user message to local session
    const userMessage = {
      sender: 'player',
      content: message,
      timestamp: new Date().toLocaleTimeString()
    };
    
    session.messages.push(userMessage);

    // Send to backend (keep last 10 messages as context)
    this.socket.emit('chat.message', {
      agentId,
      message,
      chatHistory: session.messages.slice(-10),
      timestamp: Date.now()
    });

    console.log(`💬 Sent message to ${agentId}: ${message}`);
    return true;
  }

  endChatSession(agentId) {
    if (!this.chatSessions.has(agentId)) return;

    console.log(`🗨️ Ending chat session with ${agentId}`);

    // Clean up local session
    this.chatSessions.delete(agentId);
    this.messageCallbacks.delete(agentId);

    // Tell backend to end session
    if (this.isConnected) {
      this.socket.emit('chat.end', {
        agentId,
        timestamp: Date.now()
      });
    }
  }

  getChatHistory(agentId) {
    const session = this.chatSessions.get(agentId);
    return session ? session.messages : [];
  }

  isInChat(agentId) {
    return this.chatSessions.has(agentId);
  }

  addMessageToHistory(agentId, message) {
    const session = this.chatSessions.get(agentId);
    if (session) {
      session.messages.push(message);
      // Keep only last 20 messages to prevent memory bloat
      if (session.messages.length > 20) {
        session.messages = session.messages.slice(-20);
      }
    }
  }

  // Cleanup
  disconnect() {
    if (this.socket) {
      console.log('🗨️ Disconnecting chat service');
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.chatSessions.clear();
    this.messageCallbacks.clear();
  }

  // Check if service is ready
  isReady() {
    return this.isConnected && this.socket;
  }
}

export const chatService = new ChatService();
