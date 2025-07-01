import { GAME_CONFIG, SCALED_MAP_WIDTH, SCALED_MAP_HEIGHT } from '../config/gameConfig';

class BaseCharacter {
  constructor(kaplayContext, characterName = "player", startX = null, startY = null) {
    this.k = kaplayContext;
    this.characterName = characterName;
    this.sprites = {};
    
    this.startX = startX || (SCALED_MAP_WIDTH / 2);
    this.startY = startY || (SCALED_MAP_HEIGHT / 2);
  }

  createSprites(baseSpriteName = "player_idle_base", hairSpriteName = "player_idle_short_hair") {
    this.sprites.base = this.k.add([
      this.k.sprite(baseSpriteName),
      this.k.pos(this.startX, this.startY),
      this.k.anchor("center"),
      this.k.scale(GAME_CONFIG.PLAYER_SCALE),
      this.k.area({ 
        width: GAME_CONFIG.COLLISION_WIDTH, 
        height: GAME_CONFIG.COLLISION_HEIGHT, 
        offset: this.k.vec2(GAME_CONFIG.COLLISION_OFFSET.x, GAME_CONFIG.COLLISION_OFFSET.y) 
      }),
    ]);

    this.sprites.hair = this.k.add([
      this.k.sprite(hairSpriteName),
      this.k.pos(this.startX, this.startY),
      this.k.anchor("center"),
      this.k.scale(GAME_CONFIG.PLAYER_SCALE),
    ]);

    this.sprites.base.play("idle");
    this.sprites.hair.play("idle");

    return this.sprites;
  }

  getAllSprites() {
    return Object.values(this.sprites);
  }

  getMainSprite() {
    return this.sprites.base;
  }

  getPosition() {
    return this.sprites.base ? this.sprites.base.pos : null;
  }

  setPosition(x, y) {
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
