import { GAME_CONFIG } from '../config/gameConfig';

class MovementSystem {
  constructor() {
    this.moveSpeed = GAME_CONFIG.MOVE_SPEED;
  }

  moveCharacter(character, moveX, moveY) {
    // Update facing direction before movement
    if (moveX !== 0) {
      character.updateFacingDirection(moveX);
    }

    // Normalize diagonal movement to maintain consistent speed
    if (moveX !== 0 && moveY !== 0) {
      moveX *= 0.707; // 1/√2 ≈ 0.707
      moveY *= 0.707;
    }

    if (moveX !== 0 || moveY !== 0) {
      const deltaTime = character.k.dt();
      const deltaX = moveX * this.moveSpeed * deltaTime;
      const deltaY = moveY * this.moveSpeed * deltaTime;
      character.updatePosition(deltaX, deltaY);
    }
  }
}

export { MovementSystem };
