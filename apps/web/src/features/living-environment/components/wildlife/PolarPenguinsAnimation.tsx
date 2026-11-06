import React from 'react';
import { useEnvironmentStore } from '../../store/environmentStore';

export const PolarPenguinsAnimation: React.FC = () => {
  const { reducedMotion } = useEnvironmentStore();

  return (
    <div className="absolute inset-x-0 bottom-0 h-48 pointer-events-none select-none z-0">
      <style>{`
        @keyframes penguinWaddle {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(35px) rotate(4deg); }
          50% { transform: translateX(70px) rotate(-4deg); }
          75% { transform: translateX(35px) rotate(4deg); }
        }
        @keyframes penguinSlide {
          0% { transform: translate(-40px, 0) rotate(15deg); }
          50% { transform: translate(120px, 12px) rotate(2deg); }
          100% { transform: translate(260px, 20px) rotate(0deg); }
        }
        .anim-waddle {
          animation: ${reducedMotion ? 'none' : 'penguinWaddle 8s ease-in-out infinite'};
        }
        .anim-slide {
          animation: ${reducedMotion ? 'none' : 'penguinSlide 9s linear infinite'};
        }
      `}</style>

      {/* Snow Hills Backdrop */}
      <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-slate-100/90 via-sky-50/70 to-transparent rounded-t-[40%]" />

      {/* Penguin 1: Waddling */}
      <div className="absolute left-[20%] bottom-4 anim-waddle">
        <svg viewBox="0 0 70 100" className="w-14 sm:w-16 h-auto drop-shadow-md">
          {/* Feet */}
          <ellipse cx="28" cy="94" rx="10" ry="4" fill="#F59E0B" />
          <ellipse cx="44" cy="94" rx="10" ry="4" fill="#F59E0B" />

          {/* Body */}
          <ellipse cx="36" cy="55" rx="22" ry="36" fill="#0F172A" />
          {/* White Chest */}
          <ellipse cx="36" cy="58" rx="14" ry="28" fill="#FFFFFF" />
          {/* Yellow Emperor Collar */}
          <path d="M28 32 Q36 40 44 32" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />

          {/* Wings / Flippers */}
          <ellipse cx="14" cy="55" rx="5" ry="16" fill="#1E293B" transform="rotate(15 14 55)" />
          <ellipse cx="58" cy="55" rx="5" ry="16" fill="#1E293B" transform="rotate(-15 58 55)" />

          {/* Head */}
          <circle cx="36" cy="24" r="14" fill="#0F172A" />
          {/* Eye */}
          <circle cx="42" cy="22" r="2" fill="#FFFFFF" />
          <circle cx="43" cy="22" r="1" fill="#0F172A" />
          {/* Beak */}
          <polygon points="46,24 58,26 46,28" fill="#F59E0B" />
        </svg>
      </div>

      {/* Penguin 2: Belly Sliding */}
      <div className="absolute left-[50%] bottom-2 anim-slide">
        <svg viewBox="0 0 100 50" className="w-20 sm:w-24 h-auto drop-shadow-md">
          {/* Sliding Torso */}
          <ellipse cx="50" cy="28" rx="36" ry="16" fill="#0F172A" transform="rotate(-4 50 28)" />
          {/* White Belly Sliding Surface */}
          <ellipse cx="50" cy="34" rx="28" ry="8" fill="#FFFFFF" transform="rotate(-4 50 34)" />
          {/* Flippers tucked or guiding */}
          <ellipse cx="45" cy="18" rx="12" ry="4" fill="#1E293B" />
          {/* Tail */}
          <polygon points="12,26 4,28 12,30" fill="#0F172A" />
          {/* Head Forward */}
          <circle cx="85" cy="24" r="10" fill="#0F172A" />
          {/* Eye */}
          <circle cx="89" cy="22" r="1.5" fill="#FFFFFF" />
          {/* Beak Pointed Ahead */}
          <polygon points="93,23 102,25 93,27" fill="#F59E0B" />
        </svg>
      </div>
    </div>
  );
};
