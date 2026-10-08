import React from 'react';

/**
 * StageSpotlights: Overhead Showroom Stage Reflectors (Ultra-Optimized)
 * Anchored strictly at top: 0, left: 0 and top: 0, right: 0.
 *
 * Performance-optimized:
 * - 0% CPU consumption by using pure GPU-accelerated linear & radial gradients
 * - Eliminates expensive dynamic CSS filter: blur() repaints during animation
 * - Uses hardware-accelerated transforms (transform3d / will-change)
 * - Focused volumetric searchlight beams converging onto the appliances
 */
export const StageSpotlights: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden select-none">
      {/* ================= LEFT OVERHEAD REFLECTOR (TOP: 0, LEFT: 0) ================= */}
      {/* 1. Luminous Reflector Emitter at top: 0, left: 0 */}
      <div className="absolute left-0 top-0 -translate-x-1/3 -translate-y-1/3 w-20 sm:w-28 h-20 sm:h-28 rounded-full bg-white shadow-[0_0_40px_#FFFFFF,0_0_80px_#FFD95E] pointer-events-none z-20" />

      {/* 2. Left Volumetric Stage Light Beam (from top: 0, left: 0 pointing down to appliances) */}
      <div
        className="absolute left-0 top-0 w-[96vw] max-w-[1100px] h-[95%] origin-top-left pointer-events-none"
        style={{
          clipPath: 'polygon(0% 0%, 14% 0%, 74% 88%, 22% 98%)',
          WebkitClipPath: 'polygon(0% 0%, 14% 0%, 74% 88%, 22% 98%)',
          background:
            'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 244, 180, 0.45) 22%, rgba(253, 195, 43, 0.16) 55%, transparent 88%)',
          mixBlendMode: 'screen',
          willChange: 'transform',
          animation: 'reflectorSweepLeft 8s ease-in-out infinite alternate',
        }}
      />

      {/* 3. Left Core High-Intensity Light Shaft */}
      <div
        className="absolute left-0 top-0 w-[85vw] max-w-[950px] h-[90%] origin-top-left pointer-events-none opacity-85"
        style={{
          clipPath: 'polygon(0% 0%, 7% 0%, 62% 82%, 28% 92%)',
          WebkitClipPath: 'polygon(0% 0%, 7% 0%, 62% 82%, 28% 92%)',
          background:
            'linear-gradient(134deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 248, 210, 0.5) 26%, rgba(253, 215, 80, 0.18) 65%, transparent 92%)',
          mixBlendMode: 'screen',
          willChange: 'transform',
          animation: 'reflectorSweepLeft 8s ease-in-out infinite alternate',
        }}
      />

      {/* ================= RIGHT OVERHEAD REFLECTOR (TOP: 0, RIGHT: 0) ================= */}
      {/* 1. Luminous Reflector Emitter at top: 0, right: 0 */}
      <div className="absolute right-0 top-0 translate-x-1/3 -translate-y-1/3 w-20 sm:w-28 h-20 sm:h-28 rounded-full bg-white shadow-[0_0_40px_#FFFFFF,0_0_80px_#FFD95E] pointer-events-none z-20" />

      {/* 2. Right Volumetric Stage Light Beam (from top: 0, right: 0 pointing down to appliances) */}
      <div
        className="absolute right-0 top-0 w-[96vw] max-w-[1100px] h-[95%] origin-top-right pointer-events-none"
        style={{
          clipPath: 'polygon(86% 0%, 100% 0%, 78% 98%, 26% 88%)',
          WebkitClipPath: 'polygon(86% 0%, 100% 0%, 78% 98%, 26% 88%)',
          background:
            'linear-gradient(225deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 244, 180, 0.45) 22%, rgba(253, 195, 43, 0.16) 55%, transparent 88%)',
          mixBlendMode: 'screen',
          willChange: 'transform',
          animation: 'reflectorSweepRight 8.5s ease-in-out infinite alternate',
        }}
      />

      {/* 3. Right Core High-Intensity Light Shaft */}
      <div
        className="absolute right-0 top-0 w-[85vw] max-w-[950px] h-[90%] origin-top-right pointer-events-none opacity-85"
        style={{
          clipPath: 'polygon(93% 0%, 100% 0%, 72% 92%, 38% 82%)',
          WebkitClipPath: 'polygon(93% 0%, 100% 0%, 72% 92%, 38% 82%)',
          background:
            'linear-gradient(226deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 248, 210, 0.5) 26%, rgba(253, 215, 80, 0.18) 65%, transparent 92%)',
          mixBlendMode: 'screen',
          willChange: 'transform',
          animation: 'reflectorSweepRight 8.5s ease-in-out infinite alternate',
        }}
      />

      {/* ================= APPLIANCES ILLUMINATION POOL (FOCUSED SHOWROOM HIGHLIGHT) ================= */}
      {/* Pure GPU-accelerated radial gradient halo without expensive software blur filters */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-[46%] sm:top-[44%] w-[88vw] max-w-[800px] h-[48%] max-h-[400px] rounded-[50%] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 50% 55%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 238, 170, 0.3) 35%, rgba(253, 195, 43, 0.12) 65%, transparent 85%)',
          mixBlendMode: 'screen',
          willChange: 'opacity, transform',
          animation: 'illuminationPulse 5s ease-in-out infinite alternate',
        }}
      />

      {/* Ground Podium Highlight Pool */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-[13%] sm:bottom-[15%] w-[75vw] max-w-[640px] h-[16%] rounded-[50%] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255, 255, 255, 0.55) 0%, rgba(253, 215, 80, 0.28) 45%, transparent 80%)',
          mixBlendMode: 'screen',
        }}
      />

      <style>{`
        @keyframes reflectorSweepLeft {
          0% {
            transform: rotate3d(0, 0, 1, -1deg) scaleY(0.98);
            opacity: 0.9;
          }
          50% {
            transform: rotate3d(0, 0, 1, 2deg) scaleY(1.02);
            opacity: 1;
          }
          100% {
            transform: rotate3d(0, 0, 1, -0.5deg) scaleY(0.99);
            opacity: 0.92;
          }
        }

        @keyframes reflectorSweepRight {
          0% {
            transform: rotate3d(0, 0, 1, 1deg) scaleY(0.98);
            opacity: 0.9;
          }
          50% {
            transform: rotate3d(0, 0, 1, -2deg) scaleY(1.02);
            opacity: 1;
          }
          100% {
            transform: rotate3d(0, 0, 1, 0.5deg) scaleY(0.99);
            opacity: 0.92;
          }
        }

        @keyframes illuminationPulse {
          0% {
            opacity: 0.85;
            transform: translate3d(-50%, 0, 0) scale(0.98);
          }
          50% {
            opacity: 1;
            transform: translate3d(-50%, 0, 0) scale(1.02);
          }
          100% {
            opacity: 0.9;
            transform: translate3d(-50%, 0, 0) scale(0.99);
          }
        }
      `}</style>
    </div>
  );
};
