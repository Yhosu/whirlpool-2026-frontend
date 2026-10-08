import React, { useMemo } from 'react';

interface CrispPrizeBallProps {
  amount?: string | number;
  className?: string;
  fallbackImg?: string;
  isOnWater?: boolean;
}

// Generate smooth scalloped rosette path (matching official Whirlpool campaign prize token)
function makeScallopPath(cx: number, cy: number, count: number, rOuter: number, rInner: number): string {
  let d = '';
  for (let i = 0; i < count; i++) {
    const a0 = (i * 2 * Math.PI) / count - Math.PI / 2;
    const aMid = ((i + 0.5) * 2 * Math.PI) / count - Math.PI / 2;
    const a1 = ((i + 1) * 2 * Math.PI) / count - Math.PI / 2;
    const x0 = (cx + rInner * Math.cos(a0)).toFixed(2);
    const y0 = (cy + rInner * Math.sin(a0)).toFixed(2);
    const xMid = (cx + rOuter * Math.cos(aMid)).toFixed(2);
    const yMid = (cy + rOuter * Math.sin(aMid)).toFixed(2);
    const x1 = (cx + rInner * Math.cos(a1)).toFixed(2);
    const y1 = (cy + rInner * Math.sin(a1)).toFixed(2);
    if (i === 0) d += `M ${x0} ${y0} `;
    d += `Q ${xMid} ${yMid} ${x1} ${y1} `;
  }
  return d + 'Z';
}

// Generate 5-point star path
function makeStar(cx: number, cy: number, rOuter: number, rInner: number): string {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? rOuter : rInner;
    const x = (cx + r * Math.cos(angle)).toFixed(2);
    const y = (cy + r * Math.sin(angle)).toFixed(2);
    d += (i === 0 ? 'M ' : 'L ') + `${x} ${y} `;
  }
  return d + 'Z';
}

