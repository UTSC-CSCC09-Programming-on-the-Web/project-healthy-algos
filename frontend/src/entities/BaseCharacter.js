import { GAME_CONFIG, SCALED_MAP_WIDTH, SCALED_MAP_HEIGHT, ANIMATIONS } from '../config/gameConfig';

class BaseCharacter {
  constructor(kaplayContext, name = "player", startX = null, startY = null) {
    this.k = kaplayContext;
    this.name = name;
    this.sprites = {};
    this.currentAnimation = ANIMATIONS.IDLE;
    this.facingDirection = 1; // 1 for right, -1 for left
    this.isPerformingAction = false; // Track if character is performing an action
    this.actionTimeout = null; // Store action timeout for cleanup
    this.toolSprite = null; // Track current tool sprite
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
    this.hideToolSprite(); // Hide tool sprite when going to idle
    this.currentAnimation = ANIMATIONS.IDLE;
    this.sprites.idleBase.hidden = false;
    this.sprites.idleHair.hidden = false;
    
    // Start playing the idle animation with loop
    this.sprites.idleBase.play("idle", { loop: true });
    this.sprites.idleHair.play("idle", { loop: true });
  }

  switchToWalk() {
    if (this.currentAnimation === ANIMATIONS.WALK) return;
    
    // Cancel any stationary action before walking
    this.cancelActionIfMoving();
    
    this.hideAllSprites();
    this.hideToolSprite(); // Hide tool sprite when walking
    this.currentAnimation = ANIMATIONS.WALK;
    this.sprites.walkBase.hidden = false;
    this.sprites.walkHair.hidden = false;
    
    this.sprites.walkBase.play("walk", { loop: true });
    this.sprites.walkHair.play("walk", { loop: true });
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
    
    // Update tool sprite position
    this.updateToolPosition();
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
    // Update tool position when facing direction changes
    this.updateToolPosition();
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
    
    // Update tool position
    this.updateToolPosition();
  }

  destroy() {
    // Clear any pending action timeouts
    if (this.actionTimeout) {
      clearTimeout(this.actionTimeout);
    }
    
    // Clean up tool sprite
    this.hideToolSprite();
    
    Object.values(this.sprites).forEach(sprite => {
      sprite.destroy();
    });
    this.sprites = {};
  }

  // Action state management methods
  isPlayingAction() {
    return this.isPerformingAction;
  }

  isStationaryAction(animationType) {
    // Actions that require standing still (jump is excluded)
    const stationaryActions = [
      ANIMATIONS.ATTACK,
      ANIMATIONS.AXE,
      ANIMATIONS.DIG,
      ANIMATIONS.HAMMERING,
      ANIMATIONS.MINING,
      ANIMATIONS.REELING,
      ANIMATIONS.WATERING
    ];
    return stationaryActions.includes(animationType);
  }

  canPerformAction() {
    // Can only perform stationary actions when not moving
    return !this.isMoving();
  }

  isMoving() {
    return this.currentAnimation === ANIMATIONS.WALK;
  }

  cancelActionIfMoving() {
    // Cancel current action if it's a stationary action
    if (this.isPerformingAction && this.isStationaryAction(this.currentAnimation)) {
      this.stopAction();
      return true;
    }
    return false;
  }

  performAction(animationType) {
    // Check if this is a stationary action and if we can perform it
    if (this.isStationaryAction(animationType) && !this.canPerformAction()) {
      return Promise.reject(new Error("Cannot perform action while moving"));
    }

    // Clear any existing action timeout
    if (this.actionTimeout) {
      clearTimeout(this.actionTimeout);
      this.actionTimeout = null;
    }

    this.isPerformingAction = true;
    this.switchToAnimation(animationType);
    
    // No timeout - action continues until interrupted
    return Promise.resolve();
  }

  stopAction() {
    // Clear any existing action timeout
    if (this.actionTimeout) {
      clearTimeout(this.actionTimeout);
      this.actionTimeout = null;
    }
    
    this.isPerformingAction = false;
    this.hideToolSprite(); // Hide tool sprite when stopping action
    this.returnToMovementAnimation();
  }

  returnToMovementAnimation() {
    // Return to appropriate animation based on current state
    this.switchToIdle();
  }

  // Tool sprite management
  showToolSprite(toolName) {
    // Remove existing tool sprite if any
    this.hideToolSprite();
    
    if (toolName) {
      // Create tool sprite at initial position (will be updated by updateToolPosition)
      this.toolSprite = this.k.add([
        this.k.sprite(`tool_${toolName}`),
        this.k.pos(this.position.x, this.position.y), // Initial position, will be updated
        this.k.anchor("center"),
        this.k.scale(GAME_CONFIG.PLAYER_SCALE),
        this.k.z(10) // Ensure tool appears above character
      ]);
      
      // Don't start animation here - it will be started in switchToAnimation for sync
      
      // Set proper position based on facing direction and action
      this.updateToolPosition();
    }
  }

  hideToolSprite() {
    if (this.toolSprite) {
      this.k.destroy(this.toolSprite);
      this.toolSprite = null;
    }
  }

  updateToolPosition() {
    if (this.toolSprite) {
      // Center the tool sprite on the character with no offset
      this.toolSprite.pos = this.k.vec2(this.position.x, this.position.y);
      this.toolSprite.flipX = this.facingDirection === -1;
    }
  }

  switchToAnimation(animationType) {
    if (this.currentAnimation === animationType) return;
    
    this.hideAllSprites();
    this.currentAnimation = animationType;
    
    // Show appropriate tool sprite based on animation
    const toolMap = {
      [ANIMATIONS.ATTACK]: 'attack',
      [ANIMATIONS.AXE]: 'axe',
      [ANIMATIONS.DIG]: 'dig',
      [ANIMATIONS.HAMMERING]: 'hammering',
      [ANIMATIONS.MINING]: 'mining',
      [ANIMATIONS.REELING]: 'reeling',
      [ANIMATIONS.WATERING]: 'watering'
    };
    
    if (toolMap[animationType]) {
      this.showToolSprite(toolMap[animationType]);
    } else {
      this.hideToolSprite();
    }
    
    const baseKey = `${animationType}Base`;
    const hairKey = `${animationType}Hair`;
    
    if (this.sprites[baseKey] && this.sprites[hairKey]) {
      this.sprites[baseKey].hidden = false;
      this.sprites[hairKey].hidden = false;
      this.sprites[baseKey].flipX = this.facingDirection === -1;
      this.sprites[hairKey].flipX = this.facingDirection === -1;
      
      // Ensure tool sprite also faces the correct direction
      if (this.toolSprite) {
        this.toolSprite.flipX = this.facingDirection === -1;
      }
      
      // Start playing the animation with loop - synchronized speed
      const animSpeed = 8; // Slower speed for better sync
      this.sprites[baseKey].play(animationType, { loop: true, speed: animSpeed });
      this.sprites[hairKey].play(animationType, { loop: true, speed: animSpeed });
      
      // Ensure tool animation plays at the same speed
      if (this.toolSprite) {
        this.toolSprite.play(toolMap[animationType], { loop: true, speed: animSpeed });
      }
    } else {
      // Fallback to idle if animation doesn't exist
      this.switchToIdle();
    }
  }
}

export { BaseCharacter };
