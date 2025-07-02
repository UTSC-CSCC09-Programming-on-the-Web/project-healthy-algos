import { BaseCharacter } from './BaseCharacter';

export class AIAgent extends BaseCharacter {
  constructor(kaplayContext, agentName, startX = null, startY = null) {
    super(kaplayContext, agentName, startX, startY);
    this.isPlayer = false;
    this.aiState = "idle";
    this.target = null;
    this.lastDecisionTime = 0;
    this.decisionInterval = 2000;
  }

  createSprites() {
    const spriteConfig = {
      idle: {
        base: "player_idle_base",
        hair: "player_idle_short_hair"
      },
      walk: {
        base: "player_walk_base", 
        hair: "player_walk_short_hair"
      }
    };

    return super.createSprites(spriteConfig);
  }

  // AI decision making
  makeDecision() {
    const currentTime = Date.now();
    if (currentTime - this.lastDecisionTime < this.decisionInterval) {
      return null; // Querry AI later
    }

    this.lastDecisionTime = currentTime;

    // Random movement for now
    const actions = ["idle", "move_random"];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    switch (randomAction) {
      case "idle":
        return { moveX: 0, moveY: 0 };
      case "move_random":
        return {
          moveX: (Math.random() - 0.5) * 2, // -1 to 1
          moveY: (Math.random() - 0.5) * 2  // -1 to 1
        };
      default:
        return { moveX: 0, moveY: 0 };
    }
  }

  update() {
    const decision = this.makeDecision();
    return decision; 
  }

  setState(newState) {
    this.aiState = newState;
  }

  getState() {
    return this.aiState;
  }
}