export const CrispPrizeBall: React.FC<CrispPrizeBallProps> = ({
  amount = '',
  className = '',
  fallbackImg: _fallbackImg,
  isOnWater = false,
}) => {
  // Normalize display string
  const displayAmount = useMemo(() => {
    if (!amount) return '';
    const str = String(amount).trim();
    if (!str) return '';
    if (str.includes('3000') || str.includes('3.000')) return 'Bs. 3.000';
    if (str.includes('2000') || str.includes('2.000')) return 'Bs. 2.000';
    if (str.includes('1000') || str.includes('1.000')) return 'Bs. 1.000';
    if (str.includes('500')) return 'Bs. 500';
    if (str.includes('250')) return 'Bs. 250';
    if (str.includes('100')) return 'Bs. 100';
    return str.startsWith('Bs.') ? str : `Bs. ${str}`;
  }, [amount]);

  const scallopD = useMemo(() => makeScallopPath(200, 200, 18, 126, 114), []);
  const centerStarD = useMemo(() => makeStar(200, 252, 13, 6), []);
  const leftStarD = useMemo(() => makeStar(170, 246, 10, 4.8), []);
  const rightStarD = useMemo(() => makeStar(230, 246, 10, 4.8), []);

  if (!displayAmount) return null;

  const fontSize = displayAmount.length > 8 ? 42 : displayAmount.length > 7 ? 46 : 50;

  return (
    <div className={`relative aspect-square select-none flex items-center justify-center ${className}`}>
      {/* ================= WATER PEDESTAL / SUPPORT FOUNDATION ================= */}
      {isOnWater ? (
        <>
          {/* 1. Deep liquid contact pool under ball */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-[130%] h-[36%] bg-[#0284c7]/55 blur-xl rounded-[50%] pointer-events-none" />
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[95%] h-[24%] bg-[#0369a1]/70 blur-md rounded-[50%] pointer-events-none" />

          {/* 2. Concentric animated water ripples expanding from under the ball */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[120%] h-[32%] pointer-events-none flex items-center justify-center">
            <span
              className="absolute inset-0 rounded-[50%] border-2 border-cyan-100/90 shadow-[0_0_10px_#38bdf8] animate-ping"
              style={{ animationDuration: '2.4s' }}
            />
            <span className="absolute w-[85%] h-[80%] rounded-[50%] border border-white/90" />
            <span className="absolute w-[140%] h-[130%] rounded-[50%] border border-cyan-300/40" />
          </div>

          {/* 3. Meniscus water rim where the sphere breaks the surface tension */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[76%] h-[18%] bg-gradient-to-t from-[#38bdf8]/80 via-[#bae6fd]/50 to-transparent blur-[1px] rounded-[50%] pointer-events-none ring-1 ring-cyan-200/80" />

          {/* 4. Soft flipped reflection of the golden prize ball in the spilled water */}
          <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 w-[75%] h-[26%] opacity-35 blur-[2px] rounded-[50%] bg-gradient-to-b from-[#FDC32B]/85 via-[#38bdf8]/40 to-transparent pointer-events-none" />
        </>
      ) : (
        <>
          {/* Normal floor contact shadow when not on water */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[85%] h-[24%] bg-black/85 blur-md rounded-[50%] pointer-events-none" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[115%] h-[32%] bg-[#FDC32B]/45 blur-xl rounded-[50%] pointer-events-none" />
        </>
      )}

      {/* Native 4K Vector SVG Prize Sphere: 100% razor sharp, zero blurriness, infinite DPI clarity */}
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full relative z-10 drop-shadow-[0_16px_32px_rgba(0,0,0,0.55)] overflow-visible"
        style={{
          filter: 'drop-shadow(0 14px 28px rgba(0,0,0,0.45)) drop-shadow(0 0 18px rgba(253,195,43,0.35))',
        }}
      >
        <defs>
          {/* 3D Sphere Radial Gradient with specular point at upper-right */}
          <radialGradient id="sphereGrad" cx="68%" cy="26%" r="78%">
            <stop offset="0%" stopColor="#FFFEE5" />
            <stop offset="14%" stopColor="#FFEA58" />
            <stop offset="38%" stopColor="#FDC32B" />
            <stop offset="65%" stopColor="#F59E0B" />
            <stop offset="85%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </radialGradient>

          {/* Golden ribbon banner gradient */}
          <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF176" />
            <stop offset="25%" stopColor="#FFD54F" />
            <stop offset="60%" stopColor="#FFCA28" />
            <stop offset="100%" stopColor="#FFA000" />
          </linearGradient>

          {/* Golden rim accent gradient */}
          <linearGradient id="goldRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF9C4" />
            <stop offset="50%" stopColor="#FDC32B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Soft drop shadow filters */}
          <filter id="medallionShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="5" stdDeviation="5" floodColor="#000000" floodOpacity="0.6" />
          </filter>
          <filter id="ribbonShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="4" stdDeviation="4.5" floodColor="#000000" floodOpacity="0.55" />
          </filter>

          {/* Arc path for the curved text GANASTE */}
          <path id="arcGanaste" d="M 112,185 A 92,92 0 0,1 288,185" fill="none" />
        </defs>

        {/* 1. Base 3D Sphere */}
        <circle cx="200" cy="200" r="185" fill="url(#sphereGrad)" />

        {/* 2. Scalloped Black Medallion (Roseta de 18 festones) */}
        <path
          d={scallopD}
          fill="#0c0d11"
          stroke="url(#goldRimGrad)"
          strokeWidth="3.2"
          filter="url(#medallionShadow)"
        />

        {/* Inner concentric golden accent outline */}
        <circle
          cx="200"
          cy="200"
          r="98"
          fill="none"
          stroke="url(#goldRimGrad)"
          strokeWidth="1.8"
          opacity="0.85"
        />

        {/* 3. Curved Text: GANASTE (Ultra-sharp white vector letters) */}
        <text
          fill="#ffffff"
          fontWeight="900"
          fontSize="23"
          fontFamily="'Inter', system-ui, -apple-system, sans-serif"
          letterSpacing="3.5px"
        >
          <textPath href="#arcGanaste" startOffset="50%" textAnchor="middle">
            GANASTE
          </textPath>
        </text>

        {/* 4. 3 Brilliant White Stars */}
        <path d={centerStarD} fill="#ffffff" />
        <path d={leftStarD} fill="#ffffff" opacity="0.95" />
        <path d={rightStarD} fill="#ffffff" opacity="0.95" />

        {/* 5. Diagonal Ribbon Banner (-13.5deg tilt) with Prize Amount */}
        <g transform="rotate(-13.5 200 200)">
          <rect
            x="62"
            y="163"
            width="276"
            height="74"
            rx="37"
            fill="url(#ribbonGrad)"
            stroke="#FFE082"
            strokeWidth="2.2"
            filter="url(#ribbonShadow)"
          />
          <text
            x="200"
            y="218"
            textAnchor="middle"
            fill="#050505"
            fontWeight="900"
            fontSize={fontSize}
            fontFamily="'Anton', Impact, 'Arial Black', sans-serif"
            letterSpacing="-0.5px"
          >
            {displayAmount}
          </text>
        </g>

        {/* 6. Realistic 3D Specular Curved Highlights */}
        {/* Primary upper-right light glint */}
        <ellipse
          cx="272"
          cy="92"
          rx="52"
          ry="20"
          transform="rotate(32 272 92)"
          fill="rgba(255, 255, 255, 0.45)"
        />
        <ellipse
          cx="274"
          cy="90"
          rx="28"
          ry="10"
          transform="rotate(32 274 90)"
          fill="rgba(255, 255, 255, 0.85)"
        />

        {/* Secondary ambient specular crescent */}
        <path
          d="M 85,150 A 150,150 0 0,1 220,55"
          fill="none"
          stroke="rgba(255, 255, 255, 0.28)"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Lower rim bounce light */}
        <path
          d="M 95,315 Q 200,378 305,315"
          fill="none"
          stroke="rgba(255, 255, 255, 0.22)"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
