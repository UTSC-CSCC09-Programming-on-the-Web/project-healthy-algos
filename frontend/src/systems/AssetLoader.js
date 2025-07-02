import { GAME_CONFIG } from '../config/gameConfig';

class AssetLoader {
  constructor(kaplayContext) {
    this.k = kaplayContext;
  }

  loadAllAssets() {
    this.k.loadSprite("map_background", GAME_CONFIG.ASSETS.MAP_BACKGROUND);

    this.k.loadSprite("player_idle_base", GAME_CONFIG.ASSETS.PLAYER_IDLE_BASE, {
      sliceX: 9, 
      sliceY: 1, 
      anims: {
        idle: {
          from: 0,
          to: 8,
          speed: 8,
          loop: true
        }
      }
    });

    this.k.loadSprite("player_idle_short_hair", GAME_CONFIG.ASSETS.PLAYER_IDLE_SHORT_HAIR, {
      sliceX: 9, 
      sliceY: 1, 
      anims: {
        idle: {
          from: 0,
          to: 8,
          speed: 8,
          loop: true
        }
      }
    });

    this.k.loadSprite("player_walk_base", GAME_CONFIG.ASSETS.PLAYER_WALK_BASE, {
      sliceX: 8, 
      sliceY: 1, 
      anims: {
        walk: {
          from: 0,
          to: 7,
          speed: 12,
          loop: true
        }
      }
    });

    this.k.loadSprite("player_walk_short_hair", GAME_CONFIG.ASSETS.PLAYER_WALK_SHORT_HAIR, {
      sliceX: 8, 
      sliceY: 1, 
      anims: {
        walk: {
          from: 0,
          to: 7,
          speed: 12,
          loop: true
        }
      }
    });
  }

  // Load characater sprites
  loadCharacterSprites(characterName, basePath, hairPath) {
    this.k.loadSprite(`${characterName}_base`, basePath, {
      sliceX: 9, 
      sliceY: 1, 
      anims: {
        idle: {
          from: 0,
          to: 8,
          speed: 8,
          loop: true
        }
      }
    });

    this.k.loadSprite(`${characterName}_hair`, hairPath, {
      sliceX: 9, 
      sliceY: 1, 
      anims: {
        idle: {
          from: 0,
          to: 8,
          speed: 8,
          loop: true
        }
      }
    });
  }
}

export { AssetLoader };
