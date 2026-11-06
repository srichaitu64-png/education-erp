import React from 'react';
import { useEnvironmentStore } from '../../store/environmentStore';

export const ChitalDeerAnimation: React.FC = () => {
  const { reducedMotion } = useEnvironmentStore();

  return (
    <div className="relative group select-none pointer-events-none">
      <svg
        viewBox="0 0 280 260"
        className="w-56 sm:w-68 md:w-76 h-auto drop-shadow-lg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="deerCoat" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="50%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
          <linearGradient id="deerWhite" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FEF3C7" />
          </linearGradient>
        </defs>

        <style>{`
          @keyframes deerHeadTurn {
            0%, 100% { transform: rotate(0deg); }
            30% { transform: rotate(-5deg); }
            65% { transform: rotate(3deg); }
          }
          @keyframes deerEarLeft {
            0%, 90%, 100% { transform: rotate(0deg); }
            92% { transform: rotate(-12deg); }
            96% { transform: rotate(4deg); }
          }
          @keyframes deerEarRight {
            0%, 88%, 100% { transform: rotate(0deg); }
            91% { transform: rotate(10deg); }
            95% { transform: rotate(-6deg); }
          }
          @keyframes deerBlink {
            0%, 94%, 100% { transform: scaleY(1); }
            97% { transform: scaleY(0.1); }
          }
          .anim-deer-head {
            animation: ${reducedMotion ? 'none' : 'deerHeadTurn 7s ease-in-out infinite'};
            transform-origin: 105px 125px;
          }
          .anim-deer-ear-l {
            animation: ${reducedMotion ? 'none' : 'deerEarLeft 5s infinite'};
            transform-origin: 95px 65px;
          }
          .anim-deer-ear-r {
            animation: ${reducedMotion ? 'none' : 'deerEarRight 6s infinite'};
            transform-origin: 125px 65px;
          }
          .anim-deer-blink {
            animation: ${reducedMotion ? 'none' : 'deerBlink 4.8s infinite'};
            transform-origin: 100px 85px;
          }
        `}</style>

        {/* Grass Shadow */}
        <ellipse cx="140" cy="245" rx="85" ry="12" fill="#064E3B" opacity="0.35" />

        {/* Hind Legs */}
        <path d="M185 170 L200 215 L195 242" stroke="url(#deerCoat)" strokeWidth="11" strokeLinecap="round" />
        <path d="M165 170 L175 210 L172 242" stroke="#92400E" strokeWidth="9" strokeLinecap="round" />
        {/* Hooves */}
        <path d="M193 242 L198 242" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
        <path d="M170 242 L175 242" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />

        {/* Deer Body (Torso) */}
        <path
          d="M90 145 C95 125 155 120 195 135 C215 145 220 175 195 185 C160 192 110 185 90 165 Z"
          fill="url(#deerCoat)"
        />

        {/* White Underbelly */}
        <path
          d="M105 168 C125 182 170 182 188 172 C185 182 145 186 115 178 Z"
          fill="url(#deerWhite)"
        />

        {/* Chital White Rosette Spots */}
        <g fill="#FFFFFF" opacity="0.85">
          <circle cx="130" cy="142" r="2.4" />
          <circle cx="145" cy="138" r="2.2" />
          <circle cx="162" cy="140" r="2.5" />
          <circle cx="178" cy="144" r="2.2" />
          <circle cx="138" cy="152" r="2.3" />
          <circle cx="155" cy="150" r="2.6" />
          <circle cx="172" cy="154" r="2.2" />
          <circle cx="148" cy="162" r="2.0" />
          <circle cx="165" cy="164" r="2.2" />
        </g>

        {/* Fore Legs */}
        <path d="M102 165 L98 210 L96 242" stroke="url(#deerCoat)" strokeWidth="10" strokeLinecap="round" />
        <path d="M118 165 L115 210 L112 242" stroke="#92400E" strokeWidth="8" strokeLinecap="round" />
        {/* Fore Hooves */}
        <path d="M94 242 L99 242" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
        <path d="M110 242 L115 242" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />

        {/* Tail */}
        <path d="M208 145 Q218 152 215 164" stroke="url(#deerCoat)" strokeWidth="7" strokeLinecap="round" />
        <path d="M210 148 Q216 154 213 162" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />

        {/* Neck & Animated Head */}
        <g className="anim-deer-head">
          {/* Slender Graceful Neck */}
          <path d="M92 145 C88 120 95 95 105 75 C115 85 125 110 118 142 Z" fill="url(#deerCoat)" />
          {/* White Throat Patch */}
          <path d="M92 118 C94 105 102 95 106 88 C108 100 102 115 95 122 Z" fill="url(#deerWhite)" />

          {/* Antlers / Young Horns */}
          <path d="M102 62 Q96 42 88 32 Q92 36 96 38 Q90 28 85 20" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
          <path d="M118 62 Q124 42 132 32 Q128 36 124 38 Q130 28 135 20" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />

          {/* Left Large Sensitive Ear */}
          <g className="anim-deer-ear-l">
            <path d="M94 65 C80 50 82 72 92 72 Z" fill="url(#deerCoat)" />
            <path d="M92 64 C83 55 84 68 90 70 Z" fill="#FEF3C7" />
          </g>

          {/* Right Ear */}
          <g className="anim-deer-ear-r">
            <path d="M124 65 C138 50 136 72 126 72 Z" fill="url(#deerCoat)" />
            <path d="M126 64 C135 55 134 68 128 70 Z" fill="#FEF3C7" />
          </g>

          {/* Head Shape */}
          <path
            d="M92 75 C85 68 105 58 122 65 C130 75 128 92 115 100 C102 108 88 95 92 75 Z"
            fill="url(#deerCoat)"
          />

          {/* Soft White Muzzle */}
          <ellipse cx="106" cy="98" rx="10" ry="7" fill="url(#deerWhite)" />
          {/* Black Nose */}
          <ellipse cx="106" cy="95" rx="4" ry="2.5" fill="#1E293B" />

          {/* Big Gentle Dark Eye */}
          <g className="anim-deer-blink">
            <ellipse cx="102" cy="78" rx="4.5" ry="5.5" fill="#0F172A" />
            <circle cx="100.5" cy="76" r="1.5" fill="#FFFFFF" />
            <circle cx="103" cy="79" r="0.8" fill="#FFFFFF" />
          </g>
        </g>
      </svg>
    </div>
  );
};
