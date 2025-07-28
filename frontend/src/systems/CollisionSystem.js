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

  checkAABBCollision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  resolveCharacterObjectCollision(character, objects) {
    const prev = character.prevPos;
    const curr = character.getPosition();

    const deltaX = curr.x - prev.x;
    const deltaY = curr.y - prev.y;

    const makeBox = (x, y) => ({
      x: x - 10,
      y: y + 16,
      width: 20,
      height: 10,
    });

    const box = makeBox(curr.x, curr.y);
    const collided = objects.some(obj => this.checkAABBCollision(box, obj.collider));
    if (!collided) return;

    // Try horizontal-only
    character.revertToPreviousPosition();
    character.savePreviousPosition();
    character.updatePosition(deltaX, 0);
    const boxX = makeBox(character.getPosition().x, character.getPosition().y);
    if (!objects.some(obj => this.checkAABBCollision(boxX, obj.collider))) return;

    // Try vertical-only
    character.revertToPreviousPosition();
    character.savePreviousPosition();
    character.updatePosition(0, deltaY);
    const boxY = makeBox(character.getPosition().x, character.getPosition().y);
    if (!objects.some(obj => this.checkAABBCollision(boxY, obj.collider))) return;

    // Fully blocked
    character.revertToPreviousPosition();
  }

}

export { CollisionSystem };
