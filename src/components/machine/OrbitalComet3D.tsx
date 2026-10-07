import React, { useEffect, useRef } from 'react';

interface TrailPoint {
  x: number;
  y: number;
  z: number;
}

interface Stardust {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  color: string;
}

/**
 * OrbitalComet3D: True 3D ring orbit encircling the appliances like the Whirlpool logo ring.
 * - Back arc (z <= 0): Sweeps across the back, passing BEHIND the refrigerator (rendered on backCanvas at z-[8]).
 * - Front arc (z > 0): Sweeps across the front, passing IN FRONT of the washer and stage (rendered on frontCanvas at z-[22]).
 * - Inclined upwards (~ -28°) echoing the iconic Whirlpool swirl.
 * - Seamless depth transition so the comet NEVER gets lost inside the washer.
 */
export const OrbitalComet3D: React.FC = () => {
  const backCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const frontCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const backCanvas = backCanvasRef.current;
    const frontCanvas = frontCanvasRef.current;
    if (!backCanvas || !frontCanvas) return;

    const backCtx = backCanvas.getContext('2d');
    const frontCtx = frontCanvas.getContext('2d');
    if (!backCtx || !frontCtx) return;

    let animId: number;
    let width = (backCanvas.width = frontCanvas.width = backCanvas.offsetWidth || 960);
    let height = (backCanvas.height = frontCanvas.height = backCanvas.offsetHeight || 540);

    const handleResize = () => {
      if (!backCanvas || !frontCanvas) return;
      width = backCanvas.width = frontCanvas.width = backCanvas.offsetWidth || 960;
      height = backCanvas.height = frontCanvas.height = backCanvas.offsetHeight || 540;
    };
    window.addEventListener('resize', handleResize);

    // Orbit parameters
    const ORBIT_PERIOD = 7.8; // seconds per full orbit
    const TILT_ANGLE = -0.48; // ~ -27.5 degrees (upward tilt of Whirlpool logo ring)
    const cosTilt = Math.cos(TILT_ANGLE);
    const sinTilt = Math.sin(TILT_ANGLE);

    const trail: TrailPoint[] = [];
    const MAX_TRAIL = 50;
    const stardust: Stardust[] = [];

    const startTime = performance.now();

    const render = (now: number) => {
      backCtx.clearRect(0, 0, width, height);
      frontCtx.clearRect(0, 0, width, height);

      const elapsed = (now - startTime) / 1000;
      // Theta runs 0 -> 2pi over the period
      const theta = (elapsed / ORBIT_PERIOD) * Math.PI * 2;

      // Appliance Stage Center & Radii
      const cx = width * 0.50;
      const cy = height * 0.50;
      const rx = width * 0.45;
      const ry = height * 0.22;

      // Parametric trajectory:
      // theta in [0, pi]: lower/front arc (z > 0) -> sweeps across FRONT of washer and stage
      // theta in [pi, 2pi]: upper/back arc (z <= 0) -> sweeps BEHIND the refrigerator and top
      // By using -cos(theta), at theta=0 it starts on the left, travels across the front to the right at theta=pi
      const rawX = -rx * Math.cos(theta);
      const rawY = ry * Math.sin(theta);
      const cometZ = Math.sin(theta); // > 0 for front arc, <= 0 for back arc

      // Screen rotated coordinates
      const cometX = cx + (rawX * cosTilt - rawY * sinTilt);
      const cometY = cy + (rawX * sinTilt + rawY * cosTilt);

      trail.unshift({ x: cometX, y: cometY, z: cometZ });
      if (trail.length > MAX_TRAIL) trail.pop();

      // 1. Draw Faint Whirlpool Orbital Guide Ring
      // Back half (sin <= 0) on backCtx, front half (sin > 0) on frontCtx
      backCtx.save();
      backCtx.translate(cx, cy);
      backCtx.rotate(TILT_ANGLE);
      backCtx.beginPath();
      backCtx.ellipse(0, 0, rx, ry, 0, Math.PI, Math.PI * 2);
      backCtx.strokeStyle = 'rgba(253, 195, 43, 0.12)';
      backCtx.lineWidth = 1.4;
      backCtx.setLineDash([8, 12]);
      backCtx.stroke();
      backCtx.restore();

      frontCtx.save();
      frontCtx.translate(cx, cy);
      frontCtx.rotate(TILT_ANGLE);
      frontCtx.beginPath();
      frontCtx.ellipse(0, 0, rx, ry, 0, 0, Math.PI);
      frontCtx.strokeStyle = 'rgba(253, 195, 43, 0.15)';
      frontCtx.lineWidth = 1.4;
      frontCtx.setLineDash([8, 12]);
      frontCtx.stroke();
      frontCtx.restore();

      // 2. Emit Translucent Stardust Sparks
      if (Math.random() < 0.55 && stardust.length < 24) {
        stardust.push({
          x: cometX + (Math.random() - 0.5) * 6,
          y: cometY + (Math.random() - 0.5) * 6,
          z: cometZ,
          vx: (Math.random() - 0.5) * 0.5 + Math.sin(theta) * 0.25,
          vy: (Math.random() - 0.5) * 0.5 - Math.cos(theta) * 0.2,
          size: 1.2 + Math.random() * 1.6,
          alpha: cometZ > 0 ? 0.6 : 0.35,
          life: 0.55 + Math.random() * 0.4,
          color: Math.random() > 0.4 ? '#FFFFFF' : '#FFD95E',
        });
      }

      // Update & Render Stardust Particles
      for (let i = stardust.length - 1; i >= 0; i--) {
        const p = stardust[i];
        p.life -= 0.016;
        if (p.life <= 0) {
          stardust.splice(i, 1);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.alpha = Math.max(0, p.life * (p.z > 0 ? 0.65 : 0.35));

        const targetCtx = p.z > 0 ? frontCtx : backCtx;
        targetCtx.save();
        targetCtx.globalAlpha = p.alpha;
        targetCtx.fillStyle = p.color;
        targetCtx.beginPath();
        targetCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.restore();
      }

      // 3. Render Curving Translucent Comet Tail Ribbon
      // Splits seamlessly between backCtx (z <= 0) and frontCtx (z > 0)
      if (trail.length > 2) {
        for (let i = 0; i < trail.length - 1; i++) {
          const pt = trail[i];
          const next = trail[i + 1];
          const factor = 1 - i / trail.length; // 1 at head -> 0 at tail tip

          const ribbonWidth = 5.2 * factor + 0.6;

          const drawSubSegment = (
            targetCtx: CanvasRenderingContext2D,
            x1: number,
            y1: number,
            x2: number,
            y2: number,
            isFront: boolean
          ) => {
            const depthFactor = isFront ? 0.52 : 0.28;
            const alpha = Math.pow(factor, 1.2) * depthFactor;

            targetCtx.save();
            // Outer glowing amber ribbon
            targetCtx.beginPath();
            targetCtx.moveTo(x1, y1);
            targetCtx.lineTo(x2, y2);
            targetCtx.lineWidth = ribbonWidth;
            targetCtx.lineCap = 'round';
            targetCtx.strokeStyle = `rgba(255, 217, 94, ${alpha})`;
            targetCtx.stroke();

            // Hot white central core of ribbon
            targetCtx.beginPath();
            targetCtx.moveTo(x1, y1);
            targetCtx.lineTo(x2, y2);
            targetCtx.lineWidth = ribbonWidth * 0.38;
            targetCtx.strokeStyle = `rgba(255, 255, 255, ${alpha * 1.15})`;
            targetCtx.stroke();
            targetCtx.restore();
          };

          const ptFront = pt.z > 0;
          const nextFront = next.z > 0;

          if (ptFront && nextFront) {
            drawSubSegment(frontCtx, pt.x, pt.y, next.x, next.y, true);
          } else if (!ptFront && !nextFront) {
            drawSubSegment(backCtx, pt.x, pt.y, next.x, next.y, false);
          } else {
            // Segment crosses boundary
            const tSplit = Math.abs(pt.z) / (Math.abs(pt.z) + Math.abs(next.z) + 0.0001);
            const midX = pt.x + (next.x - pt.x) * tSplit;
            const midY = pt.y + (next.y - pt.y) * tSplit;

            if (ptFront) {
              drawSubSegment(frontCtx, pt.x, pt.y, midX, midY, true);
              drawSubSegment(backCtx, midX, midY, next.x, next.y, false);
            } else {
              drawSubSegment(backCtx, pt.x, pt.y, midX, midY, false);
              drawSubSegment(frontCtx, midX, midY, next.x, next.y, true);
            }
          }
        }
      }

      // 4. Render Glowing Comet Head & 4-Point Star Flare
      const isCometFront = cometZ > 0;
      const headCtx = isCometFront ? frontCtx : backCtx;
      const depthScale = 1 + (cometZ + 1) * 0.18;
      const headAlpha = isCometFront ? 0.72 : 0.42;

      headCtx.save();
      headCtx.translate(cometX, cometY);
      headCtx.globalAlpha = headAlpha;

      // Soft Radial Halo
      const haloGrad = headCtx.createRadialGradient(0, 0, 0, 0, 0, 28 * depthScale);
      haloGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      haloGrad.addColorStop(0.3, 'rgba(255, 217, 94, 0.45)');
      haloGrad.addColorStop(1, 'rgba(253, 195, 43, 0)');
      headCtx.fillStyle = haloGrad;
      headCtx.beginPath();
      headCtx.arc(0, 0, 28 * depthScale, 0, Math.PI * 2);
      headCtx.fill();

      // Diamond 4-Point Lens Flare Spikes
      const flareLen = 20 * depthScale;
      const flareWidth = 2.4 * depthScale;

      headCtx.rotate(elapsed * 1.2);
      headCtx.fillStyle = '#FFFFFF';

      headCtx.beginPath();
      headCtx.moveTo(-flareLen, 0);
      headCtx.lineTo(0, flareWidth);
      headCtx.lineTo(flareLen, 0);
      headCtx.lineTo(0, -flareWidth);
      headCtx.closePath();
      headCtx.fill();

      headCtx.beginPath();
      headCtx.moveTo(0, -flareLen);
      headCtx.lineTo(flareWidth, 0);
      headCtx.lineTo(0, flareLen);
      headCtx.lineTo(-flareWidth, 0);
      headCtx.closePath();
      headCtx.fill();

      // Nucleus Star
      headCtx.beginPath();
      headCtx.arc(0, 0, 3.8 * depthScale, 0, Math.PI * 2);
      headCtx.fillStyle = '#FFFFFF';
      headCtx.fill();

      headCtx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      {/* Back canvas layer (behind Heladera at z-10 and appliances) */}
      <canvas
        ref={backCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-[8] select-none"
      />
      {/* Front canvas layer (in front of Lavadora at z-20, sweeping across front of stage) */}
      <canvas
        ref={frontCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-[22] select-none"
      />
    </>
  );
};
