/**
 * Underwater Aquatic Bubbles Canvas Particle Renderer
 * Fluid effervescent bubbles rising with aquatic refraction and subtle shimmering.
 */

interface AquaticBubble {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  wobbleX: number;
  wobbleSpeed: number;
  wobblePhase: number;
  alpha: number;
}

export class UnderwaterBubblesRenderer {
  private bubbles: AquaticBubble[] = [];
  private width: number = 0;
  private height: number = 0;

  constructor() {}

  public init(width: number, height: number, count: number): void {
    this.width = width;
    this.height = height;
    this.bubbles = [];
    for (let i = 0; i < count; i++) {
      this.bubbles.push(this.createBubble(true));
    }
  }

  public setDimensions(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  public updateCount(targetCount: number): void {
    while (this.bubbles.length < targetCount) {
      this.bubbles.push(this.createBubble(false));
    }
    if (this.bubbles.length > targetCount) {
      this.bubbles.splice(targetCount);
    }
  }

  private createBubble(scatterVertical: boolean): AquaticBubble {
    return {
      x: Math.random() * this.width,
      y: scatterVertical ? Math.random() * this.height : this.height + 20 + Math.random() * 30,
      radius: 3 + Math.random() * 7,
      speedY: -(0.8 + Math.random() * 1.5),
      wobbleX: 0.5 + Math.random() * 1.5,
      wobbleSpeed: 0.03 + Math.random() * 0.04,
      wobblePhase: Math.random() * Math.PI * 2,
      alpha: 0.25 + Math.random() * 0.35,
    };
  }

  public render(ctx: CanvasRenderingContext2D, dt: number): void {
    for (let i = 0; i < this.bubbles.length; i++) {
      const b = this.bubbles[i];
      b.wobblePhase += b.wobbleSpeed;
      b.y += b.speedY;
      b.x += Math.sin(b.wobblePhase) * b.wobbleX;

      if (b.y < -20) {
        this.bubbles[i] = this.createBubble(false);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);

      const grad = ctx.createRadialGradient(
        b.x - b.radius * 0.3,
        b.y - b.radius * 0.3,
        b.radius * 0.1,
        b.x,
        b.y,
        b.radius
      );
      grad.addColorStop(0, `rgba(255, 255, 255, ${b.alpha * 0.8})`);
      grad.addColorStop(0.5, `rgba(180, 240, 255, ${b.alpha * 0.4})`);
      grad.addColorStop(1, `rgba(140, 215, 255, ${b.alpha * 0.2})`);

      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = `rgba(220, 248, 255, ${b.alpha * 0.7})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.restore();
    }
  }
}

