import { BaseCharacter } from './BaseCharacter';
import { aiService } from '../services/aiService';
import { DirectionSystem } from '../systems/DirectionSystem';

// Constants
const IDLE_MOVEMENT = { moveX: 0, moveY: 0 };

export class AIAgent extends BaseCharacter {
  constructor(kaplayContext, agentName, startX = null, startY = null) {
    super(kaplayContext, agentName, startX, startY);
    this.isPlayer = false;
    this.aiState = "idle";
    this.lastDecisionTime = 0;
    this.decisionInterval = 60000; // Request AI decision every 60 seconds
    this.agentType = this.getAgentTypeByName(agentName);
    
    // AI sequence properties
    this.currentSequence = null;
    this.currentActionIndex = 0;
    this.currentActionStartTime = 0;
    this.isWaitingForAIDecision = false;
    this.decisionStartTime = 0; // Track when current decision cycle started
    
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
        hair: 'spiky_hair',
        idle: { base: "player_idle_base", hair: "agent_a_idle_spiky_hair" },
        walk: { base: "player_walk_base", hair: "agent_a_walk_spiky_hair" }
      },
      'Agent_B': {
        name: 'Agent_B',
        hair: 'long_hair',
        idle: { base: "player_idle_base", hair: "agent_b_idle_long_hair" },
        walk: { base: "player_walk_base", hair: "agent_b_walk_long_hair" }
      },
      'Agent_C': {
        name: 'Agent_C',
        hair: 'curly_hair',
        idle: { base: "player_idle_base", hair: "agent_c_idle_curly_hair" },
        walk: { base: "player_walk_base", hair: "agent_c_walk_curly_hair" }
      },
      'Agent_D': {
        name: 'Agent_D',
        hair: 'mop_hair',
        idle: { base: "player_idle_base", hair: "agent_d_idle_mop_hair" },
        walk: { base: "player_walk_base", hair: "agent_d_walk_mop_hair" }
      },
    };

    return agentTypes[agentName] || {
      name: agentName || 'Unknown_Agent',
      hair: 'short_hair',
      idle: { base: "player_idle_base", hair: "player_idle_short_hair" },
      walk: { base: "player_walk_base", hair: "player_walk_short_hair" }
    };
  }

  createSprites() {
    const hairType = this.agentType.hair;
    const spriteConfig = {
      idle: this.agentType.idle,
      walk: this.agentType.walk,
      // Add action animations for AI agents
      attack: { base: `player_attack_base`, hair: `player_attack_${hairType}` },
      axe: { base: `player_axe_base`, hair: `player_axe_${hairType}` },
      dig: { base: `player_dig_base`, hair: `player_dig_${hairType}` },
      hammering: { base: `player_hammering_base`, hair: `player_hammering_${hairType}` },
      jump: { base: `player_jump_base`, hair: `player_jump_${hairType}` },
      mining: { base: `player_mining_base`, hair: `player_mining_${hairType}` },
      reeling: { base: `player_reeling_base`, hair: `player_reeling_${hairType}` },
      watering: { base: `player_watering_base`, hair: `player_watering_${hairType}` }
    };

    return super.createSprites(spriteConfig);
  }

  update(playerPosition = null, mapBounds = null) {
    // If in chat, stay idle
    if (this.isInChat) {
      return IDLE_MOVEMENT;
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
    return IDLE_MOVEMENT;
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
      console.log(`AI unified sequence received for ${this.name}:`, decision);
      this.currentSequence = decision.sequence;
      this.currentActionIndex = 0;
      this.currentActionStartTime = Date.now();
    }
  }

  // Execute the current action in the sequence
  executeCurrentAction() {
    if (!this.currentSequence || this.currentActionIndex >= this.currentSequence.length) {
      this.currentSequence = null;
      return IDLE_MOVEMENT;
    }

    const currentAction = this.currentSequence[this.currentActionIndex];
    
    if (currentAction.completed) {
      this.currentActionIndex++;
      
      if (this.currentActionIndex >= this.currentSequence.length) {
        this.currentSequence = null;
        return IDLE_MOVEMENT;
      }
      
      const newCurrentAction = this.currentSequence[this.currentActionIndex];
      return this.performAction(newCurrentAction);
    }
    
    return this.performAction(currentAction);
  }
  performAction(action) {
    const currentTime = Date.now();
    
    // Initialize action start time if not set
    if (!this.currentActionStartTime) {
      this.currentActionStartTime = currentTime;
    }
    
    const elapsed = (currentTime - this.currentActionStartTime) / 1000;
    
    // Check if action is completed
    if (elapsed >= action.duration) {
      action.completed = true;
      this.currentActionStartTime = currentTime; // Reset for next action
      return IDLE_MOVEMENT;
    }
    
    switch (action.action) {
      case "move": {
        // Handle direction array - cycle through directions during the action duration
        const timePerDirection = action.duration / action.direction.length;
        const currentDirectionIndex = Math.floor(elapsed / timePerDirection);
        const directionToUse = action.direction[Math.min(currentDirectionIndex, action.direction.length - 1)];
        return DirectionSystem.getMovementFromDirection(directionToUse);
      }
      
      case "ATTACK":
      case "AXE":
      case "DIG":
      case "HAMMERING":
      case "JUMP":
      case "MINING":
      case "REELING":
      case "WATERING": {
        if (!action.animationStarted) {
          const actionMethod = `perform${action.action.charAt(0).toUpperCase() + action.action.slice(1).toLowerCase()}`;
          if (typeof this[actionMethod] === 'function') {
            this[actionMethod]();
            action.animationStarted = true;
          }
        }
        return IDLE_MOVEMENT;
      }
      
      default: {
        return IDLE_MOVEMENT;
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
  
  // Action methods
  performAttack() {
    return super.performAction("attack");
  }

  performAxe() {
    return super.performAction("axe");
  }

  performDig() {
    return super.performAction("dig");
  }

  performHammering() {
    return super.performAction("hammering");
  }

  performJump() {
    return super.performAction("jump");
  }

  performMining() {
    return super.performAction("mining");
  }

  performReeling() {
    return super.performAction("reeling");
  }

  performWatering() {
    return super.performAction("watering");
  }

  canInteractWith(player) {
    return this.getDistanceToPlayer(player.getPosition()) <= this.chatHoverDistance;
  }
}