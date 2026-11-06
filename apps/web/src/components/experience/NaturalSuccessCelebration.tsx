import React, { useEffect, useRef } from 'react';
import { useExperience } from './useExperience';
import { CelebrationType } from './experience.types';
import { CheckCircle2, Sparkles, GraduationCap, CreditCard, FileText, Award } from 'lucide-react';

export const NaturalSuccessCelebration: React.FC = () => {
  const { activeCelebration, clearCelebration, isReducedMotion } = useExperience();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!activeCelebration || isReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animId: number;
    const startTime = performance.now();
    const duration = activeCelebration.durationMs || 2800;

    // Particle pool for visual burst
    interface BurstParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      rotation: number;
      rotSpeed: number;
      flip: number;
      flipSpeed: number;
    }

    const particles: BurstParticle[] = [];
    const count = activeCelebration.type === 'admission-petals' ? 45 : 35;

    const colorsByType: Record<CelebrationType, string[]> = {
      'admission-petals': ['#FDA4AF', '#F43F5E', '#FB7185', '#FECDD3'],
      'registration-bubbles': ['#38BDF8', '#818CF8', '#C084FC', '#E0E7FF'],
      'attendance-ripple': ['#34D399', '#10B981', '#6EE7B7', '#A7F3D0'],
      'fee-golden-light': ['#FBBF24', '#F59E0B', '#D97706', '#FEF3C7'],
      'report-document-flow': ['#60A5FA', '#3B82F6', '#93C5FD', '#DBEAFE'],
      'exam-achievement': ['#A855F7', '#EC4899', '#F43F5E', '#FDE047'],
      'record-saved': ['#38BDF8', '#34D399', '#818CF8', '#F1F5F9'],
    };

    const palette = colorsByType[activeCelebration.type] || ['#3B82F6', '#10B981'];

    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * Math.PI) - (Math.PI / 2); // Upward spray
      const speed = 4 + Math.random() * 8;
      particles.push({
        x: window.innerWidth * 0.5 + (Math.random() - 0.5) * 150,
        y: window.innerHeight * 0.75,
        vx: Math.cos(angle) * speed * (Math.random() - 0.5) * 2,
        vy: -Math.abs(Math.sin(angle) * speed) - 3,
        size: 8 + Math.random() * 10,
        color: palette[Math.floor(Math.random() * palette.length)],
        alpha: 0.9,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.08,
        flip: Math.random() * Math.PI * 2,
        flipSpeed: 0.05 + Math.random() * 0.05,
      });
    }

    const animate = (time: number) => {
      const elapsed = time - startTime;
      if (elapsed > duration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const fadeProgress = elapsed / duration;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.vy += 0.18; // Gravity
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.flip += p.flipSpeed;
        p.alpha = Math.max(0, 0.9 * (1 - fadeProgress * 1.1));

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(Math.cos(p.flip), 1);

        ctx.beginPath();
        if (activeCelebration.type === 'admission-petals' || activeCelebration.type === 'exam-achievement') {
          // Petal shape
          ctx.ellipse(0, 0, p.size * 0.5, p.size, 0, 0, Math.PI * 2);
        } else {
          // Soft celebratory orb
          ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
        }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [activeCelebration, isReducedMotion]);

  if (!activeCelebration) return null;

  // Icon mapping
  const celebrationIcons: Record<CelebrationType, React.ReactNode> = {
    'admission-petals': <GraduationCap className="w-7 h-7 text-rose-500" />,
    'registration-bubbles': <Sparkles className="w-7 h-7 text-sky-500" />,
    'attendance-ripple': <CheckCircle2 className="w-7 h-7 text-emerald-500" />,
    'fee-golden-light': <CreditCard className="w-7 h-7 text-amber-500" />,
    'report-document-flow': <FileText className="w-7 h-7 text-blue-500" />,
    'exam-achievement': <Award className="w-7 h-7 text-purple-500" />,
    'record-saved': <CheckCircle2 className="w-7 h-7 text-emerald-500" />,
  };

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center p-4"
      aria-live="polite"
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Floating confirmation card */}
      <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/60 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md w-full text-center animate-scale-up pointer-events-auto">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center shadow-inner mb-3 border border-slate-200/60 dark:border-slate-700/60">
          {celebrationIcons[activeCelebration.type]}
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {activeCelebration.title}
        </h3>
        {activeCelebration.subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {activeCelebration.subtitle}
          </p>
        )}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-center">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200/50">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed by Backend Repository
          </span>
        </div>
      </div>
    </div>
  );
};

