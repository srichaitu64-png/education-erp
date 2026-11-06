/**
 * Floating Flower Petals Canvas Particle Renderer
 * Realistic cherry blossom & rose petals with 3D wind tumbling, rotation, and soft natural drift.
 */

interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  flip: number;
  flipSpeed: number;
  alpha: number;
  colorType: 'cherry' | 'rose' | 'peach';
  depth: number;
}

export class FloatingFlowerPetalsRenderer {
  private petals: Petal[] = [];
  private width: number = 0;
  private height: number = 0;
  private time: number = 0;

  constructor() {}

  public init(width: number, height: number, count: number): void {
    this.width = width;
    this.height = height;
    this.petals = [];
    for (let i = 0; i < count; i++) {
      this.petals.push(this.createPetal(true));
    }
  }

  public setDimensions(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  public updateCount(targetCount: number): void {
    while (this.petals.length < targetCount) {
      this.petals.push(this.createPetal(false));
    }
    if (this.petals.length > targetCount) {
      this.petals.splice(targetCount);
    }
  }

  private createPetal(scatterVertical: boolean): Petal {
    const depth = 0.5 + Math.random() * 0.5;
    const colors: ('cherry' | 'rose' | 'peach')[] = ['cherry', 'rose', 'peach'];
    return {
      x: Math.random() * (this.width + 100) - 50,
      y: scatterVertical ? Math.random() * this.height : -20 - Math.random() * 30,
      size: (12 + Math.random() * 10) * depth,
      speedY: (0.7 + Math.random() * 1.2) * depth,
      speedX: 0.5 + Math.random() * 0.8,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.03,
      flip: Math.random() * Math.PI * 2,
      flipSpeed: 0.03 + Math.random() * 0.04,
      alpha: (0.55 + Math.random() * 0.35) * depth,
      colorType: colors[Math.floor(Math.random() * colors.length)],
      depth,
    };
  }

  public render(ctx: CanvasRenderingContext2D, dt: number): void {
    this.time += dt * 0.001;

    for (let i = 0; i < this.petals.length; i++) {
      const p = this.petals[i];
      p.flip += p.flipSpeed;
      p.rotation += p.rotationSpeed;
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(this.time + p.flip) * 0.5;

      if (p.y > this.height + 20 || p.x > this.width + 50) {
        this.petals[i] = this.createPetal(false);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      // 3D tumble simulation via cosine scaling
      const scaleX = Math.cos(p.flip);
      ctx.scale(scaleX, 1);

      // Choose soft organic petal tones
      let fillCol1 = 'rgba(255, 192, 203, ';
      let fillCol2 = 'rgba(255, 140, 165, ';
      if (p.colorType === 'rose') {
        fillCol1 = 'rgba(254, 205, 211, ';
        fillCol2 = 'rgba(244, 63, 94, ';
      } else if (p.colorType === 'peach') {
        fillCol1 = 'rgba(254, 215, 170, ';
        fillCol2 = 'rgba(251, 146, 60, ';
      }

      // Draw petal shape using bezier curves
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 0.8);
      ctx.bezierCurveTo(p.size * 0.6, -p.size * 0.4, p.size * 0.5, p.size * 0.6, 0, p.size * 0.8);
      ctx.bezierCurveTo(-p.size * 0.5, p.size * 0.6, -p.size * 0.6, -p.size * 0.4, 0, -p.size * 0.8);

      const grad = ctx.createLinearGradient(0, -p.size * 0.8, 0, p.size * 0.8);
      grad.addColorStop(0, fillCol1 + `${p.alpha * 0.9})`);
      grad.addColorStop(1, fillCol2 + `${p.alpha * 0.6})`);

      ctx.fillStyle = grad;
      ctx.fill();

      // Subtle delicate vein line
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 0.5);
      ctx.lineTo(0, p.size * 0.5);
      ctx.strokeStyle = `rgba(255, 255, 255, ${p.alpha * 0.4})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.restore();
    }
  }
}

