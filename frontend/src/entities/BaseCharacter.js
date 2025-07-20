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

  createSprites(spriteConfig) {
    // { idle: { base: "name", hair: "name" }, walk: { base: "name", hair: "name" }, attack: { base: "name", hair: "name" }, ... }
    this.spriteConfig = spriteConfig;
    this.createIdleSprites(spriteConfig.idle);
    this.createWalkSprites(spriteConfig.walk);
    
    // Create action sprites
    if (spriteConfig.attack) this.createActionSprites(ANIMATIONS.ATTACK, spriteConfig.attack);
    if (spriteConfig.axe) this.createActionSprites(ANIMATIONS.AXE, spriteConfig.axe);
    if (spriteConfig.dig) this.createActionSprites(ANIMATIONS.DIG, spriteConfig.dig);
    if (spriteConfig.hammering) this.createActionSprites(ANIMATIONS.HAMMERING, spriteConfig.hammering);
    if (spriteConfig.jump) this.createActionSprites(ANIMATIONS.JUMP, spriteConfig.jump);
    if (spriteConfig.mining) this.createActionSprites(ANIMATIONS.MINING, spriteConfig.mining);
    if (spriteConfig.reeling) this.createActionSprites(ANIMATIONS.REELING, spriteConfig.reeling);
    if (spriteConfig.watering) this.createActionSprites(ANIMATIONS.WATERING, spriteConfig.watering);
    
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

  createActionSprites(animationType, actionConfig) {
    const baseKey = `${animationType}Base`;
    const hairKey = `${animationType}Hair`;
    
    this.sprites[baseKey] = this.k.add([
      this.k.sprite(actionConfig.base),
      this.k.pos(this.position.x, this.position.y),
      this.k.anchor("center"),
      this.k.scale(GAME_CONFIG.PLAYER_SCALE),
    ]);

    this.sprites[hairKey] = this.k.add([
      this.k.sprite(actionConfig.hair),
      this.k.pos(this.position.x, this.position.y),
      this.k.anchor("center"),
      this.k.scale(GAME_CONFIG.PLAYER_SCALE),
    ]);

    this.sprites[baseKey].hidden = true;
    this.sprites[hairKey].hidden = true;
  }

  switchToIdle() {
    if (this.currentAnimation === ANIMATIONS.IDLE) return;
    
    this.hideAllSprites();
    this.currentAnimation = ANIMATIONS.IDLE;
    this.sprites.idleBase.hidden = false;
    this.sprites.idleHair.hidden = false;
  }

  switchToWalk() {
    if (this.currentAnimation === ANIMATIONS.WALK) return;
    
    this.hideAllSprites();
    this.currentAnimation = ANIMATIONS.WALK;
    this.sprites.walkBase.hidden = false;
    this.sprites.walkHair.hidden = false;
    
    this.sprites.walkBase.play("walk");
    this.sprites.walkHair.play("walk");
  }

  switchToAnimation(animationType) {
    if (this.currentAnimation === animationType) return;
    this.hideAllSprites();
    
    // Show sprites for the requested animation
    const baseKey = `${animationType}Base`;
    const hairKey = `${animationType}Hair`;
    
    if (this.sprites[baseKey] && this.sprites[hairKey]) {
      this.currentAnimation = animationType;
      this.sprites[baseKey].hidden = false;
      this.sprites[hairKey].hidden = false;
      this.sprites[baseKey].play(animationType);
      this.sprites[hairKey].play(animationType);
    } else {
      // Fallback to idle
      console.warn(`Animation ${animationType} not available for ${this.name}, falling back to idle`);
      this.switchToIdle();
    }
  }

  hideAllSprites() {
    Object.values(this.sprites).forEach(sprite => {
      sprite.hidden = true;
    });
  }

  returnToMovementAnimation() {
    this.switchToIdle();
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
