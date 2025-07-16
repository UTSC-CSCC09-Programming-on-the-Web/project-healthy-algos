import { BaseCharacter } from './BaseCharacter';
import { aiService } from '../services/aiService';
import { DirectionSystem } from '../systems/DirectionSystem';

export class AIAgent extends BaseCharacter {
  constructor(kaplayContext, agentName, startX = null, startY = null) {
    super(kaplayContext, agentName, startX, startY);
    this.isPlayer = false;
    this.aiState = "idle";
    this.lastDecisionTime = 0;
    this.decisionInterval = 30000; // Request AI decision every 30 seconds
    this.agentType = this.getAgentTypeByName(agentName);
    
    // AI sequence properties
    this.currentSequence = null;
    this.currentActionIndex = 0;
    this.currentActionStartTime = 0;
    this.isWaitingForAIDecision = false;
    
    // Chat properties
    this.isInChat = false;
    this.chatHoverDistance = 60;
    this.clickableDistance = 200;
    this.showChatIndicator = false;
    
    // Subscribe to AI decisions
    aiService.subscribeToAIDecisions(agentName, (decision, error) => {
      this.handleAIDecision(decision, error);
    });
  }

  getAgentTypeByName(agentName) {
    const agentTypes = {
      'Agent_A': {
        name: 'Agent_A',
        idle: { base: "player_idle_base", hair: "agent_a_idle_spiky_hair" },
        walk: { base: "player_walk_base", hair: "agent_a_walk_spiky_hair" }
      },
      'Agent_B': {
        name: 'Agent_B',
        idle: { base: "player_idle_base", hair: "agent_b_idle_long_hair" },
        walk: { base: "player_walk_base", hair: "agent_b_walk_long_hair" }
      },
      'Agent_C': {
        name: 'Agent_C',
        idle: { base: "player_idle_base", hair: "agent_c_idle_curly_hair" },
        walk: { base: "player_walk_base", hair: "agent_c_walk_curly_hair" }
      },
      'Agent_D': {
        name: 'Agent_D',
        idle: { base: "player_idle_base", hair: "agent_d_idle_mop_hair" },
        walk: { base: "player_walk_base", hair: "agent_d_walk_mop_hair" }
      },
    };

    return agentTypes[agentName] || {
      name: agentName || 'Unknown_Agent',
      idle: { base: "player_idle_base", hair: "player_idle_short_hair" },
      walk: { base: "player_walk_base", hair: "player_walk_short_hair" }
    };
  }

  createSprites() {
    const spriteConfig = {
      idle: this.agentType.idle,
      walk: this.agentType.walk
    };

    return super.createSprites(spriteConfig);
  }

  update(playerPosition = null, mapBounds = null) {
    // If in chat, stay idle and don't move
    if (this.isInChat) {
      return { moveX: 0, moveY: 0 };
    }

    // Check if player is nearby for chat indicator
    if (playerPosition) {
      const distance = this.getDistanceToPlayer(playerPosition);
      this.showChatIndicator = distance <= this.chatHoverDistance;
    }

    if (aiService.isReady() && !this.isWaitingForAIDecision && playerPosition && mapBounds) {
      const currentTime = Date.now();
      
      if (currentTime - this.lastDecisionTime >= this.decisionInterval) {
        this.requestAIDecision(playerPosition, mapBounds);
      }
    }
    
    if (this.currentSequence) {
      return this.executeCurrentAction();
    }
    
    // Fallback to idle
    return { moveX: 0, moveY: 0 };
  }

  // Request AI decision from the AI service
  async requestAIDecision(playerPosition, mapBounds) {
    if (this.isWaitingForAIDecision) return;
    
    this.isWaitingForAIDecision = true;
    this.lastDecisionTime = Date.now();
    
    try {
      const aiPosition = this.getPosition();
      await aiService.requestAIDecision(this.name, aiPosition, playerPosition, mapBounds);
    } catch (error) {
      console.error(`Failed to request AI decision for ${this.name}:`, error);
      this.isWaitingForAIDecision = false;
    }
  }

  // Handle AI decision received from WebSocket
  handleAIDecision(decision, error) {
    this.isWaitingForAIDecision = false;
    
    if (error) {
      console.error(`AI decision error for ${this.name}:`, error);
      this.currentSequence = null;
      return;
    }
    
    if (decision && decision.sequence) {
      console.log(`AI sequence received for ${this.name}:`, decision);
      this.currentSequence = decision.sequence;
      this.currentActionIndex = 0;
      this.currentActionStartTime = Date.now();
    }
  }

  // Execute the current action in the sequence
  executeCurrentAction() {
    if (!this.currentSequence || this.currentActionIndex >= this.currentSequence.length) {
      this.currentSequence = null;
      return { moveX: 0, moveY: 0 };
    }
    
    const currentAction = this.currentSequence[this.currentActionIndex];
    const currentTime = Date.now();
    const actionElapsed = (currentTime - this.currentActionStartTime) / 1000;
    
    if (actionElapsed >= currentAction.duration) {
      this.currentActionIndex++;
      this.currentActionStartTime = currentTime;
      
      if (this.currentActionIndex >= this.currentSequence.length) {
        this.currentSequence = null;
        return { moveX: 0, moveY: 0 };
      }

      const newCurrentAction = this.currentSequence[this.currentActionIndex];
      return this.performAction(newCurrentAction);
    }

    return this.performAction(currentAction);
  }

  // Perform a specific action
  performAction(action) {
    switch (action.action) {
      case "move": {
        return DirectionSystem.getMovementFromDirection(action.direction);
      }
      
      case "idle": {
        return { moveX: 0, moveY: 0 };
      }
      
      default: {
        return { moveX: 0, moveY: 0 };
      }
    }
  }

  // Cleanup agent
  destroy() {
    if (aiService) {
      aiService.unsubscribeFromAIDecisions(this.name);
    }
    super.destroy();
  }

  getAgentType() {
    return this.agentType.name;
  }

  // Chat-related methods
  getDistanceToPlayer(playerPosition) {
    const myPos = this.getPosition();
    const dx = playerPosition.x - myPos.x;
    const dy = playerPosition.y - myPos.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  isClickableForChat(playerPosition) {
    return this.getDistanceToPlayer(playerPosition) <= this.clickableDistance;
  }

  startChat() {
    console.log(`${this.name} entering chat mode`);
    this.isInChat = true;
    this.aiState = "chatting";
    // Stop any current movement
    this.currentSequence = null;
    this.currentActionIndex = 0;
    this.isWaitingForAIDecision = false;
  }

  endChat() {
    console.log(`${this.name} leaving chat mode`);
    this.isInChat = false;
    this.aiState = "idle";
    this.lastDecisionTime = 0;
    this.showChatIndicator = false;
  }

  canInteractWith(player) {
    return this.getDistanceToPlayer(player.getPosition()) <= this.chatHoverDistance;
  }
}