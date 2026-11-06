import React from 'react';
import { useEnvironmentStore } from '../../store/environmentStore';

export const BengalTigerAnimation: React.FC = () => {
  const { reducedMotion } = useEnvironmentStore();

  return (
    <div className="relative group select-none pointer-events-none">
      <svg
        viewBox="0 0 380 220"
        className="w-72 sm:w-88 md:w-96 h-auto drop-shadow-xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients for rich fur texture */}
          <linearGradient id="tigerFur" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#C2410C" />
          </linearGradient>
          <linearGradient id="tigerUnderbelly" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="100%" stopColor="#FEF3C7" />
          </linearGradient>
          <radialGradient id="tigerEye" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="70%" stopColor="#CA8A04" />
            <stop offset="100%" stopColor="#854D0E" />
          </radialGradient>
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.25" floodColor="#0F172A" />
          </filter>
        </defs>

        <style>{`
          @keyframes tigerBreathing {
            0%, 100% { transform: scaleY(1); }
            50% { transform: scaleY(1.035) translateY(-1.5px); }
          }
          @keyframes tigerTail {
            0%, 100% { transform: rotate(0deg); }
            35% { transform: rotate(6deg); }
            70% { transform: rotate(-4deg); }
          }
          @keyframes tigerEar {
            0%, 90%, 100% { transform: rotate(0deg); }
            92% { transform: rotate(-8deg); }
            95% { transform: rotate(5deg); }
            97% { transform: rotate(0deg); }
          }
          @keyframes tigerBlink {
            0%, 95%, 100% { transform: scaleY(1); }
            97.5% { transform: scaleY(0.1); }
          }
          .anim-breath {
            animation: ${reducedMotion ? 'none' : 'tigerBreathing 4.5s ease-in-out infinite'};
            transform-origin: 180px 180px;
          }
          .anim-tail {
            animation: ${reducedMotion ? 'none' : 'tigerTail 6s ease-in-out infinite'};
            transform-origin: 320px 165px;
          }
          .anim-ear {
            animation: ${reducedMotion ? 'none' : 'tigerEar 7s ease-in-out infinite'};
            transform-origin: 85px 85px;
          }
          .anim-blink {
            animation: ${reducedMotion ? 'none' : 'tigerBlink 5.5s infinite'};
            transform-origin: 112px 108px;
          }
        `}</style>

        {/* Forest Bed Grass Shadow */}
        <ellipse cx="190" cy="195" rx="160" ry="22" fill="#064E3B" opacity="0.45" filter="url(#softShadow)" />

        {/* Tail (Resting & gentle swish) */}
        <g className="anim-tail">
          <path
            d="M320 165 C345 160 365 175 360 190 C355 200 340 195 330 190"
            stroke="url(#tigerFur)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Tail Stripes */}
          <path d="M335 168 L340 178" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
          <path d="M348 175 L352 186" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
          {/* Tail Black Tip */}
          <circle cx="330" cy="190" r="8" fill="#0F172A" />
        </g>

        {/* Tiger Body (Breathing Torso) */}
        <g className="anim-breath">
          {/* Back Paws & Hips */}
          <ellipse cx="280" cy="160" rx="55" ry="40" fill="url(#tigerFur)" />
          {/* Front Resting Paws */}
          <path
            d="M80 185 C95 180 145 180 160 185 C165 192 155 200 135 200 C105 200 75 198 75 188 Z"
            fill="url(#tigerUnderbelly)"
          />
          <path
            d="M130 185 C145 180 195 180 210 185 C215 192 205 200 185 200 C155 200 125 198 125 188 Z"
            fill="url(#tigerFur)"
          />

          {/* Main Torso */}
          <path
            d="M110 145 C130 110 220 105 285 130 C310 145 310 180 270 185 C220 190 140 190 110 175 Z"
            fill="url(#tigerFur)"
          />

          {/* White Chest & Underbelly */}
          <path
            d="M105 155 C120 135 150 135 165 160 C170 175 145 188 120 188 C105 188 95 175 105 155 Z"
            fill="url(#tigerUnderbelly)"
          />

          {/* Majestic Tiger Body Stripes */}
          <path d="M160 125 Q170 140 165 155" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
          <path d="M190 120 Q200 145 195 165" stroke="#1E293B" strokeWidth="7" strokeLinecap="round" />
          <path d="M225 120 Q235 140 230 165" stroke="#1E293B" strokeWidth="7" strokeLinecap="round" />
          <path d="M255 125 Q270 145 260 168" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
          <path d="M285 135 Q295 150 288 165" stroke="#1E293B" strokeWidth="5" strokeLinecap="round" />
        </g>

        {/* Tiger Head & Neck */}
        <g>
          {/* Neck Connection */}
          <path d="M95 125 C85 110 95 90 115 80 C135 90 145 115 135 145 Z" fill="url(#tigerFur)" />

          {/* Left Ear */}
          <path d="M78 80 C70 65 85 50 95 65 Z" fill="url(#tigerFur)" />
          <path d="M82 78 C76 68 86 58 92 68 Z" fill="#FEF3C7" />
          {/* Black Ear Back */}
          <circle cx="85" cy="65" r="4" fill="#0F172A" />

          {/* Right Ear (Animated Twitch) */}
          <g className="anim-ear">
            <path d="M125 72 C135 55 150 68 142 82 Z" fill="url(#tigerFur)" />
            <path d="M128 73 C135 62 144 70 138 80 Z" fill="#FEF3C7" />
            <circle cx="136" cy="68" r="4" fill="#0F172A" />
          </g>

          {/* Head Shape */}
          <path
            d="M75 110 C70 85 105 75 135 85 C155 100 155 130 135 145 C115 155 80 145 75 110 Z"
            fill="url(#tigerFur)"
          />

          {/* White Cheeks (Ruff) */}
          <path
            d="M68 125 C60 115 72 100 82 110 C85 130 75 142 68 125 Z"
            fill="url(#tigerUnderbelly)"
          />
          <path
            d="M138 118 C148 110 155 125 146 138 C138 142 132 130 138 118 Z"
            fill="url(#tigerUnderbelly)"
          />

          {/* White Muzzle & Snout */}
          <ellipse cx="108" cy="132" rx="20" ry="14" fill="url(#tigerUnderbelly)" />
          {/* Nose Pink */}
          <polygon points="104,124 112,124 108,129" fill="#F43F5E" />

          {/* Head Stripes */}
          <path d="M98 84 L108 92 L118 84" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M102 78 L108 86 L114 78" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
          <path d="M85 98 Q95 102 92 112" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
          <path d="M128 98 Q120 102 122 112" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />

          {/* Calm, Wise Eyes */}
          <g className="anim-blink">
            {/* Left Eye */}
            <ellipse cx="94" cy="108" rx="5" ry="3.5" fill="url(#tigerEye)" />
            <circle cx="94" cy="108" r="2" fill="#0F172A" />
            <circle cx="93" cy="107" r="0.8" fill="#FFFFFF" />

            {/* Right Eye */}
            <ellipse cx="120" cy="108" rx="5" ry="3.5" fill="url(#tigerEye)" />
            <circle cx="120" cy="108" r="2" fill="#0F172A" />
            <circle cx="119" cy="107" r="0.8" fill="#FFFFFF" />
          </g>

          {/* Whiskers */}
          <path d="M100 134 Q80 132 65 130" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.8" />
          <path d="M100 136 Q80 138 68 142" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.8" />
          <path d="M116 134 Q136 132 150 130" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.8" />
          <path d="M116 136 Q136 138 148 142" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.8" />
        </g>
      </svg>
    </div>
  );
};
