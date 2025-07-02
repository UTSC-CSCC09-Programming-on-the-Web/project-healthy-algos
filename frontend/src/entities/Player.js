import { BaseCharacter } from './BaseCharacter';
import { ANIMATIONS } from '../config/gameConfig';

class Player extends BaseCharacter {
  constructor(kaplayContext, startX = null, startY = null) {
    super(kaplayContext, "player", startX, startY);
    this.isPlayer = true;
  }

  createSprites() {
    // Define sprite configuration for player
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

  // Player-specific methods for future
  // (input handling, player stats, etc.)
}

export { Player };
