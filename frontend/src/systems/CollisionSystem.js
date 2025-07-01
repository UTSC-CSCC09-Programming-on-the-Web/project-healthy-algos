import { GAME_CONFIG, SCALED_MAP_WIDTH, SCALED_MAP_HEIGHT } from '../config/gameConfig';

class CollisionSystem {
  constructor() {
    this.collisionWidth = GAME_CONFIG.COLLISION_WIDTH / 2;
    this.collisionHeight = GAME_CONFIG.COLLISION_HEIGHT / 2;
  }

  constrainToMapBounds(sprites) {
    sprites.forEach(sprite => {
      let newX = sprite.pos.x;
      let newY = sprite.pos.y;

      // Apply rectangular map bounds
      if (newX - this.collisionWidth < 0) {
        newX = this.collisionWidth;
      }
      if (newX + this.collisionWidth > SCALED_MAP_WIDTH) {
        newX = SCALED_MAP_WIDTH - this.collisionWidth;
      }
      if (newY - this.collisionHeight < 0) {
        newY = this.collisionHeight;
      }
      if (newY + this.collisionHeight > SCALED_MAP_HEIGHT) {
        newY = SCALED_MAP_HEIGHT - this.collisionHeight;
      }

      sprite.pos.x = newX;
      sprite.pos.y = newY;
    });
  }

  // Check if two sprites are colliding (for future use)
  checkCollision(sprite1, sprite2) {
    const dx = sprite1.pos.x - sprite2.pos.x;
    const dy = sprite1.pos.y - sprite2.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = this.collisionWidth * 2;
    
    return distance < minDistance;
  }

  // Get all sprites within a certain radius
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
