class DirectionSystem {
  static getMovementFromDirection(direction) {
    const speed = 1.0;
    
    const directions = {
      "north": { moveX: 0, moveY: -speed },
      "south": { moveX: 0, moveY: speed },
      "east": { moveX: speed, moveY: 0 },
      "west": { moveX: -speed, moveY: 0 },
      "northeast": { moveX: speed, moveY: -speed },
      "northwest": { moveX: -speed, moveY: -speed },
      "southeast": { moveX: speed, moveY: speed },
      "southwest": { moveX: -speed, moveY: speed }
    };
    
    return directions[direction] || { moveX: 0, moveY: 0 };
  }

  static getDirectionFromMovement(moveX, moveY) {
    if (moveX === 0 && moveY === 0) return "idle";
    
    if (moveX === 0) {
      return moveY < 0 ? "north" : "south";
    }
    if (moveY === 0) {
      return moveX > 0 ? "east" : "west";
    }

    if (moveX > 0) {
      return moveY < 0 ? "northeast" : "southeast";
    } else {
      return moveY < 0 ? "northwest" : "southwest";
    }
  }

  static getAllDirections() {
    return ["north", "south", "east", "west", "northeast", "northwest", "southeast", "southwest"];
  }

  static isValidDirection(direction) {
    return this.getAllDirections().includes(direction);
  }
}

export { DirectionSystem };
