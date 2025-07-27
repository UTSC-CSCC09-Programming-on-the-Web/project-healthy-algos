import { GAME_CONFIG } from '../config/gameConfig';

class AssetLoader {
  constructor(kaplayContext) {
    this.k = kaplayContext;
  }

  loadAllAssets() {
    this.k.loadSprite("map_background", GAME_CONFIG.ASSETS.MAP_BACKGROUND);
    this.loadCharacterAnimations();
    this.loadToolSprites();
  }

  loadToolSprites() {
    const toolSpeed = 8; // for synchronization with character animations
    
    this.k.loadSprite("tool_attack", GAME_CONFIG.ASSETS.TOOL_ATTACK, {
      sliceX: 10,
      anims: {
        attack: { from: 0, to: 9, speed: toolSpeed, loop: true }
      }
    });
    
    this.k.loadSprite("tool_axe", GAME_CONFIG.ASSETS.TOOL_AXE, {
      sliceX: 10,
      anims: {
        axe: { from: 0, to: 9, speed: toolSpeed, loop: true }
      }
    });
    
    this.k.loadSprite("tool_dig", GAME_CONFIG.ASSETS.TOOL_DIG, {
      sliceX: 13,
      anims: {
        dig: { from: 0, to: 12, speed: toolSpeed, loop: true }
      }
    });
    
    this.k.loadSprite("tool_hammering", GAME_CONFIG.ASSETS.TOOL_HAMMERING, {
      sliceX: 23,
      anims: {
        hammering: { from: 0, to: 22, speed: toolSpeed, loop: true }
      }
    });
    
    this.k.loadSprite("tool_mining", GAME_CONFIG.ASSETS.TOOL_MINING, {
      sliceX: 10,
      anims: {
        mining: { from: 0, to: 9, speed: toolSpeed, loop: true }
      }
    });
    
    this.k.loadSprite("tool_reeling", GAME_CONFIG.ASSETS.TOOL_REELING, {
      sliceX: 13,
      anims: {
        reeling: { from: 0, to: 12, speed: toolSpeed, loop: true }
      }
    });
    
    this.k.loadSprite("tool_watering", GAME_CONFIG.ASSETS.TOOL_WATERING, {
      sliceX: 5,
      anims: {
        watering: { from: 0, to: 4, speed: toolSpeed, loop: true }
      }
    });
  }

  loadCharacterAnimations() {
    const hairTypes = {
      'base': 'BASE',
      'short_hair': 'SHORT_HAIR', 
      'spiky_hair': 'SPIKY_HAIR',
      'long_hair': 'LONG_HAIR',
      'curly_hair': 'CURLY_HAIR',
      'mop_hair': 'MOP_HAIR'
    };

    // Define animation types with their frame configurations
    const animationConfigs = {
      'idle': { frames: 9, speed: 8, from: 0, to: 8 },
      'walk': { frames: 8, speed: 12, from: 0, to: 7 },
      'attack': { frames: 10, speed: 10, from: 0, to: 9 },
      'axe': { frames: 10, speed: 10, from: 0, to: 9 },
      'dig': { frames: 13, speed: 8, from: 0, to: 12 },
      'hammering': { frames: 23, speed: 12, from: 0, to: 22 },
      'jump': { frames: 9, speed: 15, from: 0, to: 8 },
      'mining': { frames: 10, speed: 10, from: 0, to: 9 },
      'reeling': { frames: 13, speed: 8, from: 0, to: 12 },
      'watering': { frames: 5, speed: 8, from: 0, to: 4 }
    };

    // Load all combinations of animations and hair types
    Object.entries(animationConfigs).forEach(([animType, config]) => {
      Object.entries(hairTypes).forEach(([hairKey, hairAssetKey]) => {
        const assetKey = `${animType.toUpperCase()}_${hairAssetKey}`;
        const spriteKey = `player_${animType}_${hairKey}`;
        
        if (GAME_CONFIG.ASSETS[assetKey]) {
          this.k.loadSprite(spriteKey, GAME_CONFIG.ASSETS[assetKey], {
            sliceX: config.frames,
            sliceY: 1,
            anims: {
              [animType]: {
                from: config.from,
                to: config.to,
                speed: config.speed,
                loop: animType === 'idle' || animType === 'walk' // Only loop idle and walk
              }
            }
          });
        }
      });
    });
    this.loadAgentSpecificSprites();
  }

  loadAgentSpecificSprites() {
    const agentConfigs = [
      { agent: 'a', hair: 'spiky_hair' },
      { agent: 'b', hair: 'long_hair' },
      { agent: 'c', hair: 'curly_hair' },
      { agent: 'd', hair: 'mop_hair' }
    ];

    const animationConfigs = {
      'idle': { frames: 9, speed: 8, from: 0, to: 8 },
      'walk': { frames: 8, speed: 12, from: 0, to: 7 }
    };

    agentConfigs.forEach(({ agent, hair }) => {
      Object.entries(animationConfigs).forEach(([animType, config]) => {
        const hairAssetKey = hair.toUpperCase().replace('_', '_');
        const assetKey = `${animType.toUpperCase()}_${hairAssetKey}`;
        const spriteKey = `agent_${agent}_${animType}_${hair}`;
        
        if (GAME_CONFIG.ASSETS[assetKey]) {
          this.k.loadSprite(spriteKey, GAME_CONFIG.ASSETS[assetKey], {
            sliceX: config.frames,
            sliceY: 1,
            anims: {
              [animType]: {
                from: config.from,
                to: config.to,
                speed: config.speed,
                loop: true
              }
            }
          });
        }
      });
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
