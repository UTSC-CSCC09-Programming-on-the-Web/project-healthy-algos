import { GAME_CONFIG, SCALED_MAP_WIDTH, SCALED_MAP_HEIGHT } from '../config/gameConfig';

class CollisionSystem {
  constructor() {
    this.collisionWidth = 10; 
    this.collisionHeight = 10;
  }

  constrainToMap(character, mapMask) {
    const pos = character.getPosition();
    if (!mapMask.isWalkable(pos.x, pos.y)) {
      character.revertToPreviousPosition();
    }
  }

  // Check if two sprites are colliding (for future use)
  checkCollision(sprite1, sprite2) {
    const dx = sprite1.pos.x - sprite2.pos.x;
    const dy = sprite1.pos.y - sprite2.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = this.collisionWidth * 2;
    
    return distance < minDistance;
  }

  // Get all sprites within a certain radius (for future use)
  getSpritesInRadius(centerSprite, allSprites, radius) {
    return allSprites.filter(sprite => {
      if (sprite === centerSprite) return false;
      
      const dx = centerSprite.pos.x - sprite.pos.x;
      const dy = centerSprite.pos.y - sprite.pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      return distance <= radius;
    });
  }
}

export { CollisionSystem };
