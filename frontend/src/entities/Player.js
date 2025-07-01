import { BaseCharacter } from './BaseCharacter';

class Player extends BaseCharacter {
  constructor(kaplayContext, startX = null, startY = null) {
    super(kaplayContext, "player", startX, startY);
    this.isPlayer = true;
  }

  createSprites() {
    return super.createSprites("player_idle_base", "player_idle_short_hair");
  }

  // Maybe player-specific logic in the future, but not sure
}

export { Player };
