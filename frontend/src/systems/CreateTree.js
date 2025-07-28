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
