import React from 'react';
import { useEnvironmentStore } from '../../store/environmentStore';

export const OceanMarineLife: React.FC = () => {
  const { reducedMotion, palette } = useEnvironmentStore();

  return (
    <div className="absolute inset-x-0 bottom-0 h-64 sm:h-72 pointer-events-none select-none overflow-hidden z-0">
      <style>{`
        @keyframes waveRoll1 {
          0% { transform: translateX(0); }
          50% { transform: translateX(-25%); }
          100% { transform: translateX(0); }
        }
        @keyframes waveRoll2 {
          0% { transform: translateX(-25%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }
        @keyframes dolphinLeap {
          0% { transform: translate(-80px, 80px) rotate(-35deg); opacity: 0; }
          20% { opacity: 1; }
          45% { transform: translate(140px, -45px) rotate(15deg); opacity: 1; }
          70% { transform: translate(280px, 75px) rotate(45deg); opacity: 0; }
          100% { transform: translate(280px, 75px) rotate(45deg); opacity: 0; }
        }
        @keyframes turtleGlide {
          0% { transform: translate(-60px, 15px) scale(0.9); }
          50% { transform: translate(180px, -5px) scale(0.95); }
          100% { transform: translate(450px, 15px) scale(0.9); }
        }
        .anim-wave-1 {
          animation: ${reducedMotion ? 'none' : 'waveRoll1 14s ease-in-out infinite'};
        }
        .anim-wave-2 {
          animation: ${reducedMotion ? 'none' : 'waveRoll2 18s ease-in-out infinite'};
        }
        .anim-dolphin {
          animation: ${reducedMotion ? 'none' : 'dolphinLeap 8.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite'};
        }
        .anim-turtle {
          animation: ${reducedMotion ? 'none' : 'turtleGlide 24s linear infinite'};
        }
      `}</style>

      {/* Deep Ocean Water Base */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-blue-800/25 to-transparent" />

      {/* Background Distant Waves */}
      <div className="absolute bottom-16 inset-x-0 h-28 opacity-45 anim-wave-2">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-[150%] h-full fill-blue-600/30">
          <path d="M0,32L60,42.7C120,53,240,75,360,69.3C480,64,600,32,720,26.7C840,21,960,43,1080,48C1200,53,1320,43,1380,37.3L1440,32L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z" />
        </svg>
      </div>

      {/* Leaping Dolphin */}
      <div className="absolute left-[35%] bottom-20 anim-dolphin">
        <svg viewBox="0 0 160 80" className="w-28 sm:w-36 h-auto drop-shadow-md">
          {/* Dolphin Body */}
          <path
            d="M10 60 C35 30 75 10 120 20 C145 28 155 42 145 48 C120 40 90 45 65 65 C45 78 25 75 10 60 Z"
            fill="#2563EB"
          />
          {/* White Underbelly */}
          <path
            d="M30 65 C55 48 85 42 120 45 C135 48 142 50 135 52 C110 50 80 56 55 72 Z"
            fill="#E0F2FE"
          />
          {/* Dorsal Fin */}
          <path d="M72 18 C80 5 95 12 90 22 Z" fill="#1D4ED8" />
          {/* Flippers */}
          <path d="M60 48 C68 58 75 62 70 65 C62 65 55 55 58 48 Z" fill="#1D4ED8" />
          {/* Flukes / Tail */}
          <path d="M12 60 C5 52 0 54 2 62 C5 66 10 64 12 60 Z" fill="#1D4ED8" />
          <path d="M14 62 C8 68 5 72 8 74 C12 74 15 68 14 62 Z" fill="#1D4ED8" />
          {/* Eye */}
          <circle cx="128" cy="30" r="2.5" fill="#0F172A" />
          <circle cx="127" cy="29" r="0.8" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Gliding Sea Turtle */}
      <div className="absolute left-[15%] bottom-6 anim-turtle opacity-70">
        <svg viewBox="0 0 120 70" className="w-20 sm:w-24 h-auto">
          {/* Shell */}
          <ellipse cx="60" cy="35" rx="32" ry="22" fill="#0D9488" stroke="#115E59" strokeWidth="2" />
          {/* Scutes */}
          <polygon points="60,20 72,28 72,42 60,50 48,42 48,28" fill="#14B8A6" opacity="0.6" />
          {/* Flippers */}
          <path d="M42 22 C30 5 15 8 20 22 C25 28 35 30 42 26 Z" fill="#0F766E" />
          <path d="M78 22 C90 5 105 8 100 22 C95 28 85 30 78 26 Z" fill="#0F766E" />
          {/* Head */}
          <ellipse cx="60" cy="12" rx="7" ry="10" fill="#0F766E" />
        </svg>
      </div>

      {/* Foreground Rolling Wave with Sea Foam */}
      <div className="absolute -bottom-2 inset-x-0 h-32 opacity-75 anim-wave-1">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-[150%] h-full fill-teal-600/35">
          <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
        </svg>
        {/* Sea Foam Crest */}
        <div className="absolute top-10 inset-x-0 h-1 bg-white/40 blur-xs" />
      </div>
    </div>
  );
};
