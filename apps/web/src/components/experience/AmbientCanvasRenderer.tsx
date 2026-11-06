import React, { useEffect, useRef } from 'react';
import { useExperience } from './useExperience';
import { PARTICLE_BUDGETS } from './experience.config';
import { FloatingSoapBubblesRenderer } from './renderers/FloatingSoapBubblesRenderer';
import { NaturalRainRenderer } from './renderers/NaturalRainRenderer';
import { NaturalSnowfallRenderer } from './renderers/NaturalSnowfallRenderer';
import { FloatingFlowerPetalsRenderer } from './renderers/FloatingFlowerPetalsRenderer';
import { SunlightParticlesRenderer } from './renderers/SunlightParticlesRenderer';
import { SpringBreezeRenderer } from './renderers/SpringBreezeRenderer';
import { UnderwaterBubblesRenderer } from './renderers/UnderwaterBubblesRenderer';
import { FloatingLeavesRenderer } from './renderers/FloatingLeavesRenderer';
import { NaturalButterfliesRenderer } from './renderers/NaturalButterfliesRenderer';

export const AmbientCanvasRenderer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { activeAtmosphere, settings, isReducedMotion } = useExperience();

  const activeAtmosphereRef = useRef(activeAtmosphere);
  activeAtmosphereRef.current = activeAtmosphere;

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const isReducedMotionRef = useRef(isReducedMotion);
  isReducedMotionRef.current = isReducedMotion;

  // Single instances of renderers
  const soapBubbles = useRef(new FloatingSoapBubblesRenderer());
  const rain = useRef(new NaturalRainRenderer());
  const snow = useRef(new NaturalSnowfallRenderer());
  const petals = useRef(new FloatingFlowerPetalsRenderer());
  const sunlight = useRef(new SunlightParticlesRenderer());
  const breeze = useRef(new SpringBreezeRenderer());
  const underwater = useRef(new UnderwaterBubblesRenderer());
  const leaves = useRef(new FloatingLeavesRenderer());
  const butterflies = useRef(new NaturalButterfliesRenderer());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let isTabVisible = !document.hidden;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // Re-initialize active renderers with budget
      const curAtmosphere = activeAtmosphereRef.current;
      const intensity = settingsRef.current.intensity;
      const count = PARTICLE_BUDGETS[intensity][curAtmosphere] || 0;

      soapBubbles.current.setDimensions(width, height);
      rain.current.setDimensions(width, height);
      snow.current.setDimensions(width, height);
      petals.current.setDimensions(width, height);
      sunlight.current.setDimensions(width, height);
      breeze.current.setDimensions(width, height);
      underwater.current.setDimensions(width, height);
      leaves.current.setDimensions(width, height);
      butterflies.current.setDimensions(width, height);

      // Initialize
      if (curAtmosphere === 'soap-bubbles') soapBubbles.current.init(width, height, count);
      else if (curAtmosphere === 'gentle-rain') rain.current.init(width, height, count);
      else if (curAtmosphere === 'peaceful-snowfall') snow.current.init(width, height, count);
      else if (curAtmosphere === 'flower-petals') petals.current.init(width, height, count);
      else if (curAtmosphere === 'warm-sunlight') sunlight.current.init(width, height, count);
      else if (curAtmosphere === 'spring-breeze') breeze.current.init(width, height, count);
      else if (curAtmosphere === 'underwater-bubbles') underwater.current.init(width, height, count);
      else if (curAtmosphere === 'floating-leaves') leaves.current.init(width, height, count);
      else if (curAtmosphere === 'butterflies') butterflies.current.init(width, height, count);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      if (!settingsRef.current.pointerEffectsEnabled) return;
      soapBubbles.current.setMouse(e.clientX, e.clientY);
      sunlight.current.setMouse(e.clientX, e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        lastTime = performance.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Main 60fps shared animation loop
    const renderLoop = (time: number) => {
      animationFrameId = requestAnimationFrame(renderLoop);

      if (!isTabVisible) return;
      if (isReducedMotionRef.current || !settingsRef.current.ambientEffectsEnabled) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        return;
      }

      const dt = Math.min(time - lastTime, 50); // Clamp delta time to avoid large jumps
      lastTime = time;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const curAtmosphere = activeAtmosphereRef.current;
      if (curAtmosphere === 'disabled' || curAtmosphere === 'minimal-professional') {
        return;
      }

      if (curAtmosphere === 'soap-bubbles') {
        soapBubbles.current.render(ctx, dt);
      } else if (curAtmosphere === 'gentle-rain') {
        rain.current.render(ctx, dt);
      } else if (curAtmosphere === 'peaceful-snowfall') {
        snow.current.render(ctx, dt);
      } else if (curAtmosphere === 'flower-petals') {
        petals.current.render(ctx, dt);
      } else if (curAtmosphere === 'warm-sunlight') {
        sunlight.current.render(ctx, dt);
      } else if (curAtmosphere === 'spring-breeze') {
        breeze.current.render(ctx, dt);
      } else if (curAtmosphere === 'underwater-bubbles') {
        underwater.current.render(ctx, dt);
      } else if (curAtmosphere === 'floating-leaves') {
        leaves.current.render(ctx, dt);
      } else if (curAtmosphere === 'butterflies') {
        butterflies.current.render(ctx, dt);
      }
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Sync count on atmosphere or intensity changes
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const count = PARTICLE_BUDGETS[settings.intensity][activeAtmosphere] || 0;

    if (activeAtmosphere === 'soap-bubbles') soapBubbles.current.init(width, height, count);
    else if (activeAtmosphere === 'gentle-rain') rain.current.init(width, height, count);
    else if (activeAtmosphere === 'peaceful-snowfall') snow.current.init(width, height, count);
    else if (activeAtmosphere === 'flower-petals') petals.current.init(width, height, count);
    else if (activeAtmosphere === 'warm-sunlight') sunlight.current.init(width, height, count);
    else if (activeAtmosphere === 'spring-breeze') breeze.current.init(width, height, count);
    else if (activeAtmosphere === 'underwater-bubbles') underwater.current.init(width, height, count);
    else if (activeAtmosphere === 'floating-leaves') leaves.current.init(width, height, count);
    else if (activeAtmosphere === 'butterflies') butterflies.current.init(width, height, count);
  }, [activeAtmosphere, settings.intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
      style={{
        opacity: settings.ambientEffectsEnabled && !isReducedMotion ? 1 : 0,
        transition: 'opacity 0.6s ease-in-out',
      }}
    />
  );
};

