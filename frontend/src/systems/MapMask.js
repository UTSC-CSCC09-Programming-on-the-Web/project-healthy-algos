class MapMask {
  constructor(imagePath, scale = 1) {
    this.imagePath = imagePath;
    this.scale = scale;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.loaded = false;
  }

  async load() {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = this.imagePath;
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.ctx.drawImage(img, 0, 0);
        this.loaded = true;
        resolve();
      };
      img.onerror = reject;
    });
  }

    isWalkable(x, y) {
    if (!this.loaded) return false;

    const ix = Math.floor(x / this.scale);
    const iy = Math.floor(y / this.scale);

    if (
      ix < 0 || iy < 0 ||
      ix >= this.canvas.width ||
      iy >= this.canvas.height
    ) {
      return false;
    }

    const [r, g, b, a] = this.ctx.getImageData(ix, iy, 1, 1).data;

    const isLand = a > 10;

    return isLand;
  }
}

export { MapMask };
