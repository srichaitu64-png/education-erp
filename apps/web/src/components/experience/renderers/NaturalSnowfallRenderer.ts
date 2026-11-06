/**
 * Peaceful Snowfall Canvas Particle Renderer
 * Delicate snowflakes with horizontal sinusoidal sway, organic rotation, and multi-depth rendering.
 */

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  swaySpeed: number;
  swayAmount: number;
  swayPhase: number;
  rotation: number;
  rotationSpeed: number;
  alpha: number;
  depth: number;
}

export class NaturalSnowfallRenderer {
  private flakes: Snowflake[] = [];
  private width: number = 0;
  private height: number = 0;

  constructor() {}

  public init(width: number, height: number, count: number): void {
    this.width = width;
    this.height = height;
    this.flakes = [];
    for (let i = 0; i < count; i++) {
      this.flakes.push(this.createFlake(true));
    }
  }

  public setDimensions(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  public updateCount(targetCount: number): void {
    while (this.flakes.length < targetCount) {
      this.flakes.push(this.createFlake(false));
    }
    if (this.flakes.length > targetCount) {
      this.flakes.splice(targetCount);
    }
  }

  private createFlake(scatterVertical: boolean): Snowflake {
    const depth = 0.4 + Math.random() * 0.6;
    return {
      x: Math.random() * this.width,
      y: scatterVertical ? Math.random() * this.height : -10 - Math.random() * 20,
      radius: (2 + Math.random() * 3.5) * depth,
      speedY: (0.6 + Math.random() * 1.1) * depth,
      swaySpeed: 0.015 + Math.random() * 0.02,
      swayAmount: 0.8 + Math.random() * 1.5,
      swayPhase: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      alpha: (0.35 + Math.random() * 0.45) * depth,
      depth,
    };
  }

  public render(ctx: CanvasRenderingContext2D, dt: number): void {
    for (let i = 0; i < this.flakes.length; i++) {
      const f = this.flakes[i];
      f.swayPhase += f.swaySpeed;
      f.rotation += f.rotationSpeed;
      f.y += f.speedY;
      f.x += Math.sin(f.swayPhase) * f.swayAmount;

      // Wrap around sides or bottom
      if (f.y > this.height + 10) {
        this.flakes[i] = this.createFlake(false);
        continue;
      }
      if (f.x < -10) f.x = this.width + 5;
      if (f.x > this.width + 10) f.x = -5;

      // Draw soft snowflake
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rotation);

      // Radial glow
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, f.radius * 1.5);
      grad.addColorStop(0, `rgba(255, 255, 255, ${f.alpha})`);
      grad.addColorStop(0.6, `rgba(240, 248, 255, ${f.alpha * 0.7})`);
      grad.addColorStop(1, `rgba(230, 245, 255, 0)`);

      ctx.beginPath();
      ctx.arc(0, 0, f.radius * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Sharp central crystal core
      ctx.beginPath();
      ctx.arc(0, 0, f.radius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${f.alpha * 0.9})`;
      ctx.fill();

      ctx.restore();
    }
  }
}

