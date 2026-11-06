import React, { useEffect, useRef } from 'react';
import { useEnvironmentStore } from '../../store/environmentStore';

interface Bird {
  x: number;
  y: number;
  size: number;
  speed: number;
  flapPhase: number;
  flapSpeed: number;
  isGliding: boolean;
  glideTimer: number;
  verticalDrift: number;
}

export const BirdsFlockCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { timeOfDay, weather, isPaused, reducedMotion } = useEnvironmentStore();

  const isNight = timeOfDay === 'NIGHT';
  const isHeavyStorm = weather.condition === 'THUNDERSTORM' || weather.condition === 'HEAVY_RAIN';

  const birdsRef = useRef<Bird[]>([]);

  useEffect(() => {
    // Hide birds during deep night or thunderstorm
    if (isNight || isHeavyStorm) {
      birdsRef.current = [];
      return;
    }

    // Initialize flock in loose V-formation
    const flock: Bird[] = [];
    const leaderY = 0.18 + Math.random() * 0.12;
    const baseSpeed = 0.0004 + (weather.windSpeed / 100000) * 0.5;

    // 6 birds in formation
    const offsets = [
      { dx: 0, dy: 0 },
      { dx: -0.035, dy: 0.02 },
      { dx: -0.07, dy: 0.04 },
      { dx: -0.035, dy: -0.02 },
      { dx: -0.07, dy: -0.04 },
      { dx: -0.105, dy: 0.06 },
    ];

    offsets.forEach((off, idx) => {
      flock.push({
        x: -0.1 + off.dx,
        y: leaderY + off.dy,
        size: 9 + Math.random() * 3,
        speed: baseSpeed + (Math.random() * 0.00005 - 0.000025),
        flapPhase: idx * 0.4,
        flapSpeed: 0.18 + Math.random() * 0.04,
        isGliding: false,
        glideTimer: Math.random() * 60,
        verticalDrift: Math.random() * Math.PI,
      });
    });

    birdsRef.current = flock;
  }, [isNight, isHeavyStorm, weather.windSpeed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isNight || isHeavyStorm) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      if (isPaused) {
        animId = requestAnimationFrame(render);
        return;
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = timeOfDay === 'GOLDEN_HOUR' || timeOfDay === 'SUNSET' ? '#4A2E18' : '#2D3748';

      birdsRef.current.forEach((bird) => {
        if (!reducedMotion) {
          bird.x += bird.speed;
          bird.verticalDrift += 0.015;
          bird.glideTimer += 1;

          // Toggle between flapping and gliding
          if (bird.glideTimer > 90) {
            bird.isGliding = !bird.isGliding;
            bird.glideTimer = 0;
          }

          if (!bird.isGliding) {
            bird.flapPhase += bird.flapSpeed;
          }

          // Loop across screen
          if (bird.x > 1.25) {
            bird.x = -0.25;
            bird.y = 0.15 + Math.random() * 0.2;
          }
        }

        const bx = bird.x * w;
        const by = (bird.y + Math.sin(bird.verticalDrift) * 0.008) * h;
        const s = bird.size;

        // Wing flap angle (-1 to 1)
        const wingSpan = bird.isGliding ? 0.15 : Math.sin(bird.flapPhase);

        // Draw bird silhouette (natural curved wing span)
        ctx.beginPath();
        // Left wing tip
        ctx.moveTo(bx - s, by + wingSpan * s * 0.6);
        // Left wing crest
        ctx.quadraticCurveTo(bx - s * 0.5, by - s * 0.2 + wingSpan * s * 0.2, bx, by);
        // Right wing crest
        ctx.quadraticCurveTo(bx + s * 0.5, by - s * 0.2 + wingSpan * s * 0.2, bx + s, by + wingSpan * s * 0.6);
        // Center bird body
        ctx.quadraticCurveTo(bx, by + s * 0.25, bx - s, by + wingSpan * s * 0.6);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [isNight, isHeavyStorm, timeOfDay, isPaused, reducedMotion]);

  if (isNight || isHeavyStorm) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
