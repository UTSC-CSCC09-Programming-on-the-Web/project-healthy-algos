import { GAME_CONFIG, SCALED_MAP_WIDTH, SCALED_MAP_HEIGHT, ANIMATIONS } from '../config/gameConfig';

class BaseCharacter {
  constructor(kaplayContext, name = "player", startX = null, startY = null) {
    this.k = kaplayContext;
    this.name = name;
    this.sprites = {};
    this.currentAnimation = ANIMATIONS.IDLE;
    this.facingDirection = 1; // 1 for right, -1 for left
    this.position = {
      x: startX || (SCALED_MAP_WIDTH / 2),
      y: startY || (SCALED_MAP_HEIGHT / 2)
    };
  }
  
  savePreviousPosition() {
    this.prevPos = { x: this.position.x, y: this.position.y };
  }

  revertToPreviousPosition() {
    if (!this.prevPos) return;

    this.setPosition(this.prevPos.x, this.prevPos.y);
  }
  
  createSprites(spriteConfig) {
    // spriteConfig { idle: { base: "name", hair: "name" }, walk: { base: "name", hair: "name" } }
    this.spriteConfig = spriteConfig;
    this.createIdleSprites(spriteConfig.idle);
    this.createWalkSprites(spriteConfig.walk);
    this.switchToIdle();
    return this.sprites;
  }

  createIdleSprites(idleConfig) {
    this.sprites.idleBase = this.k.add([
      this.k.sprite(idleConfig.base),
      this.k.pos(this.position.x, this.position.y),
      this.k.anchor("center"),
      this.k.scale(GAME_CONFIG.PLAYER_SCALE),
    ]);

    this.sprites.idleHair = this.k.add([
      this.k.sprite(idleConfig.hair),
      this.k.pos(this.position.x, this.position.y),
      this.k.anchor("center"),
      this.k.scale(GAME_CONFIG.PLAYER_SCALE),
    ]);

    this.sprites.idleBase.play("idle");
    this.sprites.idleHair.play("idle");
  }

  createWalkSprites(walkConfig) {
    this.sprites.walkBase = this.k.add([
      this.k.sprite(walkConfig.base),
      this.k.pos(this.position.x, this.position.y),
      this.k.anchor("center"),
      this.k.scale(GAME_CONFIG.PLAYER_SCALE),
    ]);

    this.sprites.walkHair = this.k.add([
      this.k.sprite(walkConfig.hair),
      this.k.pos(this.position.x, this.position.y),
      this.k.anchor("center"),
      this.k.scale(GAME_CONFIG.PLAYER_SCALE),
    ]);

    this.sprites.walkBase.hidden = true;
    this.sprites.walkHair.hidden = true;
  }

  switchToIdle() {
    if (this.currentAnimation === ANIMATIONS.IDLE) return;
    this.currentAnimation = ANIMATIONS.IDLE;
    this.sprites.idleBase.hidden = false;
    this.sprites.idleHair.hidden = false;
    this.sprites.walkBase.hidden = true;
    this.sprites.walkHair.hidden = true;
  }

  switchToWalk() {
    if (this.currentAnimation === ANIMATIONS.WALK) return;
    
    this.currentAnimation = ANIMATIONS.WALK;
    this.sprites.idleBase.hidden = true;
    this.sprites.idleHair.hidden = true;
    this.sprites.walkBase.hidden = false;
    this.sprites.walkHair.hidden = false;
    
    this.sprites.walkBase.play("walk");
    this.sprites.walkHair.play("walk");
  }

  updatePosition(deltaX, deltaY) {
    this.position.x += deltaX;
    this.position.y += deltaY;

    Object.values(this.sprites).forEach(sprite => {
      sprite.pos.x = this.position.x;
      sprite.pos.y = this.position.y;
    });
  }

  // Update facing direction and flip sprites accordingly
  updateFacingDirection(moveX) {
    if (moveX > 0 && this.facingDirection !== 1) {
      // right
      this.facingDirection = 1;
      this.flipSprites(false);
    } else if (moveX < 0 && this.facingDirection !== -1) {
      // left
      this.facingDirection = -1;
      this.flipSprites(true);
    }
  }

  flipSprites(shouldFlip) {
    Object.values(this.sprites).forEach(sprite => {
      sprite.flipX = shouldFlip;
    });
  }

  getMainSprite() {
    if (this.currentAnimation === ANIMATIONS.WALK) {
      return this.sprites.walkBase;
    }
    return this.sprites.idleBase;
  }

  getPosition() {
    return this.position;
  }

  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
    
    Object.values(this.sprites).forEach(sprite => {
      sprite.pos.x = x;
      sprite.pos.y = y;
    });
  }

  destroy() {
    Object.values(this.sprites).forEach(sprite => {
      sprite.destroy();
    });
    this.sprites = {};
  }
}

export { BaseCharacter };
