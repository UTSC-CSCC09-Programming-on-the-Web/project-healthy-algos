class CameraSystem {
  constructor(kaplayContext) {
    this.k = kaplayContext;
    this.targetSprite = null;
    this.smoothing = 1; // 1 means no smoothing, closer to 0 means more smoothing
  }

  setTarget(sprite) {
    this.targetSprite = sprite;
  }

  update() {
    if (!this.targetSprite) return;

    if (this.smoothing === 1) {
      this.k.setCamPos(this.targetSprite.pos);
    } else {
      // Smooth camera following
      const currentPos = this.k.getCamPos();
      const targetPos = this.targetSprite.pos;
      const lerpedPos = currentPos.lerp(targetPos, this.smoothing);
      this.k.setCamPos(lerpedPos);
    }
  }

  setSmoothingFactor(factor) {
    this.smoothing = Math.max(0, Math.min(1, factor));
  }

  getPosition() {
    return this.k.getCamPos();
  }

  setPosition(x, y) {
    this.k.setCamPos(this.k.vec2(x, y));
  }
}

export { CameraSystem };
