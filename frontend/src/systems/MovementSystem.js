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
      // Cancel stationary actions when movement starts
      character.cancelActionIfMoving();
      character.switchToWalk();
    } else {
      // Only switch to idle if not performing an action
      if (!character.isPlayingAction()) {
        character.switchToIdle();
      }
    }

    // Normalize diagonal movement to maintain consistent speed
    if (moveX !== 0 && moveY !== 0) {
      moveX *= 0.707; // 1/√2 ≈ 0.707
      moveY *= 0.707;
    }

    const deltaTime = character.k.dt();
    const deltaX = moveX * this.moveSpeed * deltaTime;
    const deltaY = moveY * this.moveSpeed * deltaTime;
    const collisionYOffset = 16; // adjust based on sprite layout

    // Try full diagonal movement
    character.savePreviousPosition();
    character.updatePosition(deltaX, deltaY);
    let pos = character.getPosition();
    if (mapMask.isWalkable(pos.x, pos.y + collisionYOffset)) {
      return;
    }

    // Revert and try horizontal-only
    character.revertToPreviousPosition();
    character.savePreviousPosition();
    character.updatePosition(deltaX, 0);
    pos = character.getPosition();
    if (mapMask.isWalkable(pos.x, pos.y + collisionYOffset)) {
      return;
    }

    // Revert and try vertical-only
    character.revertToPreviousPosition();
    character.savePreviousPosition();
    character.updatePosition(0, deltaY);
    pos = character.getPosition();
    if (mapMask.isWalkable(pos.x, pos.y + collisionYOffset)) {
      return;
    }
    
    character.revertToPreviousPosition();
  }
}

export { MovementSystem };
