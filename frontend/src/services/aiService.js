import { io } from 'socket.io-client';

class AIService {
  constructor() {
    this.socket = null;
    this.aiDecisionCallbacks = new Map();
    this.userActionCallbacks = new Map();
    this.isConnected = false;
    this.gameState = null;
  }

  // Initialize WebSocket connection
  initialize() {
    if (this.socket) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        const socketUrl = import.meta.env.VITE_AI_WORKER_URL || 'http://localhost:3001';
        this.socket = io(socketUrl, {
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
          this.isConnected = true;
          resolve();
        });

        this.socket.on('disconnect', () => {
          console.log('Disconnected from AI Worker WebSocket');
          this.isConnected = false;
        });

        this.socket.on('ai.decision', (data) => {
          console.log('AI Decision received:', data);
          const callback = this.aiDecisionCallbacks.get(data.aiAgentId);
          if (callback) {
            callback(data.decision);
          }
        });

        this.socket.on('ai.error', (data) => {
          console.error('🤖 AI Error:', data);
          const callback = this.aiDecisionCallbacks.get(data.aiAgentId);
          if (callback) {
            callback(null, data.error);
          }
        });

        this.socket.on('user.action.request', (data) => {
          const callback = this.userActionCallbacks.get(data.agentId);
          if (callback) {
            callback(data);
          } 
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          reject(error);
        });

        // Timeout connection attempt
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('WebSocket connection timeout'));
          }
        }, 5000);

      } catch (error) {
        reject(error);
      }
    });
  }

  subscribeToAIDecisions(aiAgentId, callback) {
    this.aiDecisionCallbacks.set(aiAgentId, callback);
  }

  unsubscribeFromAIDecisions(aiAgentId) {
    this.aiDecisionCallbacks.delete(aiAgentId);
  }

  subscribeToUserActionRequests(agentId, callback) {
    this.userActionCallbacks.set(agentId, callback);
  }

  unsubscribeFromUserActionRequests(agentId) {
    this.userActionCallbacks.delete(agentId);
  }

  updateGameState(gameState) {
    this.gameState = gameState;
  }

  async requestAIDecision(aiAgentId, aiPosition, playerPosition, mapBounds) {
    try {
      const requestBody = {
        aiAgentId,
        gameState: {
          aiPosition,
          playerPosition,
          mapBounds,
          timestamp: Date.now(),
          ...this.gameState
        }
      };
    
      const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

      const response = await fetch(`${API_BASE}/api/game/ai-decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend response error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
      }

      const result = await response.json();
      console.log(`AI Decision requested for ${aiAgentId}:`, result);
      return result;

    } catch (error) {
      console.error('Failed to request AI decision:', error);
      throw error;
    }
  }

  // Cleanup
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.aiDecisionCallbacks.clear();
    this.userActionCallbacks.clear();
    this.isConnected = false;
  }

  // Check if service is ready
  isReady() {
    return this.isConnected && this.socket;
  }
}

export const aiService = new AIService();
