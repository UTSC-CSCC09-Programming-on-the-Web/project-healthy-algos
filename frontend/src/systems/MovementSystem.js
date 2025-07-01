import { GAME_CONFIG } from '../config/gameConfig';

class MovementSystem {
  constructor() {
    this.moveSpeed = GAME_CONFIG.MOVE_SPEED;
  }

  // For all sprites movement
  moveSprites(sprites, moveX, moveY) {
    // Normalize diagonal movement to maintain consistent speed
    if (moveX !== 0 && moveY !== 0) {
      moveX *= 0.707; // 1/√2 ≈ 0.707
      moveY *= 0.707;
    }

    if (moveX !== 0 || moveY !== 0) {
      sprites.forEach(sprite => {
        sprite.move(
          moveX * this.moveSpeed, 
          moveY * this.moveSpeed
        );
      });
    }
  }

  // For single sprite movement
  moveSprite(sprite, moveX, moveY) {
    this.moveSprites([sprite], moveX, moveY);
  }
}

export { MovementSystem };
