import { BaseCharacter } from './BaseCharacter';

export class AIAgent extends BaseCharacter {
  constructor(kaplayContext, agentName, startX = null, startY = null) {
    super(kaplayContext, agentName, startX, startY);
    this.isPlayer = false;
    this.aiState = "idle";
    this.lastDecisionTime = 0;
    this.decisionInterval = 1000;
    this.currentMovementDuration = 0;
    this.movementDuration = 0;
    this.agentType = this.getAgentTypeByName(agentName);
  }

  getAgentTypeByName(agentName) {
    // Map agent names to specific sprite configurations
    const agentTypes = {
      'Agent_A': {
        name: 'villager',
        idle: { base: "player_idle_base", hair: "agent_a_idle_spiky_hair" },
        walk: { base: "player_walk_base", hair: "agent_a_walk_spiky_hair" }
      },
      'Agent_B': {
        name: 'guard',
        idle: { base: "player_idle_base", hair: "agent_b_idle_long_hair" },
        walk: { base: "player_walk_base", hair: "agent_b_walk_long_hair" }
      },
      'Agent_C': {
        name: 'merchant',
        idle: { base: "player_idle_base", hair: "agent_c_idle_curly_hair" },
        walk: { base: "player_walk_base", hair: "agent_c_walk_curly_hair" }
      },
      'Agent_D': {
        name: 'wanderer',
        idle: { base: "player_idle_base", hair: "agent_d_idle_mop_hair" },
        walk: { base: "player_walk_base", hair: "agent_d_walk_mop_hair" }
      },
    };

    // Return specific agent type or fallback to a random one
    return agentTypes[agentName] || this.getRandomAgentType();
  }

  getRandomAgentType() {
    // Fallback for any agents not specifically mapped
    const types = [
      {
        name: 'villager',
        idle: { base: "player_idle_base", hair: "agent_a_idle_spiky_hair" },
        walk: { base: "player_walk_base", hair: "agent_a_walk_spiky_hair" }
      },
      {
        name: 'guard',
        idle: { base: "player_idle_base", hair: "agent_b_idle_long_hair" },
        walk: { base: "player_walk_base", hair: "agent_b_walk_long_hair" }
      },
      {
        name: 'merchant',
        idle: { base: "player_idle_base", hair: "agent_c_idle_curly_hair" },
        walk: { base: "player_walk_base", hair: "agent_c_walk_curly_hair" }
      },
      {
        name: 'wanderer',
        idle: { base: "player_idle_base", hair: "agent_d_idle_mop_hair" },
        walk: { base: "player_walk_base", hair: "agent_d_walk_mop_hair" }
      }
    ];
    return types[Math.floor(Math.random() * types.length)];
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
      case "idle":
        this.setState("idle");
        this.movementDuration = 1000;
        this.currentMovementDuration = this.movementDuration;
        this.currentMovement = { moveX: 0, moveY: 0 };
        return this.currentMovement;
        
      case "move_random":
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
        
      default:
        this.setState("idle");
        this.currentMovement = { moveX: 0, moveY: 0 };
        return this.currentMovement;
    }
  }

  update() {
    const decision = this.makeDecision();
    return decision;
  }

  // AI behavior methods for future expansion
  setTarget(target) {
    this.target = target;
  }

  moveToTarget() {
    if (!this.target) return { moveX: 0, moveY: 0 };
    
    const myPos = this.getPosition();
    const targetPos = this.target.getPosition();
    
    const dx = targetPos.x - myPos.x;
    const dy = targetPos.y - myPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 10) {
      return { moveX: 0, moveY: 0 }; 
    }
    
    return {
      moveX: dx / distance,
      moveY: dy / distance
    };
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