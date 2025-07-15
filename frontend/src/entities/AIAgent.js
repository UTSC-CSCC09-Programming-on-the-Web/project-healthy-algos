import { BaseCharacter } from './BaseCharacter';
import { aiService } from '../services/aiService';

export class AIAgent extends BaseCharacter {
  constructor(kaplayContext, agentName, startX = null, startY = null) {
    super(kaplayContext, agentName, startX, startY);
    this.isPlayer = false;
    this.aiState = "idle";
    this.lastDecisionTime = 0;
    this.decisionInterval = 5000; // Request AI decision every 5 seconds
    this.currentMovementDuration = 0;
    this.movementDuration = 0;
    this.agentType = this.getAgentTypeByName(agentName);
    
    // AI-specific properties
    this.lastAIDecision = null;
    this.isWaitingForAIDecision = false;
    this.fallbackBehavior = true;
    this.currentTarget = null;
    this.pathProgress = 0;
    
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
    // Use the agent type's sprite configuration
    const spriteConfig = {
      idle: this.agentType.idle,
      walk: this.agentType.walk
    };

    return super.createSprites(spriteConfig);
  }

  makeDecision() {
    const currentTime = Date.now();
    
    if (this.currentMovementDuration > 0) {
      this.currentMovementDuration -= 16; // Approximate frame time (60fps = ~16ms)
      return this.currentMovement || { moveX: 0, moveY: 0 };
    }
    
    if (currentTime - this.lastDecisionTime < this.decisionInterval) {
      return this.currentMovement || { moveX: 0, moveY: 0 };
    }

    this.lastDecisionTime = currentTime;

    const actions = ["idle", "move_random", "move_random", "move_random"];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    switch (randomAction) {
      case "idle": {
        this.setState("idle");
        this.movementDuration = 1000;
        this.currentMovementDuration = this.movementDuration;
        this.currentMovement = { moveX: 0, moveY: 0 };
        return this.currentMovement;
      }
        
      case "move_random": {
        this.setState("walking");
        this.movementDuration = 1000 + Math.random() * 1000;
        this.currentMovementDuration = this.movementDuration;
        
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.0; 
        
        this.currentMovement = {
          moveX: Math.cos(angle) * speed,
          moveY: Math.sin(angle) * speed
        };
        
        return this.currentMovement;
      }
        
      default: {
        this.setState("idle");
        this.currentMovement = { moveX: 0, moveY: 0 };
        return this.currentMovement;
      }
    }
  }

  update(playerPosition = null, mapBounds = null) {
    // Check if we should request an AI decision
    if (aiService.isReady() && !this.isWaitingForAIDecision && playerPosition && mapBounds) {
      const currentTime = Date.now();
      
      if (currentTime - this.lastDecisionTime >= this.decisionInterval) {
        this.requestAIDecision(playerPosition, mapBounds);
      }
    }
    
    // Execute current AI decision or fall back to simple behavior
    if (this.lastAIDecision) {
      return this.executeAIDecision();
    } else if (this.fallbackBehavior) {
      return this.makeDecision();
    }
    
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
      this.lastAIDecision = null;
      return;
    }
    
    if (decision) {
      console.log(`AI decision received for ${this.name}:`, decision);
      this.lastAIDecision = decision;
      this.currentTarget = decision.target;
      this.pathProgress = 0;
      
      // Reset movement duration for new decision
      this.movementDuration = 2000; // 2 seconds to execute AI decision
      this.currentMovementDuration = this.movementDuration;
    }
  }

  // Execute the current AI decision
  executeAIDecision() {
    if (!this.lastAIDecision) {
      return { moveX: 0, moveY: 0 };
    }
    
    // Check if we should still be executing this decision
    if (this.currentMovementDuration <= 0) {
      this.lastAIDecision = null;
      this.currentTarget = null;
      return { moveX: 0, moveY: 0 };
    }
    
    this.currentMovementDuration -= 16; // Approximate frame time
    
    const decision = this.lastAIDecision;
    
    switch (decision.action) {
      case "move_to_player":
      case "move_random": {
        if (decision.target) {
          return this.moveToTarget(decision.target);
        }
        return { moveX: 0, moveY: 0 };
      }
      
      case "idle": {
        this.setState("idle");
        return { moveX: 0, moveY: 0 };
      }
      
      case "interact": {
        // For now, just idle when interacting
        this.setState("idle");
        return { moveX: 0, moveY: 0 };
      }
      
      default: {
        return { moveX: 0, moveY: 0 };
      }
    }
  }

  // Move towards a specific target position
  moveToTarget(target) {
    if (!target) return { moveX: 0, moveY: 0 };
    
    const myPos = this.getPosition();
    const dx = target.x - myPos.x;
    const dy = target.y - myPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // If we're close enough to the target, stop moving
    if (distance < 20) {
      this.setState("idle");
      return { moveX: 0, moveY: 0 };
    }
    
    // Move towards target
    this.setState("walking");
    const speed = 1.5; // Slightly faster than random movement
    
    return {
      moveX: (dx / distance) * speed,
      moveY: (dy / distance) * speed
    };
  }

  // Cleanup when agent is destroyed
  destroy() {
    if (aiService) {
      aiService.unsubscribeFromAIDecisions(this.name);
    }
  }

  // AI behavior methods for future expansion
  setTarget(target) {
    this.target = target;
  }

  // State
  setState(newState) {
    this.aiState = newState;
  }

  getState() {
    return this.aiState;
  }

  getAgentType() {
    return this.agentType.name;
  }
}