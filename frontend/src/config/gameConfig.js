export const GAME_CONFIG = {
  // Canvas settings
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  BACKGROUND_COLOR: [135, 206, 235],

  // Map settings
  MAP_WIDTH: 720,
  MAP_HEIGHT: 560,
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
    MAP_BACKGROUND: "/assets/Sunnyside/Maps/map.png",
    PLAYER_IDLE_BASE: "/assets/Sunnyside/Characters/Human/IDLE/base_idle_strip9.png",
    PLAYER_IDLE_SHORT_HAIR: "/assets/Sunnyside/Characters/Human/IDLE/shorthair_idle_strip9.png"
  }
};

export const SCALED_MAP_WIDTH = GAME_CONFIG.MAP_WIDTH * GAME_CONFIG.MAP_SCALE;
export const SCALED_MAP_HEIGHT = GAME_CONFIG.MAP_HEIGHT * GAME_CONFIG.MAP_SCALE;
