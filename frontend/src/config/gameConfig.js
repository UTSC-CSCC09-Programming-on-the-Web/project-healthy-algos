export const ANIMATIONS = {
  IDLE: "idle",
  WALK: "walk",
  // More to come
}

export const GAME_CONFIG = {
  // Canvas settings
  CANVAS_WIDTH: 1080,
  CANVAS_HEIGHT: 600,
  BACKGROUND_COLOR: [135, 206, 235],

  // Map settings
  MAP_WIDTH: 848,
  MAP_HEIGHT: 688,
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
    MAP_BACKGROUND: "/assets/Sunnyside/Maps/map_hole.png",
    MAP_MASK: "/assets/Sunnyside/Maps/map_mask.png",
    WALK_BASE: "/assets/Sunnyside/Characters/Human/WALKING/base_walk_strip8.png",
    IDLE_BASE: "/assets/Sunnyside/Characters/Human/IDLE/base_idle_strip9.png",
    IDLE_SHORT_HAIR: "/assets/Sunnyside/Characters/Human/IDLE/shorthair_idle_strip9.png",
    WALK_SHORT_HAIR: "/assets/Sunnyside/Characters/Human/WALKING/shorthair_walk_strip8.png",
    WALK_SPIKY_HAIR: "/assets/Sunnyside/Characters/Human/WALKING/spikyhair_walk_strip8.png",
    IDLE_SPIKY_HAIR: "/assets/Sunnyside/Characters/Human/IDLE/spikyhair_idle_strip9.png",
    WALK_LONG_HAIR: "/assets/Sunnyside/Characters/Human/WALKING/longhair_walk_strip8.png",
    IDLE_LONG_HAIR: "/assets/Sunnyside/Characters/Human/IDLE/longhair_idle_strip9.png",
    WALK_CURLY_HAIR: "/assets/Sunnyside/Characters/Human/WALKING/curlyhair_walk_strip8.png",
    IDLE_CURLY_HAIR: "/assets/Sunnyside/Characters/Human/IDLE/curlyhair_idle_strip9.png",
    WALK_MOP_HAIR: "/assets/Sunnyside/Characters/Human/WALKING/mophair_walk_strip8.png",
    IDLE_MOP_HAIR: "/assets/Sunnyside/Characters/Human/IDLE/mophair_idle_strip9.png",
    OAK_TREE: "/assets/Sunnyside/Elements/Plants/spr_deco_tree_01_strip4.png",
    PINE_TREE: "/assets/Sunnyside/Elements/Plants/spr_deco_tree_02_strip4.png",
  }
};

export const SCALED_MAP_WIDTH = GAME_CONFIG.MAP_WIDTH * GAME_CONFIG.MAP_SCALE - 330;
export const SCALED_MAP_HEIGHT = GAME_CONFIG.MAP_HEIGHT * GAME_CONFIG.MAP_SCALE - 360;
