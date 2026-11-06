/**
 * Warm Sunlight Rays & Floating Dust Motes Canvas Particle Renderer
 * Volumetric sunbeams with softly illuminated dust motes floating in ambient light.
 */

interface DustMote {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  alpha: number;
  targetAlpha: number;
  phase: number;
  phaseSpeed: number;
}

export class SunlightParticlesRenderer {
  private motes: DustMote[] = [];
  private width: number = 0;
  private height: number = 0;
  private time: number = 0;
  private mouseX: number = -1000;
  private mouseY: number = -1000;

  constructor() {}

  public init(width: number, height: number, count: number): void {
    this.width = width;
    this.height = height;
    this.motes = [];
    for (let i = 0; i < count; i++) {
      this.motes.push(this.createMote(true));
    }
  }

  public setDimensions(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  public setMouse(x: number, y: number): void {
    this.mouseX = x;
    this.mouseY = y;
  }

  public updateCount(targetCount: number): void {
    while (this.motes.length < targetCount) {
      this.motes.push(this.createMote(false));
    }
    if (this.motes.length > targetCount) {
      this.motes.splice(targetCount);
    }
  }

  private createMote(scatterVertical: boolean): DustMote {
    return {
      x: Math.random() * this.width,
      y: scatterVertical ? Math.random() * this.height : this.height + Math.random() * 20,
      radius: 1.2 + Math.random() * 2.2,
      speedY: -(0.2 + Math.random() * 0.4),
      speedX: (Math.random() - 0.5) * 0.3,
      alpha: 0,
      targetAlpha: 0.3 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.02 + Math.random() * 0.03,
    };
  }

  public render(ctx: CanvasRenderingContext2D, dt: number): void {
    this.time += dt * 0.001;

    // 1. Draw subtle diagonal volumetric sunbeam rays from top-left
    const rayCount = 3;
    ctx.save();
    for (let r = 0; r < rayCount; r++) {
      const rayAngle = 0.42 + Math.sin(this.time * 0.2 + r) * 0.03;
      const startX = (r / rayCount) * (this.width * 0.5);
      const beamWidth = 140 + r * 60;

      const grad = ctx.createLinearGradient(startX, 0, startX + Math.cos(rayAngle) * this.height, this.height);
      const intensity = 0.04 + Math.sin(this.time * 0.5 + r * 1.5) * 0.015;
      grad.addColorStop(0, `rgba(255, 235, 180, ${intensity * 1.5})`);
      grad.addColorStop(0.6, `rgba(255, 220, 140, ${intensity})`);
      grad.addColorStop(1, `rgba(255, 200, 100, 0)`);

      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX + beamWidth, 0);
      ctx.lineTo(startX + beamWidth + Math.tan(rayAngle) * this.height, this.height);
      ctx.lineTo(startX + Math.tan(rayAngle) * this.height, this.height);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    }
    ctx.restore();

    // 2. Draw floating illuminated dust motes
    for (let i = 0; i < this.motes.length; i++) {
      const m = this.motes[i];
      m.phase += m.phaseSpeed;

      if (m.alpha < m.targetAlpha) {
        m.alpha = Math.min(m.targetAlpha, m.alpha + dt * 0.001);
      }

      m.y += m.speedY;
      m.x += m.speedX + Math.sin(m.phase) * 0.3;

      // Mouse gentle repulsion
      if (this.mouseX > 0 && this.mouseY > 0) {
        const dx = m.x - this.mouseX;
        const dy = m.y - this.mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80 && dist > 0) {
          const force = (1 - dist / 80) * 0.5;
          m.x += (dx / dist) * force;
          m.y += (dy / dist) * force;
        }
      }

      if (m.y < -10) {
        this.motes[i] = this.createMote(false);
        continue;
      }

      // Draw glowing dust mote
      const shimmer = 0.75 + Math.sin(m.phase) * 0.25;
      const currentAlpha = m.alpha * shimmer;

      const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.radius * 2.5);
      grad.addColorStop(0, `rgba(255, 250, 220, ${currentAlpha})`);
      grad.addColorStop(0.4, `rgba(255, 220, 150, ${currentAlpha * 0.6})`);
      grad.addColorStop(1, `rgba(255, 200, 120, 0)`);

      ctx.beginPath();
      ctx.arc(m.x, m.y, m.radius * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }
}

