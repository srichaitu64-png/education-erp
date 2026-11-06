/**
 * Natural Gentle Rain Canvas Particle Renderer
 * Delicate, transparent raindrops with gentle wind slant and soft ground ripples.
 */

interface RainDrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  thickness: number;
  alpha: number;
  depth: number;
}

interface GroundRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export class NaturalRainRenderer {
  private drops: RainDrop[] = [];
  private ripples: GroundRipple[] = [];
  private width: number = 0;
  private height: number = 0;
  private windAngle: number = 0.15; // Gentle slant (radians)

  constructor() {}

  public init(width: number, height: number, count: number): void {
    this.width = width;
    this.height = height;
    this.drops = [];
    this.ripples = [];
    for (let i = 0; i < count; i++) {
      this.drops.push(this.createDrop(true));
    }
  }

  public setDimensions(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  public updateCount(targetCount: number): void {
    while (this.drops.length < targetCount) {
      this.drops.push(this.createDrop(false));
    }
    if (this.drops.length > targetCount) {
      this.drops.splice(targetCount);
    }
  }

  private createDrop(scatterVertical: boolean): RainDrop {
    const depth = 0.4 + Math.random() * 0.6;
    return {
      x: Math.random() * (this.width + 200) - 100,
      y: scatterVertical ? Math.random() * this.height : -20 - Math.random() * 30,
      length: (14 + Math.random() * 22) * depth,
      speed: (7 + Math.random() * 9) * depth,
      thickness: (0.8 + Math.random() * 0.8) * depth,
      alpha: (0.15 + Math.random() * 0.25) * depth,
      depth,
    };
  }

  public render(ctx: CanvasRenderingContext2D, dt: number): void {
    const slantX = Math.sin(this.windAngle);
    const slantY = Math.cos(this.windAngle);

    // Update and draw raindrops
    for (let i = 0; i < this.drops.length; i++) {
      const drop = this.drops[i];
      drop.x += slantX * drop.speed;
      drop.y += slantY * drop.speed;

      // Draw drop line with gradient
      const endX = drop.x - slantX * drop.length;
      const endY = drop.y - slantY * drop.length;

      const grad = ctx.createLinearGradient(endX, endY, drop.x, drop.y);
      grad.addColorStop(0, `rgba(180, 215, 255, 0)`);
      grad.addColorStop(1, `rgba(195, 225, 255, ${drop.alpha})`);

      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(drop.x, drop.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = drop.thickness;
      ctx.stroke();

      // Hit bottom boundary
      if (drop.y > this.height) {
        if (Math.random() < 0.25 && this.ripples.length < 15) {
          this.ripples.push({
            x: drop.x,
            y: this.height - Math.random() * 30,
            radius: 1,
            maxRadius: 10 + Math.random() * 12,
            alpha: 0.25,
          });
        }
        this.drops[i] = this.createDrop(false);
      }
    }

    // Render subtle ground ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += dt * 0.03;
      r.alpha -= dt * 0.0006;

      if (r.alpha <= 0 || r.radius >= r.maxRadius) {
        this.ripples.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, r.radius * 2, r.radius * 0.5, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(200, 230, 255, ${r.alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }
  }
}

