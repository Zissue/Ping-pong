// scoreAnimation.js
export class ScoreAnimation {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.opacity = 1;
    this.size = 30;
  }

  update() {
    this.y -= 0.5;
    this.opacity -= 0.02;
  }

  draw(ctx) {
    ctx.font = `${this.size}px Arial`;
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.fillText("+1", this.x, this.y);
  }
}
