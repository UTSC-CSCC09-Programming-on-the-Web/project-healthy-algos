import { GAME_CONFIG } from '../config/gameConfig';

class AssetLoader {
  constructor(kaplayContext) {
    this.k = kaplayContext;
  }

  loadAllAssets() {
    //Map Assets
    this.k.loadSprite("map_background", GAME_CONFIG.ASSETS.MAP_BACKGROUND);
    this.k.loadSprite("map_mask", GAME_CONFIG.ASSETS.MAP_MASK);
    
    this.k.loadSprite("oak_tree", GAME_CONFIG.ASSETS.OAK_TREE, {
      sliceX: 4,
      slicey: 1,
    });

    this.k.loadSprite("pine_tree", GAME_CONFIG.ASSETS.PINE_TREE, {
      sliceX: 4,
      sliceY: 1,
    });

    // Player Assets
    this.k.loadSprite("player_idle_base", GAME_CONFIG.ASSETS.IDLE_BASE, {
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

    this.k.loadSprite("player_idle_short_hair", GAME_CONFIG.ASSETS.IDLE_SHORT_HAIR, {
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

    this.k.loadSprite("player_walk_base", GAME_CONFIG.ASSETS.WALK_BASE, {
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

    this.k.loadSprite("player_walk_short_hair", GAME_CONFIG.ASSETS.WALK_SHORT_HAIR, {
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

    // Load Agent A sprites (spiky hair)
    this.k.loadSprite("agent_a_idle_spiky_hair", GAME_CONFIG.ASSETS.IDLE_SPIKY_HAIR, {
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

    this.k.loadSprite("agent_a_walk_spiky_hair", GAME_CONFIG.ASSETS.WALK_SPIKY_HAIR, {
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

    // Load Agent B sprites (long hair)
    this.k.loadSprite("agent_b_idle_long_hair", GAME_CONFIG.ASSETS.IDLE_LONG_HAIR, {
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

    this.k.loadSprite("agent_b_walk_long_hair", GAME_CONFIG.ASSETS.WALK_LONG_HAIR, {
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

    // Load Agent C sprites (curly hair)
    this.k.loadSprite("agent_c_idle_curly_hair", GAME_CONFIG.ASSETS.IDLE_CURLY_HAIR, {
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

    this.k.loadSprite("agent_c_walk_curly_hair", GAME_CONFIG.ASSETS.WALK_CURLY_HAIR, {
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

    // Load Agent D sprites (mop hair)
    this.k.loadSprite("agent_d_idle_mop_hair", GAME_CONFIG.ASSETS.IDLE_MOP_HAIR, {
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

    this.k.loadSprite("agent_d_walk_mop_hair", GAME_CONFIG.ASSETS.WALK_MOP_HAIR, {
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
