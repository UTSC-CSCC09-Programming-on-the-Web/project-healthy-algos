import { GAME_CONFIG, SCALED_MAP_WIDTH, SCALED_MAP_HEIGHT } from '../config/gameConfig';

export function createTree(k, x, y, type = "oak") {
  const spriteName = type === "pine" ? "pine_tree" : "oak_tree";

  const tree = k.add([
    k.sprite(spriteName, { frame: 0 }),
    k.pos(x, y),
    k.anchor("center"),
    k.scale(GAME_CONFIG.PLAYER_SCALE),
    k.z(y),
    "tree"
  ]);

  const scale = GAME_CONFIG.PLAYER_SCALE;
  const collider = {
    x: x - 12 * scale,
    y: y + 3 * scale,
    width: 24 * scale,
    height: 16 * scale,
  };

  if (type === "pine") {
    collider.x = x - 10 * scale;
    collider.y = y + 8 * scale;
    collider.width = 20 * scale;
    collider.height = 12 * scale;
  }

  tree.collider = collider;

  return tree;
}

export function createHouse(k, x, y, type = "house_1") {
  const house = k.add([
    k.sprite(type), 
    k.pos(x, y),
    k.anchor("center"),
    k.scale(GAME_CONFIG.PLAYER_SCALE),
    k.z(y),
    "house"
  ]);

  const scale = GAME_CONFIG.PLAYER_SCALE;

  house.collider = {
    x: x - 17 * scale,
    y: y + 7 * scale,
    width: 34 * scale,
    height: 26 * scale,
  };

  return house;
}

export function createRock(k, x, y, type = "rock_1") {
  const rock = k.add([
    k.sprite(type),
    k.pos(x, y),
    k.anchor("center"),
    k.scale(GAME_CONFIG.PLAYER_SCALE),
    k.z(y),
    "rock"
  ]);

  const scale = GAME_CONFIG.PLAYER_SCALE;
  
  rock.collider = {
    x: x - 8 * scale,
    y: y + 4 * scale,
    width: 16 * scale,
    height: 8 * scale,
  };

  if (type === "rock_1" || type === "rock_2") {
    rock.collider.x = x - 8 * scale;
    rock.collider.y = y - 2 * scale;
    rock.collider.width = 16 * scale;
    rock.collider.height = 8 * scale;
  }

  return rock;
}
