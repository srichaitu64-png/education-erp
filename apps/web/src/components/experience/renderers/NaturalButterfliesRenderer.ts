/**
 * Gentle Butterflies Canvas Particle Renderer
 * Delicate fluttering butterflies gliding along smooth flight paths with wing flap oscillation.
 */

interface Butterfly {
  x: number;
  y: number;
  size: number;
  speed: number;
  heading: number;
  flapPhase: number;
  flapSpeed: number;
  alpha: number;
  color1: string;
  color2: string;
}

export class NaturalButterfliesRenderer {
  private butterflies: Butterfly[] = [];
  private width: number = 0;
  private height: number = 0;

  constructor() {}

  public init(width: number, height: number, count: number): void {
    this.width = width;
    this.height = height;
    this.butterflies = [];
    for (let i = 0; i < count; i++) {
      this.butterflies.push(this.createButterfly(true));
    }
  }

  public setDimensions(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  public updateCount(targetCount: number): void {
    while (this.butterflies.length < targetCount) {
      this.butterflies.push(this.createButterfly(false));
    }
    if (this.butterflies.length > targetCount) {
      this.butterflies.splice(targetCount);
    }
  }

  private createButterfly(scatter: boolean): Butterfly {
    const palette = [
      { c1: '#38BDF8', c2: '#0284C7' }, // Azure blue
      { c1: '#F472B6', c2: '#DB2777' }, // Soft pink
      { c1: '#FBBF24', c2: '#D97706' }, // Amber gold
      { c1: '#A78BFA', c2: '#7C3AED' }, // Violet
    ];
    const picked = palette[Math.floor(Math.random() * palette.length)];

    return {
      x: scatter ? Math.random() * this.width : -30,
      y: Math.random() * this.height,
      size: 7 + Math.random() * 4,
      speed: 1.0 + Math.random() * 0.8,
      heading: (Math.random() - 0.2) * 0.5, // Generally rightward
      flapPhase: Math.random() * Math.PI * 2,
      flapSpeed: 0.14 + Math.random() * 0.08,
      alpha: 0.6 + Math.random() * 0.3,
      color1: picked.c1,
      color2: picked.c2,
    };
  }

  public render(ctx: CanvasRenderingContext2D, dt: number): void {
    for (let i = 0; i < this.butterflies.length; i++) {
      const b = this.butterflies[i];
      b.flapPhase += b.flapSpeed;
      b.heading += (Math.random() - 0.5) * 0.05;

      b.x += Math.cos(b.heading) * b.speed;
      b.y += Math.sin(b.heading) * b.speed;

      if (b.x > this.width + 40 || b.y < -40 || b.y > this.height + 40) {
        this.butterflies[i] = this.createButterfly(false);
        continue;
      }

      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.heading + Math.PI / 2);

      const wingSpan = Math.sin(b.flapPhase); // Wing flap cycle (-1 to 1)

      // Left wing
      ctx.save();
      ctx.scale(Math.abs(wingSpan), 1);
      ctx.beginPath();
      ctx.ellipse(-b.size * 0.8, 0, b.size * 0.8, b.size * 1.2, -0.2, 0, Math.PI * 2);
      ctx.fillStyle = b.color1;
      ctx.globalAlpha = b.alpha;
      ctx.fill();
      ctx.restore();

      // Right wing
      ctx.save();
      ctx.scale(-Math.abs(wingSpan), 1);
      ctx.beginPath();
      ctx.ellipse(-b.size * 0.8, 0, b.size * 0.8, b.size * 1.2, -0.2, 0, Math.PI * 2);
      ctx.fillStyle = b.color2;
      ctx.globalAlpha = b.alpha;
      ctx.fill();
      ctx.restore();

      // Body thorax
      ctx.beginPath();
      ctx.ellipse(0, 0, 1.2, b.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#1E293B';
      ctx.fill();

      ctx.restore();
    }
  }
}

