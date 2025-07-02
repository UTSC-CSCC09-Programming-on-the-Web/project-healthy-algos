import { GAME_CONFIG, SCALED_MAP_WIDTH, SCALED_MAP_HEIGHT } from '../config/gameConfig';

class CollisionSystem {
  constructor() {
    this.collisionWidth = 10; 
    this.collisionHeight = 10;
  }

  constrainToMapBounds(character) {
    const pos = character.getPosition();
    let newX = pos.x;
    let newY = pos.y;

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

    if (newX !== pos.x || newY !== pos.y) {
      character.setPosition(newX, newY);
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
