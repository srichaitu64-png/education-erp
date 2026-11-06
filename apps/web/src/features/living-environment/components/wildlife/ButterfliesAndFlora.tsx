import React from 'react';
import { useEnvironmentStore } from '../../store/environmentStore';

export const ButterfliesAndFlora: React.FC = () => {
  const { weather, reducedMotion } = useEnvironmentStore();

  const windDuration = Math.max(3, Math.min(8, 12 - weather.windSpeed * 0.35));

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
      <style>{`
        @keyframes plantSwayLeft {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(${Math.min(6, 2 + weather.windSpeed * 0.15)}deg); }
        }
        @keyframes plantSwayRight {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-${Math.min(5, 1.5 + weather.windSpeed * 0.12)}deg); }
        }
        @keyframes butterflyFlutter {
          0%, 100% { transform: scaleX(1); }
          50% { transform: scaleX(0.2); }
        }
        @keyframes butterflyFlight1 {
          0% { transform: translate(0, 0); }
          25% { transform: translate(60px, -40px); }
          50% { transform: translate(140px, -15px); }
          75% { transform: translate(80px, 30px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes butterflyFlight2 {
          0% { transform: translate(0, 0); }
          30% { transform: translate(-50px, -60px); }
          60% { transform: translate(-110px, -20px); }
          85% { transform: translate(-40px, 40px); }
          100% { transform: translate(0, 0); }
        }
        .anim-bamboo-l {
          animation: ${reducedMotion ? 'none' : `plantSwayLeft ${windDuration}s ease-in-out infinite`};
          transform-origin: bottom left;
        }
        .anim-bamboo-r {
          animation: ${reducedMotion ? 'none' : `plantSwayRight ${windDuration * 1.15}s ease-in-out infinite`};
          transform-origin: bottom right;
        }
        .anim-wing {
          animation: ${reducedMotion ? 'none' : 'butterflyFlutter 0.22s ease-in-out infinite'};
        }
        .anim-fly-1 {
          animation: ${reducedMotion ? 'none' : 'butterflyFlight1 12s ease-in-out infinite'};
        }
        .anim-fly-2 {
          animation: ${reducedMotion ? 'none' : 'butterflyFlight2 15s ease-in-out infinite'};
        }
      `}</style>

      {/* Left Foliage / Bamboo Grove */}
      <div className="absolute -left-8 -bottom-10 w-48 sm:w-64 h-80 sm:h-96 opacity-60 anim-bamboo-l">
        <svg viewBox="0 0 200 320" className="w-full h-full fill-none">
          {/* Bamboo Stalk 1 */}
          <path d="M40 320 L50 20 L54 320 Z" fill="#047857" opacity="0.8" />
          <path d="M48 240 L52 240" stroke="#064E3B" strokeWidth="3" />
          <path d="M49 160 L53 160" stroke="#064E3B" strokeWidth="3" />
          <path d="M50 80 L52 80" stroke="#064E3B" strokeWidth="2.5" />

          {/* Bamboo Leaves */}
          <path d="M50 160 Q80 145 110 165 Q80 160 50 160" fill="#10B981" />
          <path d="M50 120 Q20 105 -10 125 Q20 120 50 120" fill="#059669" />
          <path d="M52 80 Q90 65 125 90 Q85 80 52 80" fill="#34D399" />
          <path d="M52 50 Q20 30 -5 55 Q25 45 52 50" fill="#10B981" />

          {/* Bamboo Stalk 2 */}
          <path d="M15 320 L25 40 L28 320 Z" fill="#065F46" opacity="0.7" />
          <path d="M25 180 Q60 165 95 185 Q60 180 25 180" fill="#10B981" />
          <path d="M25 100 Q-10 80 -40 105 Q0 95 25 100" fill="#059669" />
        </svg>
      </div>

      {/* Right Foliage / Floral Corner */}
      <div className="absolute -right-10 -bottom-12 w-48 sm:w-64 h-80 sm:h-96 opacity-60 anim-bamboo-r">
        <svg viewBox="0 0 200 320" className="w-full h-full fill-none">
          {/* Stalk */}
          <path d="M160 320 L150 30 L146 320 Z" fill="#047857" opacity="0.8" />
          <path d="M148 220 Q110 200 70 225 Q110 220 148 220" fill="#10B981" />
          <path d="M150 140 Q190 120 225 145 Q190 140 150 140" fill="#059669" />
          <path d="M152 70 Q110 50 70 75 Q115 65 152 70" fill="#34D399" />

          {/* Tropical Hibiscus Flower */}
          <circle cx="110" cy="205" r="7" fill="#F43F5E" />
          <circle cx="104" cy="200" r="6" fill="#FB7185" />
          <circle cx="116" cy="200" r="6" fill="#FB7185" />
          <circle cx="110" cy="195" r="6" fill="#FDA4AF" />
          <circle cx="110" cy="202" r="3" fill="#FBBF24" />
        </svg>
      </div>

      {/* Butterfly 1: Golden Swallowtail (Left side, fluttering near bamboo) */}
      <div className="absolute left-[18%] bottom-48 anim-fly-1">
        <div className="anim-wing">
          <svg viewBox="0 0 40 40" className="w-7 sm:w-8 h-auto drop-shadow-sm">
            {/* Left Wing */}
            <path d="M20 20 C10 5 0 10 2 24 C5 32 15 28 20 22 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
            <circle cx="10" cy="16" r="2" fill="#1E293B" />
            {/* Right Wing */}
            <path d="M20 20 C30 5 40 10 38 24 C35 32 25 28 20 22 Z" fill="#FBBF24" stroke="#B45309" strokeWidth="1" />
            <circle cx="30" cy="16" r="2" fill="#1E293B" />
            {/* Body */}
            <ellipse cx="20" cy="20" rx="1.8" ry="8" fill="#1E293B" />
          </svg>
        </div>
      </div>

      {/* Butterfly 2: Monarch (Right side, fluttering near flower) */}
      <div className="absolute right-[22%] bottom-60 anim-fly-2">
        <div className="anim-wing">
          <svg viewBox="0 0 40 40" className="w-6 sm:w-7 h-auto drop-shadow-sm">
            {/* Left Wing */}
            <path d="M20 20 C12 6 2 12 4 22 C6 30 16 26 20 22 Z" fill="#EA580C" stroke="#7C2D12" strokeWidth="1" />
            <circle cx="11" cy="17" r="1.5" fill="#FFFFFF" />
            {/* Right Wing */}
            <path d="M20 20 C28 6 38 12 36 22 C34 30 24 26 20 22 Z" fill="#F97316" stroke="#7C2D12" strokeWidth="1" />
            <circle cx="29" cy="17" r="1.5" fill="#FFFFFF" />
            {/* Body */}
            <ellipse cx="20" cy="20" rx="1.5" ry="7" fill="#0F172A" />
          </svg>
        </div>
      </div>
    </div>
  );
};
