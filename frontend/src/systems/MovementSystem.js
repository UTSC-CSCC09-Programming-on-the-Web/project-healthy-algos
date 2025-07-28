import { GAME_CONFIG } from '../config/gameConfig';

class MovementSystem {
  constructor() {
    this.moveSpeed = GAME_CONFIG.MOVE_SPEED;
  }

  moveCharacter(character, moveX, moveY, mapMask) {
    // Update facing direction before movement
    if (moveX !== 0) {
      character.updateFacingDirection(moveX);
    }

    // Handle animation state based on movement
    if (moveX !== 0 || moveY !== 0) {
      character.switchToWalk();
    } else {
      character.switchToIdle();
    }

    // Normalize diagonal movement to maintain consistent speed
    if (moveX !== 0 && moveY !== 0) {
      moveX *= 0.707; // 1/√2 ≈ 0.707
      moveY *= 0.707;
    }

    const deltaTime = character.k.dt();
    const deltaX = moveX * this.moveSpeed * deltaTime;
    const deltaY = moveY * this.moveSpeed * deltaTime;

    // Save position before move
    character.savePreviousPosition();

    // Attempt to move
    character.updatePosition(deltaX, deltaY);

    // Revert if new position is not walkable
    const pos = character.getPosition();
    const collisionYOffset = 16; // adjust based on sprite layout
    if (!mapMask.isWalkable(pos.x, pos.y + collisionYOffset)) {
      character.revertToPreviousPosition();
    }
  }
}

export { MovementSystem };
