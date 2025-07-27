import { ACTION_KEYS } from '../config/gameConfig';

class InputSystem {
  constructor(kaplayContext) {
    this.k = kaplayContext;
  }

  getMovementInput() {
    let moveX = 0;
    let moveY = 0;

    if (this.k.isKeyDown("left") || this.k.isKeyDown("a")) moveX -= 1;
    if (this.k.isKeyDown("right") || this.k.isKeyDown("d")) moveX += 1;
    if (this.k.isKeyDown("up") || this.k.isKeyDown("w")) moveY -= 1;
    if (this.k.isKeyDown("down") || this.k.isKeyDown("s")) moveY += 1;

    return { moveX, moveY };
  }
  
  isMoving() {
    const { moveX, moveY } = this.getMovementInput();
    return moveX !== 0 || moveY !== 0;
  }

  getActionKeyPressed() {
    for (const [key, actionData] of Object.entries(ACTION_KEYS)) {
      if (this.k.isKeyPressed(key)) {
        return actionData;
      }
    }
    return null;
  }
}

export { InputSystem };
