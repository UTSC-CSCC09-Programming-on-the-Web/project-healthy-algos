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
    this.clickableDistance = 30;
    this.showChatIndicator = false;
    
    // User action properties
    this.userActionInProgress = false;
    this.userActionData = null;
    this.userActionStartTime = 0;
    
    // Subscribe to AI decisions with retry logic
    this.setupAIServiceSubscriptions();
    
    // Retry subscription setup if aiService isn't ready
    if (!aiService.isReady()) {
      setTimeout(() => this.setupAIServiceSubscriptions(), 1000);
    }
  }

  setupAIServiceSubscriptions() {
    // Subscribe to AI decisions
    aiService.subscribeToAIDecisions(this.name, (decision, error) => {
      this.handleAIDecision(decision, error);
    });
    
    // Subscribe to user action requests
    aiService.subscribeToUserActionRequests(this.name, (actionData) => {
      this.handleUserActionRequest(actionData);
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

    // Execute current sequence (could be AI or user action)
    if (this.currentSequence) {
      return this.executeCurrentAction();
    }
    
    if (this.userActionInProgress && !this.currentSequence) {
      this.userActionInProgress = false;
      this.userActionData = null;
      this.userActionStartTime = 0;
      this.isPerformingAction = false;
      this.lastDecisionTime = Date.now() - this.decisionInterval;
    }

    // Only request AI decisions if no sequence is in progress
    if (aiService.isReady() && !this.isWaitingForAIDecision && !this.userActionInProgress && playerPosition && mapBounds) {
      const currentTime = Date.now();
      
      if (currentTime - this.lastDecisionTime >= this.decisionInterval) {
        this.requestAIDecision(playerPosition, mapBounds);
      }
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
    
    // Don't override user actions
    if (this.userActionInProgress) {
      console.log(`Ignoring AI decision for ${this.name} - user action in progress`);
      return;
    }
    
    if (decision && decision.sequence) {
      console.log(`AI unified sequence received for ${this.name}:`, decision);
      this.currentSequence = decision.sequence;
      this.currentActionIndex = 0;
      this.currentActionStartTime = Date.now();

      // Force immediate AI decision request after user action completes
      this.lastDecisionTime = Date.now() - this.decisionInterval;
    }
  }

  handleUserActionRequest(actionData) {
    // Create a new action sequence from the user request
    const userActionSequence = [{
      action: actionData.action,
      duration: actionData.duration || 15000, // Default 15 seconds like the AI worker sends
      animationStarted: false,
      completed: false
    }];

    // Set user action flags
    this.userActionInProgress = true;
    this.userActionData = actionData;
    this.userActionStartTime = Date.now();
    
    // Replace current sequence immediately with user action
    this.currentSequence = userActionSequence;
    this.currentActionIndex = 0;
    this.currentActionStartTime = 0; // Reset to start the new action timing
    
    // Stop waiting for AI decisions during user action
    this.isWaitingForAIDecision = false;
  }

  // Execute the current action in the sequence
  executeCurrentAction() {
    if (!this.currentSequence || this.currentActionIndex >= this.currentSequence.length) {
      if (this.userActionInProgress) {
        this.userActionInProgress = false;
        this.userActionData = null;
        this.userActionStartTime = 0;
        this.isPerformingAction = false;
        // Reset AI decision timer
        this.lastDecisionTime = 0;
      }
      
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

    if (!this.currentActionStartTime) {
      this.currentActionStartTime = currentTime;
    }
    
    const elapsed = (currentTime - this.currentActionStartTime) / 1000;
    const durationInSeconds = action.duration > 1000 ? action.duration / 1000 : action.duration;
    
    // Check if action is completed
    if (elapsed >= durationInSeconds) {
      action.completed = true;
      this.currentActionStartTime = 0; // Reset for next action
      
      if (this.isPerformingAction) {
        this.isPerformingAction = false;
      }
      
      return IDLE_MOVEMENT;
    }
    
    switch (action.action) {
      case "move": {
        // Handle direction array - cycle through directions during the action duration
        const timePerDirection = durationInSeconds / action.direction.length;
        const currentDirectionIndex = Math.floor(elapsed / timePerDirection);
        const directionToUse = action.direction[Math.min(currentDirectionIndex, action.direction.length - 1)];
        return DirectionSystem.getMovementFromDirection(directionToUse);
      }
      
      case "ATTACK":
      case "attack":
      case "AXE":
      case "axe":
      case "DIG":
      case "dig":
      case "HAMMERING":
      case "hammering":
      case "JUMP":
      case "jump":
      case "MINING":
      case "mining":
      case "REELING":
      case "reeling":
      case "WATERING":
      case "watering": {
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