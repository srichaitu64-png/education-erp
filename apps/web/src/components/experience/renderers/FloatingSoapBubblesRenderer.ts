/**
 * Realistic Transparent Soap Bubbles Canvas Particle Renderer
 * Features iridescent rainbow sheen, specular highlights, wobbling physics, and popping.
 */

interface Bubble {
  x: number;
  y: number;
  radius: number;
  targetRadius: number;
  baseRadius: number;
  speedY: number;
  speedX: number;
  wobbleSpeed: number;
  wobblePhase: number;
  wobbleAmount: number;
  alpha: number;
  targetAlpha: number;
  hueShift: number;
  popping: boolean;
  popProgress: number;
  depth: number; // 0.5 (far) to 1.2 (near)
}

export class FloatingSoapBubblesRenderer {
  private bubbles: Bubble[] = [];
  private width: number = 0;
  private height: number = 0;
  private mouseX: number = -1000;
  private mouseY: number = -1000;
  private time: number = 0;

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

  public setMouse(x: number, y: number): void {
    this.mouseX = x;
    this.mouseY = y;
  }

  public updateCount(targetCount: number): void {
    while (this.bubbles.length < targetCount) {
      this.bubbles.push(this.createBubble(false));
    }
    if (this.bubbles.length > targetCount) {
      this.bubbles.splice(targetCount);
    }
  }

  private createBubble(scatterVertical: boolean): Bubble {
    const depth = 0.5 + Math.random() * 0.7; // Depth scaling
    const baseRadius = (16 + Math.random() * 32) * depth;
    return {
      x: Math.random() * this.width,
      y: scatterVertical ? Math.random() * this.height : this.height + baseRadius + Math.random() * 40,
      radius: baseRadius,
      targetRadius: baseRadius,
      baseRadius,
      speedY: -(0.3 + Math.random() * 0.6) * depth,
      speedX: (Math.random() - 0.5) * 0.4,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleAmount: 0.06 + Math.random() * 0.06,
      alpha: 0,
      targetAlpha: (0.35 + Math.random() * 0.4) * (0.8 + depth * 0.2),
      hueShift: Math.random() * 360,
      popping: false,
      popProgress: 0,
      depth,
    };
  }

  public render(ctx: CanvasRenderingContext2D, dt: number): void {
    this.time += dt * 0.001;

    for (let i = 0; i < this.bubbles.length; i++) {
      const b = this.bubbles[i];

      // Handle popping animation
      if (b.popping) {
        b.popProgress += dt * 0.004;
        if (b.popProgress >= 1) {
          this.bubbles[i] = this.createBubble(false);
          continue;
        }

        // Render bursting ring
        const popRadius = b.radius * (1 + b.popProgress * 0.5);
        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, popRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - b.popProgress) * 0.4})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Small droplet sparkles
        for (let j = 0; j < 6; j++) {
          const angle = (j / 6) * Math.PI * 2;
          const dist = popRadius * 1.1;
          ctx.fillStyle = `rgba(220, 240, 255, ${(1 - b.popProgress) * 0.5})`;
          ctx.beginPath();
          ctx.arc(b.x + Math.cos(angle) * dist, b.y + Math.sin(angle) * dist, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        continue;
      }

      // Smooth fade-in
      if (b.alpha < b.targetAlpha) {
        b.alpha = Math.min(b.targetAlpha, b.alpha + dt * 0.0008);
      }

      // Wobble physics
      b.wobblePhase += b.wobbleSpeed;
      const currentRadiusX = b.radius * (1 + Math.sin(b.wobblePhase) * b.wobbleAmount);
      const currentRadiusY = b.radius * (1 - Math.sin(b.wobblePhase) * b.wobbleAmount);

      // Movement with gentle horizontal drift
      b.y += b.speedY;
      b.x += b.speedX + Math.sin(this.time + b.wobblePhase) * 0.2;

      // Pointer deflection (subtle, non-intrusive)
      if (this.mouseX > 0 && this.mouseY > 0) {
        const dx = b.x - this.mouseX;
        const dy = b.y - this.mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && dist > 0) {
          const force = (1 - dist / 120) * 0.8;
          b.x += (dx / dist) * force;
          b.y += (dy / dist) * force;
        }
      }

      // Random spontaneous pop at top of screen or after lifetime
      if (b.y < -b.radius * 2) {
        this.bubbles[i] = this.createBubble(false);
        continue;
      }

      // Draw realistic soap bubble
      ctx.save();
      ctx.translate(b.x, b.y);

      // 1. Transparent body with iridescent rainbow edge gradient
      const gradient = ctx.createRadialGradient(
        -currentRadiusX * 0.2,
        -currentRadiusY * 0.2,
        currentRadiusX * 0.2,
        0,
        0,
        currentRadiusX
      );

      gradient.addColorStop(0, `rgba(255, 255, 255, ${b.alpha * 0.05})`);
      gradient.addColorStop(0.5, `rgba(180, 230, 255, ${b.alpha * 0.1})`);
      gradient.addColorStop(0.75, `rgba(240, 180, 255, ${b.alpha * 0.2})`);
      gradient.addColorStop(0.9, `rgba(255, 225, 160, ${b.alpha * 0.3})`);
      gradient.addColorStop(0.98, `rgba(160, 235, 255, ${b.alpha * 0.45})`);
      gradient.addColorStop(1, `rgba(255, 255, 255, ${b.alpha * 0.6})`);

      ctx.beginPath();
      ctx.ellipse(0, 0, currentRadiusX, currentRadiusY, 0, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // 2. Delicate iridescent stroke
      ctx.lineWidth = 1.2 * b.depth;
      ctx.strokeStyle = `rgba(255, 255, 255, ${b.alpha * 0.6})`;
      ctx.stroke();

      // 3. Primary specular crescent highlight (top-left sunlight reflection)
      ctx.beginPath();
      ctx.ellipse(
        -currentRadiusX * 0.38,
        -currentRadiusY * 0.38,
        currentRadiusX * 0.25,
        currentRadiusY * 0.12,
        -Math.PI / 4,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha * 0.85})`;
      ctx.fill();

      // 4. Secondary subtle specular highlight (bottom-right ground bounce)
      ctx.beginPath();
      ctx.ellipse(
        currentRadiusX * 0.32,
        currentRadiusY * 0.32,
        currentRadiusX * 0.15,
        currentRadiusY * 0.08,
        -Math.PI / 4,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `rgba(200, 235, 255, ${b.alpha * 0.4})`;
      ctx.fill();

      ctx.restore();
    }
  }
}

