export const ANIMATIONS = {
  IDLE: "idle",
  WALK: "walk",
  ATTACK: "attack",
  AXE: "axe",
  DIG: "dig",
  HAMMERING: "hammering",
  JUMP: "jump",
  MINING: "mining",
  REELING: "reeling",
  WATERING: "watering"
}

export const GAME_CONFIG = {
  // Canvas settings
  CANVAS_WIDTH: 1080,
  CANVAS_HEIGHT: 600,
  BACKGROUND_COLOR: [135, 206, 235],

  // Map settings
  MAP_WIDTH: 592,
  MAP_HEIGHT: 432,
  MAP_SCALE: 3,

  // Player settings
  MOVE_SPEED: 200,
  PLAYER_SCALE: 3,
  
  // Collision settings
  COLLISION_WIDTH: 12,
  COLLISION_HEIGHT: 16,
  COLLISION_OFFSET: { x: -5, y: 0 },

  // Asset paths
  ASSETS: {
    MAP_BACKGROUND: "/assets/Sunnyside/Maps/map_empty.png",
    
    // IDLE animations
    IDLE_BASE: "/assets/Sunnyside/Characters/Human/IDLE/base_idle_strip9.png",
    IDLE_SHORT_HAIR: "/assets/Sunnyside/Characters/Human/IDLE/shorthair_idle_strip9.png",
    IDLE_SPIKY_HAIR: "/assets/Sunnyside/Characters/Human/IDLE/spikeyhair_idle_strip9.png",
    IDLE_LONG_HAIR: "/assets/Sunnyside/Characters/Human/IDLE/longhair_idle_strip9.png",
    IDLE_CURLY_HAIR: "/assets/Sunnyside/Characters/Human/IDLE/curlyhair_idle_strip9.png",
    IDLE_MOP_HAIR: "/assets/Sunnyside/Characters/Human/IDLE/mophair_idle_strip9.png",
    
    // WALKING animations
    WALK_BASE: "/assets/Sunnyside/Characters/Human/WALKING/base_walk_strip8.png",
    WALK_SHORT_HAIR: "/assets/Sunnyside/Characters/Human/WALKING/shorthair_walk_strip8.png",
    WALK_SPIKY_HAIR: "/assets/Sunnyside/Characters/Human/WALKING/spikeyhair_walk_strip8.png",
    WALK_LONG_HAIR: "/assets/Sunnyside/Characters/Human/WALKING/longhair_walk_strip8.png",
    WALK_CURLY_HAIR: "/assets/Sunnyside/Characters/Human/WALKING/curlyhair_walk_strip8.png",
    WALK_MOP_HAIR: "/assets/Sunnyside/Characters/Human/WALKING/mophair_walk_strip8.png",
    
    // ATTACK animations
    ATTACK_BASE: "/assets/Sunnyside/Characters/Human/ATTACK/base_attack_strip10.png",
    ATTACK_SHORT_HAIR: "/assets/Sunnyside/Characters/Human/ATTACK/shorthair_attack_strip10.png",
    ATTACK_SPIKY_HAIR: "/assets/Sunnyside/Characters/Human/ATTACK/spikeyhair_attack_strip10.png",
    ATTACK_LONG_HAIR: "/assets/Sunnyside/Characters/Human/ATTACK/longhair_attack_strip10.png",
    ATTACK_CURLY_HAIR: "/assets/Sunnyside/Characters/Human/ATTACK/curlyhair_attack_strip10.png",
    ATTACK_MOP_HAIR: "/assets/Sunnyside/Characters/Human/ATTACK/mophair_attack_strip10.png",
    
    // AXE animations
    AXE_BASE: "/assets/Sunnyside/Characters/Human/AXE/base_axe_strip10.png",
    AXE_SHORT_HAIR: "/assets/Sunnyside/Characters/Human/AXE/shorthair_axe_strip10.png",
    AXE_SPIKY_HAIR: "/assets/Sunnyside/Characters/Human/AXE/spikeyhair_axe_strip10.png",
    AXE_LONG_HAIR: "/assets/Sunnyside/Characters/Human/AXE/longhair_axe_strip10.png",
    AXE_CURLY_HAIR: "/assets/Sunnyside/Characters/Human/AXE/curlyhair_axe_strip10.png",
    AXE_MOP_HAIR: "/assets/Sunnyside/Characters/Human/AXE/mophair_axe_strip10.png",
    
    // DIG animations
    DIG_BASE: "/assets/Sunnyside/Characters/Human/DIG/base_dig_strip13.png",
    DIG_SHORT_HAIR: "/assets/Sunnyside/Characters/Human/DIG/shorthair_dig_strip13.png",
    DIG_SPIKY_HAIR: "/assets/Sunnyside/Characters/Human/DIG/spikeyhair_dig_strip13.png",
    DIG_LONG_HAIR: "/assets/Sunnyside/Characters/Human/DIG/longhair_dig_strip13.png",
    DIG_CURLY_HAIR: "/assets/Sunnyside/Characters/Human/DIG/curlyhair_dig_strip13.png",
    DIG_MOP_HAIR: "/assets/Sunnyside/Characters/Human/DIG/mophair_dig_strip13.png",
    
    // HAMMERING animations
    HAMMERING_BASE: "/assets/Sunnyside/Characters/Human/HAMMERING/base_hamering_strip23.png",
    HAMMERING_SHORT_HAIR: "/assets/Sunnyside/Characters/Human/HAMMERING/shorthair_hamering_strip23.png",
    HAMMERING_SPIKY_HAIR: "/assets/Sunnyside/Characters/Human/HAMMERING/spikeyhair_hamering_strip23.png",
    HAMMERING_LONG_HAIR: "/assets/Sunnyside/Characters/Human/HAMMERING/longhair_hamering_strip23.png",
    HAMMERING_CURLY_HAIR: "/assets/Sunnyside/Characters/Human/HAMMERING/curlyhair_hamering_strip23.png",
    HAMMERING_MOP_HAIR: "/assets/Sunnyside/Characters/Human/HAMMERING/mophair_hamering_strip23.png",
    
    // JUMP animations
    JUMP_BASE: "/assets/Sunnyside/Characters/Human/JUMP/base_jump_strip9.png",
    JUMP_SHORT_HAIR: "/assets/Sunnyside/Characters/Human/JUMP/shorthair_jump_strip9.png",
    JUMP_SPIKY_HAIR: "/assets/Sunnyside/Characters/Human/JUMP/spikeyhair_jump_strip9.png",
    JUMP_LONG_HAIR: "/assets/Sunnyside/Characters/Human/JUMP/longhair_jump_strip9.png",
    JUMP_CURLY_HAIR: "/assets/Sunnyside/Characters/Human/JUMP/curlyhair_jump_strip9.png",
    JUMP_MOP_HAIR: "/assets/Sunnyside/Characters/Human/JUMP/mophair_jump_strip9.png",
    
    // MINING animations
    MINING_BASE: "/assets/Sunnyside/Characters/Human/MINING/base_mining_strip10.png",
    MINING_SHORT_HAIR: "/assets/Sunnyside/Characters/Human/MINING/shorthair_mining_strip10.png",
    MINING_SPIKY_HAIR: "/assets/Sunnyside/Characters/Human/MINING/spikeyhair_mining_strip10.png",
    MINING_LONG_HAIR: "/assets/Sunnyside/Characters/Human/MINING/longhair_mining_strip10.png",
    MINING_CURLY_HAIR: "/assets/Sunnyside/Characters/Human/MINING/curlyhair_mining_strip10.png",
    MINING_MOP_HAIR: "/assets/Sunnyside/Characters/Human/MINING/mophair_mining_strip10.png",
    
    // REELING animations
    REELING_BASE: "/assets/Sunnyside/Characters/Human/REELING/base_reeling_strip13.png",
    REELING_SHORT_HAIR: "/assets/Sunnyside/Characters/Human/REELING/shorthair_reeling_strip13.png",
    REELING_SPIKY_HAIR: "/assets/Sunnyside/Characters/Human/REELING/spikeyhair_reeling_strip13.png",
    REELING_LONG_HAIR: "/assets/Sunnyside/Characters/Human/REELING/longhair_reeling_strip13.png",
    REELING_CURLY_HAIR: "/assets/Sunnyside/Characters/Human/REELING/curlyhair_reeling_strip13.png",
    REELING_MOP_HAIR: "/assets/Sunnyside/Characters/Human/REELING/mophair_reeling_strip13.png",
    
    // WATERING animations
    WATERING_BASE: "/assets/Sunnyside/Characters/Human/WATERING/base_watering_strip5.png",
    WATERING_SHORT_HAIR: "/assets/Sunnyside/Characters/Human/WATERING/shorthair_watering_strip5.png",
    WATERING_SPIKY_HAIR: "/assets/Sunnyside/Characters/Human/WATERING/spikeyhair_watering_strip5.png",
    WATERING_LONG_HAIR: "/assets/Sunnyside/Characters/Human/WATERING/longhair_watering_strip5.png",
    WATERING_CURLY_HAIR: "/assets/Sunnyside/Characters/Human/WATERING/curlyhair_watering_strip5.png",
    WATERING_MOP_HAIR: "/assets/Sunnyside/Characters/Human/WATERING/mophair_watering_strip5.png",
  }
};

export const SCALED_MAP_WIDTH = GAME_CONFIG.MAP_WIDTH * GAME_CONFIG.MAP_SCALE - 330;
export const SCALED_MAP_HEIGHT = GAME_CONFIG.MAP_HEIGHT * GAME_CONFIG.MAP_SCALE - 360;
