import { createTree, createRock, createPlant, createHouse } from './ObjectGenerator';
import { SCALED_MAP_WIDTH, SCALED_MAP_HEIGHT } from '../config/gameConfig';
import { MapMask } from '../systems/MapMask';

const RESERVED_ZONES = [
  { x: 1000, y: 1000, radius: 200 }
];

function getRandomPosition(margin = 64) {
  const x = Math.floor(Math.random() * (SCALED_MAP_WIDTH - margin * 2)) + margin;
  const y = Math.floor(Math.random() * (SCALED_MAP_HEIGHT - margin * 2)) + margin;
  return { x, y };
}

function isPositionFree(x, y, placed, minDist) {
  return (
    placed.every(obj => {
      const dx = obj.x - x;
      const dy = obj.y - y;
      return Math.hypot(dx, dy) >= minDist;
    }) &&
    RESERVED_ZONES.every(zone => {
      const dx = zone.x - x;
      const dy = zone.y - y;
      return Math.hypot(dx, dy) >= zone.radius;
    })
  );
}

function isColliderFullyWalkable(collider, mapMask) {
  const step = 4;
  for (let dx = 0; dx < collider.width; dx += step) {
    for (let dy = 0; dy < collider.height; dy += step) {
      const px = collider.x + dx;
      const py = collider.y + dy;
      if (!mapMask.isWalkable(px, py)) return false;
    }
  }
  return true;
}

export function generateWorldObjects(k, mapMask) {
  const trees = [];
  const rocks = [];
  const houses = [];
  const plants = [];
  const placed = [];

  const rules = {
    trees: { types: ["oak", "pine"], count: 2, minDist: 96 },
    rocks: { types: ["rock_1", "rock_2", "rock_3", "rock_4"], count: 2, minDist: 64 },
    houses: { types: ["house_1", "house_2"], count: 1, minDist: 128 },
    crops: { types: ["radish_04", "pumpkin_04", "sunflower_04", "cauliflower_04"], count: 3, minDist: 64 }
  };

  for (const type of rules.trees.types) {
    for (let i = 0; i < rules.trees.count; i++) {
      let tries = 0;
      let placedTree = null;
      while (tries++ < 100 && !placedTree) {
        const { x, y } = getRandomPosition();
        if(isPositionFree(x, y, placed, rules.trees.minDist)) {
          const tree = createTree(k, x, y, type);
          if (isColliderFullyWalkable(tree.collider, mapMask)) {
            trees.push(tree);
            placed.push({ x, y });
            placedTree = tree;
          } else {
            tree.destroy();
          }
          
        }
      }
    }
  }

  for (const type of rules.rocks.types) {
    for (let i = 0; i < rules.rocks.count; i++) {
      let tries = 0;
      let placedRock = null;
      while (tries++ < 100 && !placedRock) {
        const { x, y } = getRandomPosition();
          if (isPositionFree(x, y, placed, rules.rocks.minDist)) {
              const rock = createRock(k, x, y, type);
              if (isColliderFullyWalkable(rock.collider, mapMask)) {
                  rocks.push(rock);
                  placed.push({ x, y });
                  placedRock = rock;
              } else {
                  rock.destroy(); 
              }
          }
      }
    }
  }

  for (const type of rules.houses.types) {
    for (let i = 0; i < rules.houses.count; i++) {
      let tries = 0;
      let placedHouse = null;
      while (tries++ < 100 && !placedHouse) {
        const { x, y } = getRandomPosition();
        if (isPositionFree(x, y, placed, rules.houses.minDist)) {
          const house = createHouse(k, x, y, type);
          if (isColliderFullyWalkable(house.collider, mapMask)) {
            houses.push(house);
            placed.push({ x, y });
            placedHouse = house;
          } else {
            house.destroy(); 
          }
        }

      }
    }
  }

  for (const type of rules.crops.types) {
    for (let i = 0; i < rules.crops.count; i++) {
      let tries = 0;
      let placedPlant = null;
      while (tries++ < 100 && !placedPlant) {
        const { x, y } = getRandomPosition();
        if (isPositionFree(x, y, placed, rules.crops.minDist) && mapMask.isWalkable(x, y)) {
          const plant = createPlant(k, x, y, type);
          plants.push(plant);
          placed.push({ x, y });
          placedPlant = plant;
        }
      }
    }
  }

  return {
    trees,
    rocks,
    houses,
    plants
  };
}
