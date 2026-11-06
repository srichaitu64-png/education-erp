import React, { useEffect, useRef } from 'react';
import { useEnvironmentStore } from '../../store/environmentStore';

interface RainDrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  alpha: number;
}

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  swaySpeed: number;
  swayAngle: number;
  alpha: number;
}

interface PollenParticle {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  alpha: number;
  sway: number;
}

export const WeatherParticlesCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { weather, isPaused, reducedMotion } = useEnvironmentStore();

  const isRain =
    weather.condition === 'RAIN' ||
    weather.condition === 'DRIZZLE' ||
    weather.condition === 'HEAVY_RAIN' ||
    weather.condition === 'THUNDERSTORM';

  const isSnow = weather.condition === 'SNOW';

  const rainRef = useRef<RainDrop[]>([]);
  const snowRef = useRef<Snowflake[]>([]);
  const pollenRef = useRef<PollenParticle[]>([]);
  const lightningFlashRef = useRef<number>(0);

  // Initialize particle pools
  useEffect(() => {
    if (isRain) {
      const count = weather.condition === 'HEAVY_RAIN' || weather.condition === 'THUNDERSTORM' ? 180 : 80;
      const drops: RainDrop[] = [];
      for (let i = 0; i < count; i++) {
        drops.push({
          x: Math.random(),
          y: Math.random(),
          length: 12 + Math.random() * 18,
          speed: 18 + Math.random() * 12,
          alpha: 0.2 + Math.random() * 0.4,
        });
      }
      rainRef.current = drops;
    } else if (isSnow) {
      const flakes: Snowflake[] = [];
      for (let i = 0; i < 90; i++) {
        flakes.push({
          x: Math.random(),
          y: Math.random(),
          radius: 1.2 + Math.random() * 2.8,
          speedY: 0.8 + Math.random() * 1.6,
          speedX: 0.2 + (weather.windSpeed / 40) * 0.8,
          swaySpeed: 0.02 + Math.random() * 0.04,
          swayAngle: Math.random() * Math.PI * 2,
          alpha: 0.3 + Math.random() * 0.6,
        });
      }
      snowRef.current = flakes;
    } else {
      // Clear/Fair: gentle ambient floating pollen / floral dust
      const pollen: PollenParticle[] = [];
      for (let i = 0; i < 35; i++) {
        pollen.push({
          x: Math.random(),
          y: Math.random(),
          radius: 1.0 + Math.random() * 1.5,
          speedY: 0.15 + Math.random() * 0.3,
          speedX: 0.1 + (weather.windSpeed / 80) * 0.4,
          alpha: 0.2 + Math.random() * 0.35,
          sway: Math.random() * Math.PI * 2,
        });
      }
      pollenRef.current = pollen;
    }
  }, [weather.condition, isRain, isSnow, weather.windSpeed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
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

      // 1. RAIN
      if (isRain) {
        // Wind tilt angle
        const windSlant = Math.min(12, Math.max(-12, (weather.windSpeed - 5) * 0.6));

        // Thunderstorm lightning flash (random occasional flash)
        if (weather.condition === 'THUNDERSTORM' && Math.random() < 0.004) {
          lightningFlashRef.current = 0.35;
        }

        if (lightningFlashRef.current > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${lightningFlashRef.current})`;
          ctx.fillRect(0, 0, w, h);
          lightningFlashRef.current = Math.max(0, lightningFlashRef.current - 0.04);
        }

        ctx.strokeStyle = 'rgba(195, 220, 245, 0.6)';
        ctx.lineWidth = weather.condition === 'HEAVY_RAIN' ? 1.5 : 1.1;

        rainRef.current.forEach((drop) => {
          if (!reducedMotion) {
            drop.y += drop.speed / h;
            drop.x += (windSlant * 0.5) / w;

            if (drop.y > 1.0) {
              drop.y = -0.05;
              drop.x = Math.random();
            }
            if (drop.x > 1.0) drop.x = 0;
            if (drop.x < 0) drop.x = 1.0;
          }

          const startX = drop.x * w;
          const startY = drop.y * h;
          const endX = startX + windSlant;
          const endY = startY + drop.length;

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        });
      }
      // 2. SNOW
      else if (isSnow) {
        ctx.fillStyle = '#FFFFFF';
        snowRef.current.forEach((flake) => {
          if (!reducedMotion) {
            flake.y += flake.speedY / h;
            flake.swayAngle += flake.swaySpeed;
            flake.x += (Math.sin(flake.swayAngle) * 0.5 + flake.speedX) / w;

            if (flake.y > 1.0) {
              flake.y = -0.05;
              flake.x = Math.random();
            }
            if (flake.x > 1.0) flake.x = 0;
            if (flake.x < 0) flake.x = 1.0;
          }

          ctx.beginPath();
          ctx.arc(flake.x * w, flake.y * h, flake.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${flake.alpha})`;
          ctx.fill();
        });
      }
      // 3. POLLEN / FLORAL DUST (Gentle breeze in clear weather)
      else {
        pollenRef.current.forEach((p) => {
          if (!reducedMotion) {
            p.sway += 0.02;
            p.y += (p.speedY + Math.sin(p.sway) * 0.1) / h;
            p.x += (p.speedX + Math.cos(p.sway) * 0.15) / w;

            if (p.y > 1.0) {
              p.y = -0.05;
              p.x = Math.random();
            }
            if (p.x > 1.0) p.x = 0;
          }

          ctx.beginPath();
          ctx.arc(p.x * w, p.y * h, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 248, 200, ${p.alpha})`;
          ctx.fill();
        });
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [weather.condition, isRain, isSnow, weather.windSpeed, isPaused, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
