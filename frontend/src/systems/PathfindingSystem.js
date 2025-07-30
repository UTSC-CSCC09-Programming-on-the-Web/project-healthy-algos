
// PathfindingSystem: returns coordinates of the nearest object of a given type, with x offset and y centered
export class PathfindingSystem {
  constructor() {
    this.worldObjects = {
      trees: [],
      rocks: [],
      houses: [],
      plants: []
    };
  }

  // Call this to set the world objects
  setWorldObjects(worldObjects) {
    this.worldObjects = {
      trees: worldObjects.trees || [],
      rocks: worldObjects.rocks || [],
      houses: worldObjects.houses || [],
      plants: worldObjects.plants || []
    };
  }

  // Main API: returns {x, y} of nearest object of type, with x offset, or null if not found
  findNearestObjectCoordinates(objectType, fromPosition, subType = null) {
    const arr = this._getArray(objectType);
    if (!arr || arr.length === 0) return null;

    let nearest = null;
    let minDist = Infinity;
    for (const obj of arr) {
      if (subType && !this._matchesSubType(obj, objectType, subType)) continue;
      const pos = this._getObjectPos(obj, objectType);
      const dist = this._distance(fromPosition, pos);
      if (dist < minDist) {
        minDist = dist;
        nearest = pos;
      }
    }
    if (!nearest) return null;
    // Offset x, keep y centered
    const xOffset = 40 * (Math.random() > 0.5 ? 1 : -1);
    return { x: nearest.x + xOffset, y: nearest.y };
  }

  // Helpers
  _getArray(type) {
    const t = type.toLowerCase();
    if (t.startsWith('tree')) return this.worldObjects.trees;
    if (t.startsWith('rock')) return this.worldObjects.rocks;
    if (t.startsWith('house')) return this.worldObjects.houses;
    if (t.startsWith('plant') || t.startsWith('crop')) return this.worldObjects.plants;
    return null;
  }
  _getObjectPos(obj, type) {
    // Plants: {x, y}, others: .pos
    if (type.toLowerCase().startsWith('plant') || type.toLowerCase().startsWith('crop')) {
      return { x: obj.x, y: obj.y };
    } else {
      return { x: obj.pos.x, y: obj.pos.y };
    }
  }
  _distance(a, b) {
    const dx = a.x - b.x, dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  _matchesSubType(obj, type, subType) {
    const s = subType.toLowerCase();
    if (type.toLowerCase().startsWith('tree')) return obj.sprite?.toLowerCase().includes(s);
    if (type.toLowerCase().startsWith('rock')) return obj.sprite?.toLowerCase().includes(s);
    if (type.toLowerCase().startsWith('house')) return obj.sprite?.toLowerCase().includes(s);
    if (type.toLowerCase().startsWith('plant') || type.toLowerCase().startsWith('crop')) return obj.type?.toLowerCase().includes(s);
    return false;
  }
}

// Singleton instance
export const pathfindingSystem = new PathfindingSystem();
