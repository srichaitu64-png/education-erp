/**
 * Floating Leaves Canvas Particle Renderer
 * Warm autumn leaves gently tumbling, rocking, and drifting on ambient air currents.
 */

interface Leaf {
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
  color: string;
}

export class FloatingLeavesRenderer {
  private leaves: Leaf[] = [];
  private width: number = 0;
  private height: number = 0;
  private time: number = 0;

  constructor() {}

  public init(width: number, height: number, count: number): void {
    this.width = width;
    this.height = height;
    this.leaves = [];
    for (let i = 0; i < count; i++) {
      this.leaves.push(this.createLeaf(true));
    }
  }

  public setDimensions(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  public updateCount(targetCount: number): void {
    while (this.leaves.length < targetCount) {
      this.leaves.push(this.createLeaf(false));
    }
    if (this.leaves.length > targetCount) {
      this.leaves.splice(targetCount);
    }
  }

  private createLeaf(scatterVertical: boolean): Leaf {
    const colors = ['#F59E0B', '#D97706', '#EA580C', '#10B981', '#84CC16'];
    return {
      x: Math.random() * (this.width + 100) - 50,
      y: scatterVertical ? Math.random() * this.height : -20 - Math.random() * 30,
      size: 10 + Math.random() * 8,
      speedY: 0.8 + Math.random() * 1.0,
      speedX: 0.4 + Math.random() * 0.7,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.03,
      flip: Math.random() * Math.PI * 2,
      flipSpeed: 0.02 + Math.random() * 0.03,
      alpha: 0.45 + Math.random() * 0.35,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  }

  public render(ctx: CanvasRenderingContext2D, dt: number): void {
    this.time += dt * 0.001;

    for (let i = 0; i < this.leaves.length; i++) {
      const l = this.leaves[i];
      l.flip += l.flipSpeed;
      l.rotation += l.rotationSpeed;
      l.y += l.speedY;
      l.x += l.speedX + Math.sin(this.time + l.flip) * 0.6;

      if (l.y > this.height + 20 || l.x > this.width + 50) {
        this.leaves[i] = this.createLeaf(false);
        continue;
      }

      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.rotation);
      ctx.scale(Math.cos(l.flip), 1);

      ctx.beginPath();
      ctx.moveTo(0, -l.size);
      ctx.quadraticCurveTo(l.size * 0.6, 0, 0, l.size);
      ctx.quadraticCurveTo(-l.size * 0.6, 0, 0, -l.size);
      ctx.fillStyle = l.color;
      ctx.globalAlpha = l.alpha;
      ctx.fill();

      // Stem line
      ctx.beginPath();
      ctx.moveTo(0, -l.size * 0.8);
      ctx.lineTo(0, l.size * 0.9);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.restore();
    }
  }
}

