import React from 'react';

interface WaterPuddleUnderPodiumProps {
  phase: 'none' | 'flushing' | 'draining' | 'drained';
  isAerial?: boolean;
  layer?: 'back' | 'front' | 'all';
  className?: string;
}

export const WaterPuddleUnderPodium: React.FC<WaterPuddleUnderPodiumProps> = ({
  phase,
  isAerial = false,
  layer = 'all',
  className = '',
}) => {
  // If not activated yet, do not render
  if (phase === 'none') {
    return null;
  }

  const isFlushing = phase === 'flushing';
  const isSettled = phase === 'draining' || phase === 'drained';

  // ================= 1. BACK LAYER (UNDERNEATH & BEHIND PODIUM, Z-8) =================
  if (layer === 'back') {
    return (
      <div
        className={`absolute left-1/2 -translate-x-1/2 pointer-events-none select-none transition-all duration-1000 ${
          isFlushing ? 'animate-puddle-spread' : 'opacity-100'
        } ${className}`}
        style={{
          bottom: isAerial ? '-20%' : '-15%',
          width: isAerial ? '170%' : '155%',
          aspectRatio: '1892 / 380',
          zIndex: 8,
          transformOrigin: '50% 35%',
        }}
      >
        {/* Deep wet floor absorption stain spreading wide on the floor behind and around the support */}
        <div className="absolute inset-x-2 -inset-y-4 bg-[#0369a1]/40 blur-2xl rounded-[50%]" />
        <div className="absolute inset-x-10 inset-y-0 bg-[#0284c7]/50 blur-xl rounded-[50%]" />

        {/* Wide lateral liquid wings spreading to the left and right */}
        <svg
          viewBox="0 0 1400 320"
          className="w-full h-full relative z-10 overflow-visible opacity-80"
          preserveAspectRatio="none"
        >
          <defs>
            <radialGradient id="puddleBackFluid" cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.80" />
              <stop offset="40%" stopColor="#0284c7" stopOpacity="0.70" />
              <stop offset="80%" stopColor="#0369a1" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#075985" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path
            d="M 60,160 
               C 140,90 280,75 460,85 
               C 620,70 780,68 940,85 
               C 1120,75 1260,95 1340,150 
               C 1390,195 1300,240 1180,255 
               C 1020,270 880,250 720,265 
               C 560,250 420,270 260,255 
               C 130,240 40,205 60,160 Z"
            fill="url(#puddleBackFluid)"
          />

          {/* Far-wing expanding ripples (lateral puddles active during expansion) */}
          {isFlushing && (
            <>
              <ellipse
                cx="240"
                cy="175"
                rx="90"
                ry="22"
                fill="none"
                stroke="rgba(255, 255, 255, 0.7)"
                strokeWidth="1.6"
                className="animate-ping"
                style={{ animationDuration: '1.8s', animationDelay: '0.4s' }}
              />
              <ellipse
                cx="1160"
                cy="175"
                rx="90"
                ry="22"
                fill="none"
                stroke="rgba(255, 255, 255, 0.7)"
                strokeWidth="1.6"
                className="animate-ping"
                style={{ animationDuration: '1.8s', animationDelay: '0.6s' }}
              />
            </>
          )}
        </svg>
      </div>
    );
  }

  // ================= 2. FRONT LAYER (IN FRONT OF PODIUM, CRADLING PRIZE BALL, Z-22) =================
  if (layer === 'front') {
    return (
      <div
        className={`absolute left-1/2 -translate-x-1/2 pointer-events-none select-none transition-all duration-1000 ${
          isFlushing ? 'animate-puddle-spread' : 'opacity-100'
        } ${className}`}
        style={{
          bottom: isAerial ? '-18%' : '-12%',
          width: isAerial ? '155%' : '140%',
          aspectRatio: '1892 / 340',
          zIndex: 22,
          transformOrigin: '50% 30%',
        }}
      >
        {/* Wet glossy sheen spilling forward over the podium front apron */}
        <div className="absolute inset-x-8 -top-2 inset-y-1 bg-[#38bdf8]/35 blur-lg rounded-[50%]" />

        {/* Central foreground liquid pool providing the supporting pedestal for the prize ball */}
        <svg
          viewBox="0 0 1400 320"
          className="w-full h-full relative z-10 overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Luminous electric cyan & sapphire gradient */}
            <radialGradient id="puddleFrontFluid" cx="50%" cy="45%" r="52%">
              <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.95" />
              <stop offset="22%" stopColor="#38bdf8" stopOpacity="0.90" />
              <stop offset="50%" stopColor="#0284c7" stopOpacity="0.82" />
              <stop offset="78%" stopColor="#0369a1" stopOpacity="0.65" />
              <stop offset="95%" stopColor="#075985" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>

            {/* Liquid caustic surface shimmer gradient */}
            <linearGradient id="frontCausticShimmer" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="25%" stopColor="#e0f2fe" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="75%" stopColor="#38bdf8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Wet edge specular filter */}
            <filter id="puddleFrontWetFilter" x="-10%" y="-20%" width="120%" height="140%">
              <feGaussianBlur stdDeviation="3.2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Organic spilled liquid body overflowing in front of the podium */}
          <path
            d="M 160,175 
               C 280,120 440,105 600,110 
               C 740,102 880,115 1020,135 
               C 1180,155 1250,195 1200,235 
               C 1140,270 990,285 850,290 
               C 700,295 550,288 420,280 
               C 270,270 140,240 160,175 Z"
            fill="url(#puddleFrontFluid)"
            filter="url(#puddleFrontWetFilter)"
          />

          {/* Inner reflective cyan fluid meniscus */}
          <path
            d="M 280,175 
               C 420,130 580,125 720,128 
               C 860,125 1000,140 1080,175 
               C 1130,205 1040,250 920,260 
               C 780,270 640,265 500,258 
               C 360,250 240,215 280,175 Z"
            fill="rgba(56, 189, 248, 0.5)"
          />

          {/* Dynamic caustics on the water surface */}
          <g className="animate-caustic-waves">
            <path
              d="M 360,155 Q 700,100 1040,155 Q 700,135 360,155 Z"
              fill="url(#frontCausticShimmer)"
              opacity="0.9"
            />
            <path
              d="M 440,200 Q 700,165 960,200 Q 700,185 440,200 Z"
              fill="url(#frontCausticShimmer)"
              opacity="0.75"
            />
          </g>

          {/* Dedicated Water Cradle: rings and liquid highlight directly where the prize ball settles */}
          <g>
            {/* Liquid contact pool directly under the prize ball */}
            <ellipse
              cx="700"
              cy="210"
              rx="155"
              ry="38"
              fill="rgba(2, 132, 199, 0.7)"
              filter="url(#puddleFrontWetFilter)"
            />
            {/* Luminous cyan meniscus rim */}
            <ellipse
              cx="700"
              cy="208"
              rx="135"
              ry="32"
              fill="none"
              stroke="rgba(224, 242, 254, 0.9)"
              strokeWidth="2.5"
            />
            {/* Expanding water ripple rings radiating from under the ball */}
            <ellipse
              cx="700"
              cy="210"
              rx="210"
              ry="50"
              fill="none"
              stroke="rgba(56, 189, 248, 0.65)"
              strokeWidth="1.8"
              strokeDasharray="8 6"
            />
          </g>

          {/* ================= MULTIPLE RIPPLE EPICENTERS ACROSS THE ENTIRE PUDDLE ================= */}
          {/* Ripple Center 1: Far Left (x=330, y=190) */}
          {isFlushing && (
            <g>
              <ellipse
                cx="330"
                cy="190"
                rx="85"
                ry="22"
                fill="none"
                stroke="rgba(255, 255, 255, 0.85)"
                strokeWidth="1.8"
                className="animate-ping"
                style={{ animationDuration: '1.4s', animationDelay: '0.4s' }}
              />
              <ellipse
                cx="330"
                cy="190"
                rx="145"
                ry="34"
                fill="none"
                stroke="rgba(186, 230, 253, 0.7)"
                strokeWidth="1.4"
                className="animate-ping"
                style={{ animationDuration: '1.9s', animationDelay: '0.7s' }}
              />
            </g>
          )}

          {/* Ripple Center 2: Mid Left (x=520, y=180) */}
          {isFlushing && (
            <g>
              <ellipse
                cx="520"
                cy="180"
                rx="105"
                ry="26"
                fill="none"
                stroke="rgba(255, 255, 255, 0.85)"
                strokeWidth="2.0"
                className="animate-ping"
                style={{ animationDuration: '1.3s', animationDelay: '0.2s' }}
              />
              <ellipse
                cx="520"
                cy="180"
                rx="175"
                ry="42"
                fill="none"
                stroke="rgba(56, 189, 248, 0.65)"
                strokeWidth="1.5"
                className="animate-ping"
                style={{ animationDuration: '1.8s', animationDelay: '0.5s' }}
              />
            </g>
          )}

          {/* Ripple Center 3: Center (x=700, y=175) */}
          {isFlushing && (
            <g>
              <ellipse
                cx="700"
                cy="175"
                rx="190"
                ry="45"
                fill="none"
                stroke="rgba(255, 255, 255, 0.95)"
                strokeWidth="2.5"
                className="animate-ping"
                style={{ animationDuration: '1.2s' }}
              />
              <ellipse
                cx="700"
                cy="175"
                rx="350"
                ry="75"
                fill="none"
                stroke="rgba(186, 230, 253, 0.8)"
                strokeWidth="2.0"
                className="animate-ping"
                style={{ animationDuration: '1.7s', animationDelay: '0.35s' }}
              />
              <ellipse
                cx="700"
                cy="175"
                rx="490"
                ry="95"
                fill="none"
                stroke="rgba(56, 189, 248, 0.55)"
                strokeWidth="1.6"
                className="animate-ping"
                style={{ animationDuration: '2.1s', animationDelay: '0.7s' }}
              />
            </g>
          )}

          {/* Ripple Center 4: Mid Right (x=880, y=180) */}
          {isFlushing && (
            <g>
              <ellipse
                cx="880"
                cy="180"
                rx="105"
                ry="26"
                fill="none"
                stroke="rgba(255, 255, 255, 0.85)"
                strokeWidth="2.0"
                className="animate-ping"
                style={{ animationDuration: '1.35s', animationDelay: '0.25s' }}
              />
              <ellipse
                cx="880"
                cy="180"
                rx="175"
                ry="42"
                fill="none"
                stroke="rgba(56, 189, 248, 0.65)"
                strokeWidth="1.5"
                className="animate-ping"
                style={{ animationDuration: '1.85s', animationDelay: '0.55s' }}
              />
            </g>
          )}

          {/* Ripple Center 5: Far Right (x=1070, y=190) */}
          {isFlushing && (
            <g>
              <ellipse
                cx="1070"
                cy="190"
                rx="85"
                ry="22"
                fill="none"
                stroke="rgba(255, 255, 255, 0.85)"
                strokeWidth="1.8"
                className="animate-ping"
                style={{ animationDuration: '1.45s', animationDelay: '0.45s' }}
              />
              <ellipse
                cx="1070"
                cy="190"
                rx="145"
                ry="34"
                fill="none"
                stroke="rgba(186, 230, 253, 0.7)"
                strokeWidth="1.4"
                className="animate-ping"
                style={{ animationDuration: '1.95s', animationDelay: '0.75s' }}
              />
            </g>
          )}

          {/* Ripple Center 6 & 7: Front Expanding Lobes (x=570, y=250 and x=830, y=250) */}
          {isFlushing && (
            <g>
              <ellipse
                cx="570"
                cy="250"
                rx="75"
                ry="20"
                fill="none"
                stroke="rgba(255, 255, 255, 0.8)"
                strokeWidth="1.5"
                className="animate-ping"
                style={{ animationDuration: '1.5s', animationDelay: '0.3s' }}
              />
              <ellipse
                cx="830"
                cy="250"
                rx="75"
                ry="20"
                fill="none"
                stroke="rgba(255, 255, 255, 0.8)"
                strokeWidth="1.5"
                className="animate-ping"
                style={{ animationDuration: '1.5s', animationDelay: '0.6s' }}
              />
            </g>
          )}

          {/* Calm, multi-point water ripples when settled */}
          {isSettled && (
            <g>
              <ellipse
                cx="700"
                cy="210"
                rx="280"
                ry="65"
                fill="none"
                stroke="rgba(255, 255, 255, 0.55)"
                strokeWidth="1.2"
                strokeDasharray="6 8"
              />
              <ellipse
                cx="420"
                cy="195"
                rx="120"
                ry="30"
                fill="none"
                stroke="rgba(255, 255, 255, 0.35)"
                strokeWidth="1.0"
                strokeDasharray="4 6"
              />
              <ellipse
                cx="980"
                cy="195"
                rx="120"
                ry="30"
                fill="none"
                stroke="rgba(255, 255, 255, 0.35)"
                strokeWidth="1.0"
                strokeDasharray="4 6"
              />
            </g>
          )}
        </svg>

        {/* HTML/CSS Fluid Ripple Nodes expanding at multiple points across the width */}
        {isFlushing && (
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            {/* Left Zone */}
            <div className="absolute left-[24%] top-[52%] -translate-x-1/2 -translate-y-1/2">
              <span
                className="absolute w-36 h-12 rounded-[50%] border-2 border-cyan-100/90 pointer-events-none -translate-x-1/2 -translate-y-1/2"
                style={{ animation: 'waterRippleExpand 1.3s cubic-bezier(0,0,0.2,1) infinite 0.35s' }}
              />
              <span
                className="absolute w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#38bdf8]"
                style={{ animation: 'splashDropletUp 0.6s ease-out infinite 0.2s', ['--drop-x' as string]: '-25px', ['--drop-y' as string]: '-35px' }}
              />
            </div>

            {/* Mid Left Zone */}
            <div className="absolute left-[38%] top-[48%] -translate-x-1/2 -translate-y-1/2">
              <span
                className="absolute w-44 h-14 rounded-[50%] border border-white/85 pointer-events-none -translate-x-1/2 -translate-y-1/2"
                style={{ animation: 'waterRippleExpand 1.2s cubic-bezier(0,0,0.2,1) infinite 0.15s' }}
              />
            </div>

            {/* Center Main Zone */}
            <div className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2">
              <span
                className="absolute w-60 h-18 rounded-[50%] border-2 border-cyan-100/95 pointer-events-none -translate-x-1/2 -translate-y-1/2"
                style={{ animation: 'waterRippleExpand 1.1s cubic-bezier(0,0,0.2,1) infinite' }}
              />
              <span
                className="absolute w-92 h-26 rounded-[50%] border border-white/85 pointer-events-none -translate-x-1/2 -translate-y-1/2"
                style={{ animation: 'waterRippleExpand 1.1s cubic-bezier(0,0,0.2,1) infinite 0.4s' }}
              />
              {/* Leaping droplets in center */}
              <span
                className="absolute w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#38bdf8]"
                style={{ animation: 'splashDropletUp 0.65s ease-out infinite', ['--drop-x' as string]: '-45px', ['--drop-y' as string]: '-45px' }}
              />
              <span
                className="absolute w-3 h-3 rounded-full bg-cyan-100 shadow-[0_0_8px_#38bdf8]"
                style={{ animation: 'splashDropletUp 0.6s ease-out infinite 0.15s', ['--drop-x' as string]: '50px', ['--drop-y' as string]: '-50px' }}
              />
            </div>

            {/* Mid Right Zone */}
            <div className="absolute left-[62%] top-[48%] -translate-x-1/2 -translate-y-1/2">
              <span
                className="absolute w-44 h-14 rounded-[50%] border border-white/85 pointer-events-none -translate-x-1/2 -translate-y-1/2"
                style={{ animation: 'waterRippleExpand 1.2s cubic-bezier(0,0,0.2,1) infinite 0.25s' }}
              />
            </div>

            {/* Right Zone */}
            <div className="absolute left-[76%] top-[52%] -translate-x-1/2 -translate-y-1/2">
              <span
                className="absolute w-36 h-12 rounded-[50%] border-2 border-cyan-100/90 pointer-events-none -translate-x-1/2 -translate-y-1/2"
                style={{ animation: 'waterRippleExpand 1.35s cubic-bezier(0,0,0.2,1) infinite 0.45s' }}
              />
              <span
                className="absolute w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#38bdf8]"
                style={{ animation: 'splashDropletUp 0.65s ease-out infinite 0.3s', ['--drop-x' as string]: '25px', ['--drop-y' as string]: '-35px' }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ================= 3. ALL / INTEGRATED LAYER =================
  return (
    <div
      className={`absolute left-1/2 -translate-x-1/2 pointer-events-none select-none transition-all duration-1000 ${
        isFlushing ? 'animate-puddle-spread' : 'opacity-100'
      } ${className}`}
      style={{
        bottom: isAerial ? '-18%' : '-13%',
        width: isAerial ? '165%' : '150%',
        aspectRatio: '1892 / 380',
        zIndex: 8,
        transformOrigin: '50% 35%',
      }}
    >
      <div className="absolute inset-x-2 -inset-y-3 bg-[#0369a1]/40 blur-2xl rounded-[50%]" />
      <div className="absolute inset-x-10 inset-y-1 bg-[#0284c7]/50 blur-xl rounded-[50%]" />
      <svg
        viewBox="0 0 1400 320"
        className="w-full h-full relative z-10 overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <radialGradient id="puddleDeepFluidAll" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.95" />
            <stop offset="22%" stopColor="#38bdf8" stopOpacity="0.88" />
            <stop offset="52%" stopColor="#0284c7" stopOpacity="0.80" />
            <stop offset="78%" stopColor="#0369a1" stopOpacity="0.65" />
            <stop offset="94%" stopColor="#075985" stopOpacity="0.40" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="causticLightShimmerAll" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="20%" stopColor="#e0f2fe" stopOpacity="0.45" />
            <stop offset="48%" stopColor="#ffffff" stopOpacity="0.90" />
            <stop offset="72%" stopColor="#38bdf8" stopOpacity="0.60" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter id="puddleWetEdgeFilterAll" x="-10%" y="-20%" width="120%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <path
          d="M 90,170 C 160,105 280,85 440,95 C 580,75 720,70 860,90 C 1010,80 1160,100 1260,150 C 1340,195 1280,250 1160,265 C 1020,285 880,265 740,280 C 590,265 440,285 300,270 C 170,255 70,220 90,170 Z"
          fill="url(#puddleDeepFluidAll)"
          filter="url(#puddleWetEdgeFilterAll)"
        />
        <path
          d="M 180,165 C 290,115 460,105 630,110 C 800,105 970,118 1100,160 C 1170,195 1080,240 940,248 C 800,255 650,248 510,252 C 340,245 220,210 180,165 Z"
          fill="rgba(56, 189, 248, 0.45)"
        />
        <g className="animate-caustic-waves">
          <path d="M 280,145 Q 700,90 1120,145 Q 700,120 280,145 Z" fill="url(#causticLightShimmerAll)" opacity="0.85" />
          <path d="M 380,190 Q 700,155 1020,190 Q 700,175 380,190 Z" fill="url(#causticLightShimmerAll)" opacity="0.65" />
        </g>
      </svg>
    </div>
  );
};
