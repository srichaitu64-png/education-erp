/**
 * Spring Breeze Canvas Particle Renderer
 * Soft atmospheric air currents carrying subtle natural pollen & breeze particles.
 */

interface BreezeParticle {
  x: number;
  y: number;
  length: number;
  speedX: number;
  speedY: number;
  alpha: number;
  thickness: number;
  wobblePhase: number;
  wobbleSpeed: number;
}

export class SpringBreezeRenderer {
  private particles: BreezeParticle[] = [];
  private width: number = 0;
  private height: number = 0;
  private time: number = 0;

  constructor() {}

  public init(width: number, height: number, count: number): void {
    this.width = width;
    this.height = height;
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(true));
    }
  }

  public setDimensions(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  public updateCount(targetCount: number): void {
    while (this.particles.length < targetCount) {
      this.particles.push(this.createParticle(false));
    }
    if (this.particles.length > targetCount) {
      this.particles.splice(targetCount);
    }
  }

  private createParticle(scatterHorizontal: boolean): BreezeParticle {
    return {
      x: scatterHorizontal ? Math.random() * this.width : -40 - Math.random() * 40,
      y: Math.random() * this.height,
      length: 10 + Math.random() * 25,
      speedX: 1.2 + Math.random() * 1.8,
      speedY: (Math.random() - 0.4) * 0.5,
      alpha: 0.2 + Math.random() * 0.35,
      thickness: 0.8 + Math.random() * 1.2,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
    };
  }

  public render(ctx: CanvasRenderingContext2D, dt: number): void {
    this.time += dt * 0.001;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.wobblePhase += p.wobbleSpeed;
      p.x += p.speedX;
      p.y += p.speedY + Math.sin(p.wobblePhase) * 0.4;

      if (p.x > this.width + 50) {
        this.particles[i] = this.createParticle(false);
        continue;
      }

      // Draw gentle air streak with fading head and tail
      const grad = ctx.createLinearGradient(p.x - p.length, p.y, p.x, p.y);
      grad.addColorStop(0, `rgba(200, 240, 230, 0)`);
      grad.addColorStop(0.5, `rgba(180, 235, 220, ${p.alpha * 0.5})`);
      grad.addColorStop(0.9, `rgba(220, 255, 240, ${p.alpha})`);
      grad.addColorStop(1, `rgba(255, 255, 255, ${p.alpha * 0.8})`);

      ctx.beginPath();
      ctx.moveTo(p.x - p.length, p.y);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = p.thickness;
      ctx.stroke();

      // Pollen sparkle at the tip
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.thickness * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 230, ${p.alpha * 0.9})`;
      ctx.fill();
    }
  }
}

