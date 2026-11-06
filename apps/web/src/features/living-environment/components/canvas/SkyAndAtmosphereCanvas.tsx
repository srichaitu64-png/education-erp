import React, { useEffect, useRef } from 'react';
import { useEnvironmentStore } from '../../store/environmentStore';

interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  speed: number;
  brightness: number;
}

interface Cloud {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  opacity: number;
}

export const SkyAndAtmosphereCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { palette, timeOfDay, solar, weather, isPaused, reducedMotion } = useEnvironmentStore();

  const starsRef = useRef<Star[]>([]);
  const cloudsRef = useRef<Cloud[]>([]);

  // Initialize stars and clouds once
  useEffect(() => {
    const stars: Star[] = [];
    for (let i = 0; i < 120; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random() * 0.65, // in upper 65% of screen
        radius: 0.6 + Math.random() * 1.4,
        alpha: 0.3 + Math.random() * 0.7,
        speed: 0.005 + Math.random() * 0.015,
        brightness: Math.random() * Math.PI,
      });
    }
    starsRef.current = stars;

    const clouds: Cloud[] = [];
    const count = Math.min(8, Math.max(3, Math.round(weather.cloudCover / 15)));
    for (let i = 0; i < count; i++) {
      clouds.push({
        x: Math.random() * 1.5 - 0.25,
        y: 0.05 + Math.random() * 0.35,
        width: 0.25 + Math.random() * 0.35,
        height: 0.08 + Math.random() * 0.12,
        speed: 0.00003 + (weather.windSpeed / 100000) * 0.8,
        opacity: 0.25 + Math.random() * 0.35,
      });
    }
    cloudsRef.current = clouds;
  }, [weather.cloudCover, weather.windSpeed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const render = (currentTime: number) => {
      if (isPaused) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Draw Sky Gradient
      const skyGradient = ctx.createLinearGradient(0, 0, 0, h);
      skyGradient.addColorStop(0, palette.skyTop);
      skyGradient.addColorStop(0.55, palette.skyMiddle);
      skyGradient.addColorStop(1, palette.skyBottom);
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, w, h);

      // 2. Stars & Constellations (Night, Twilight, Dawn)
      if (timeOfDay === 'NIGHT' || timeOfDay === 'TWILIGHT' || timeOfDay === 'DAWN') {
        const starOpacity = timeOfDay === 'NIGHT' ? 0.95 : timeOfDay === 'TWILIGHT' ? 0.5 : 0.3;

        starsRef.current.forEach((star) => {
          if (!reducedMotion) {
            star.brightness += star.speed;
          }
          const twinkle = Math.sin(star.brightness) * 0.35 + 0.65;
          ctx.beginPath();
          ctx.arc(star.x * w, star.y * h, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * twinkle * starOpacity})`;
          ctx.fill();
        });

        // Subtle Constellation Line (Ursa Major / Big Dipper shape)
        if (timeOfDay === 'NIGHT') {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 4]);
          ctx.beginPath();
          const pts = [
            [0.15 * w, 0.18 * h],
            [0.22 * w, 0.17 * h],
            [0.27 * w, 0.22 * h],
            [0.32 * w, 0.25 * h],
            [0.38 * w, 0.26 * h],
            [0.39 * w, 0.34 * h],
            [0.33 * w, 0.33 * h],
            [0.32 * w, 0.25 * h],
          ];
          ctx.moveTo(pts[0][0], pts[0][1]);
          for (let p = 1; p < pts.length; p++) {
            ctx.lineTo(pts[p][0], pts[p][1]);
          }
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // 3. Celestial Bodies: Sun or Moon
      if (solar.elevation > -5) {
        // SUN
        const sunPixelX = solar.sunX * w;
        const sunPixelY = solar.sunY * h;
        const sunRadius = Math.max(28, w * 0.024);

        // Ambient Sun Glow
        const sunGlowGrad = ctx.createRadialGradient(
          sunPixelX,
          sunPixelY,
          sunRadius * 0.2,
          sunPixelX,
          sunPixelY,
          sunRadius * 4.5
        );
        sunGlowGrad.addColorStop(0, palette.sunGlow);
        sunGlowGrad.addColorStop(0.5, palette.sunGlow.replace(/[\d\.]+\)$/, '0.2)'));
        sunGlowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = sunGlowGrad;
        ctx.beginPath();
        ctx.arc(sunPixelX, sunPixelY, sunRadius * 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Sun Disc
        const sunCoreGrad = ctx.createRadialGradient(
          sunPixelX,
          sunPixelY,
          0,
          sunPixelX,
          sunPixelY,
          sunRadius
        );
        sunCoreGrad.addColorStop(0, '#FFFFFF');
        sunCoreGrad.addColorStop(0.7, '#FFF6D1');
        sunCoreGrad.addColorStop(1, '#FFDE7A');

        ctx.fillStyle = sunCoreGrad;
        ctx.beginPath();
        ctx.arc(sunPixelX, sunPixelY, sunRadius, 0, Math.PI * 2);
        ctx.fill();

        // Golden Hour / Sunset subtle rays
        if (timeOfDay === 'GOLDEN_HOUR' || timeOfDay === 'SUNSET' || timeOfDay === 'DAWN') {
          ctx.save();
          ctx.strokeStyle = palette.sunGlow;
          ctx.lineWidth = 1.5;
          for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
            ctx.beginPath();
            ctx.moveTo(
              sunPixelX + Math.cos(angle) * (sunRadius + 10),
              sunPixelY + Math.sin(angle) * (sunRadius + 10)
            );
            ctx.lineTo(
              sunPixelX + Math.cos(angle) * (sunRadius + 50),
              sunPixelY + Math.sin(angle) * (sunRadius + 50)
            );
            ctx.stroke();
          }
          ctx.restore();
        }
      } else {
        // MOON
        const moonPixelX = 0.78 * w;
        const moonPixelY = 0.22 * h;
        const moonRadius = Math.max(22, w * 0.02);

        // Moon Glow
        const moonGlow = ctx.createRadialGradient(
          moonPixelX,
          moonPixelY,
          moonRadius * 0.5,
          moonPixelX,
          moonPixelY,
          moonRadius * 3.5
        );
        moonGlow.addColorStop(0, 'rgba(210, 230, 255, 0.4)');
        moonGlow.addColorStop(1, 'rgba(210, 230, 255, 0)');
        ctx.fillStyle = moonGlow;
        ctx.beginPath();
        ctx.arc(moonPixelX, moonPixelY, moonRadius * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Moon Disc
        ctx.fillStyle = '#E8EEF5';
        ctx.beginPath();
        ctx.arc(moonPixelX, moonPixelY, moonRadius, 0, Math.PI * 2);
        ctx.fill();

        // Soft Moon Craters
        ctx.fillStyle = 'rgba(180, 195, 215, 0.4)';
        ctx.beginPath();
        ctx.arc(moonPixelX - moonRadius * 0.3, moonPixelY - moonRadius * 0.2, moonRadius * 0.25, 0, Math.PI * 2);
        ctx.arc(moonPixelX + moonRadius * 0.25, moonPixelY + moonRadius * 0.25, moonRadius * 0.3, 0, Math.PI * 2);
        ctx.arc(moonPixelX + moonRadius * 0.1, moonPixelY - moonRadius * 0.35, moonRadius * 0.18, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Drifting Organic Atmospheric Clouds
      cloudsRef.current.forEach((cloud) => {
        if (!reducedMotion) {
          cloud.x += cloud.speed;
          if (cloud.x > 1.25) cloud.x = -0.3;
        }

        const cx = cloud.x * w;
        const cy = cloud.y * h;
        const cw = cloud.width * w;
        const ch = cloud.height * h;

        ctx.fillStyle = palette.cloudTint;
        ctx.globalAlpha = cloud.opacity * 0.75;

        // Draw soft layered cloud puffs
        ctx.beginPath();
        ctx.arc(cx + cw * 0.25, cy + ch * 0.5, ch * 0.6, 0, Math.PI * 2);
        ctx.arc(cx + cw * 0.5, cy + ch * 0.4, ch * 0.85, 0, Math.PI * 2);
        ctx.arc(cx + cw * 0.75, cy + ch * 0.5, ch * 0.65, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1.0;
      });

      // 5. Soft Horizon Atmospheric Haze
      const horizonHaze = ctx.createLinearGradient(0, h * 0.65, 0, h);
      horizonHaze.addColorStop(0, 'rgba(255, 255, 255, 0)');
      horizonHaze.addColorStop(1, palette.hazeColor);
      ctx.fillStyle = horizonHaze;
      ctx.fillRect(0, h * 0.65, w, h * 0.35);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [palette, timeOfDay, solar, isPaused, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-1000"
      style={{ opacity: 0.95 }}
    />
  );
};
