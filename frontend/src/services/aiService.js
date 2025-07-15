import { io } from 'socket.io-client';

class AIService {
  constructor() {
    this.socket = null;
    this.aiDecisionCallbacks = new Map();
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
        this.socket = io('http://localhost:3001', {
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
          console.log('🔌 Connected to AI Worker WebSocket');
          this.isConnected = true;
          resolve();
        });

        this.socket.on('disconnect', () => {
          console.log('🔌 Disconnected from AI Worker WebSocket');
          this.isConnected = false;
        });

        this.socket.on('ai.decision', (data) => {
          console.log('🤖 AI Decision received:', data);
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

  // Subscribe to AI decisions for a specific agent
  subscribeToAIDecisions(aiAgentId, callback) {
    this.aiDecisionCallbacks.set(aiAgentId, callback);
  }

  // Unsubscribe from AI decisions
  unsubscribeFromAIDecisions(aiAgentId) {
    this.aiDecisionCallbacks.delete(aiAgentId);
  }

  // Update game state for AI context
  updateGameState(gameState) {
    this.gameState = gameState;
  }

  // Request AI decision from backend
  async requestAIDecision(aiAgentId, aiPosition, playerPosition, mapBounds) {
    try {
      const gameState = {
        aiPosition,
        playerPosition,
        mapBounds,
        timestamp: Date.now(),
        ...this.gameState
      };

      const response = await fetch('http://localhost:3000/api/game-ai/ai-decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aiAgentId,
          gameState
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
    this.isConnected = false;
  }

  // Check if service is ready
  isReady() {
    return this.isConnected && this.socket;
  }
}

export const aiService = new AIService();
