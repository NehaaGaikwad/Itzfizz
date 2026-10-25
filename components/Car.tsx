import type React from "react";

// Top-down sports car, facing right. Pure SVG so it stays crisp at any size
// and needs no image request.
export default function Car(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 320 150" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="car-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff9a4d" />
          <stop offset="0.5" stopColor="#ff7a2f" />
          <stop offset="1" stopColor="#d9551a" />
        </linearGradient>
        <linearGradient id="car-glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1c1f26" />
          <stop offset="1" stopColor="#3a4150" />
        </linearGradient>
        <filter id="car-shadow" x="-10%" y="-20%" width="120%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* ground shadow */}
      <rect x="26" y="16" width="290" height="124" rx="40" fill="#000" opacity="0.55" filter="url(#car-shadow)" />

      {/* wheels */}
      <g fill="#0d0d0f">
        <rect x="56" y="6" width="50" height="18" rx="6" />
        <rect x="56" y="126" width="50" height="18" rx="6" />
        <rect x="222" y="8" width="50" height="16" rx="6" />
        <rect x="222" y="126" width="50" height="16" rx="6" />
      </g>

      {/* body */}
      <path
        d="M28 34C28 20 40 14 60 14H228C268 14 298 28 311 50C318 62 318 88 311 100C298 122 268 136 228 136H60C40 136 28 130 28 116Z"
        fill="url(#car-body)"
      />

      {/* side mirrors */}
      <g fill="#d9551a">
        <ellipse cx="176" cy="11" rx="9" ry="5" />
        <ellipse cx="176" cy="139" rx="9" ry="5" />
      </g>

      {/* rear deck + engine vents */}
      <path d="M40 40H78V110H40C34 110 32 104 32 98V52C32 46 34 40 40 40Z" fill="#c24b17" />
      <g stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" opacity="0.55">
        <path d="M46 56H70" />
        <path d="M46 66H70" />
        <path d="M46 76H70" />
        <path d="M46 86H70" />
        <path d="M46 96H70" />
      </g>

      {/* rear window */}
      <path d="M84 44C92 40 100 40 104 42V108C100 110 92 110 84 106Z" fill="url(#car-glass)" />

      {/* roof */}
      <rect x="106" y="38" width="66" height="74" rx="18" fill="#2a2d35" />
      <rect x="112" y="44" width="54" height="62" rx="14" fill="#33373f" />

      {/* windshield */}
      <path
        d="M174 38C198 42 214 56 218 75C214 94 198 108 174 112C180 98 182 88 182 75C182 62 180 52 174 38Z"
        fill="url(#car-glass)"
      />

      {/* hood creases */}
      <g stroke="#b8481a" strokeWidth="2" fill="none" opacity="0.7">
        <path d="M228 44C252 50 272 60 286 70" />
        <path d="M228 106C252 100 272 90 286 80" />
      </g>

      {/* headlights */}
      <g fill="#fff7e0">
        <path d="M290 34C298 38 304 44 308 52L300 54C296 46 292 42 286 38Z" />
        <path d="M290 116C298 112 304 106 308 98L300 96C296 104 292 108 286 112Z" />
      </g>

      {/* tail lights */}
      <g fill="#ff2a3d">
        <rect x="28" y="28" width="6" height="18" rx="2" />
        <rect x="28" y="104" width="6" height="18" rx="2" />
      </g>
    </svg>
  );
}
