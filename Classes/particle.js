// particle.js
export class Particle {
  constructor(x, y, angle, xOffset = 0, yOffset = 0) {
    this.x = x + xOffset;
    this.y = y + yOffset;
    this.angle = angle;
    this.speed = 1 * Math.random() + 0.5; // Randomize speed between 0.5 and 1.5
    this.life = 0.15;
    this.size = Math.random() * 2 + 10; // Randomize size between 1 and 3
  }
  
  update() {
    this.x += this.speed * Math.cos(this.angle) * -1;
    this.y += this.speed * Math.sin(this.angle);
    this.life -= 0.01;
  }
  
  draw(ctx) {
    const opacity = Math.min(1, this.life * 6);
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
    gradient.addColorStop(0, `rgba(255, 255, 0, ${opacity})`); // Yellow
    gradient.addColorStop(0.4, `rgba(255, 128, 0, ${opacity})`); // Orange
    gradient.addColorStop(1, `rgba(255, 0, 0, 0)`); // Red, but transparent

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, true);
    ctx.fill();
  }
}