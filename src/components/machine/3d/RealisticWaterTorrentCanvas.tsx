import React, { useRef, useEffect } from 'react';

interface RealisticWaterTorrentCanvasProps {
  phase: 'none' | 'flushing' | 'draining' | 'drained';
  className?: string;
}

interface WaterDrop {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
  isSplash?: boolean;
}

export const RealisticWaterTorrentCanvas: React.FC<RealisticWaterTorrentCanvasProps> = ({
  phase,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (phase === 'none' || phase === 'drained') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    const drops: WaterDrop[] = [];

    // Internal virtual canvas resolution
    const width = 380;
    const height = 480;
    canvas.width = width;
    canvas.height = height;

    const spawnDroplets = () => {
      if (phase === 'draining') return;
      // Spawn fluid drops from the lower porthole lip
      const count = phase === 'flushing' ? 5 : 2;
      for (let i = 0; i < count; i++) {
        const spread = (Math.random() - 0.5) * 120;
        drops.push({
          x: width / 2 + spread,
          y: 35 + Math.random() * 25,
          vx: spread * 0.035 + (Math.random() - 0.5) * 1.8,
          vy: 4.5 + Math.random() * 4.5,
          radius: 2 + Math.random() * 3.8,
          alpha: 0.75 + Math.random() * 0.25,
          life: 0,
          maxLife: 55 + Math.random() * 25,
        });
      }
    };

    const render = () => {
      time += 0.05;
      ctx.clearRect(0, 0, width, height);

      const isDraining = phase === 'draining';
      // Graceful stream fadeout when drum finishes emptying
      const streamAlpha = isDraining ? Math.max(0, 1 - time * 0.75) : 1;

      if (streamAlpha > 0.01) {
        // ================= 1. VOLUMETRIC TORRENT STREAM (MAIN WATER GUSH) =================
        ctx.save();
        ctx.globalAlpha = streamAlpha;

        // Origin at washer drum opening mouth
        const topCenterX = width / 2;
        const topY = 22;
        const topHalfWidth = 68;

        // Bottom at podium contact surface
        const bottomCenterX = width / 2;
        const bottomY = height - 32;
        const bottomHalfWidth = 105;

        // Wave oscillations simulating turbulent liquid surface
        const wave1 = Math.sin(time * 3.2) * 7;
        const wave2 = Math.cos(time * 2.6) * 9;

        // Draw parabolic fluid body
        ctx.beginPath();
        // Top lip (arc of the drum opening)
        ctx.moveTo(topCenterX - topHalfWidth, topY);
        ctx.quadraticCurveTo(topCenterX, topY + 20, topCenterX + topHalfWidth, topY);

        // Right falling edge with turbulent curve
        ctx.bezierCurveTo(
          topCenterX + topHalfWidth + 14 + wave1,
          height * 0.35,
          bottomCenterX + bottomHalfWidth + wave2,
          height * 0.7,
          bottomCenterX + bottomHalfWidth,
          bottomY
        );

        // Bottom impact curve
        ctx.quadraticCurveTo(bottomCenterX, bottomY + 24, bottomCenterX - bottomHalfWidth, bottomY);

        // Left falling edge with turbulent curve
        ctx.bezierCurveTo(
          bottomCenterX - bottomHalfWidth - wave2,
          height * 0.7,
          topCenterX - topHalfWidth - 14 + wave1,
          height * 0.35,
          topCenterX - topHalfWidth,
          topY
        );
        ctx.closePath();

        // Deep fluid aquatic gradient (crystal cyan top to deep sapphire bottom)
        const streamGrad = ctx.createLinearGradient(0, topY, 0, bottomY);
        streamGrad.addColorStop(0, 'rgba(224, 242, 254, 0.95)'); // Crystal cyan lip
        streamGrad.addColorStop(0.25, 'rgba(56, 189, 248, 0.90)'); // Translucent sky
        streamGrad.addColorStop(0.65, 'rgba(2, 132, 199, 0.85)');  // Deep ocean body
        streamGrad.addColorStop(1, 'rgba(3, 105, 161, 0.78)');     // Impact density
        ctx.fillStyle = streamGrad;
        ctx.fill();

        // Inner glowing liquid rim outline
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.stroke();

        // ================= 2. INTERNAL SPEED STREAKS & CAUSTICS =================
        ctx.save();
        ctx.clip();

        // Flowing foam and caustic streaks moving downwards rapidly
        const streakCount = 8;
        for (let s = 0; s < streakCount; s++) {
          const streakX = topCenterX - 55 + s * 16 + Math.sin(time * 4 + s) * 6;
          const streakSpeed = 240;
          const streakY = ((time * streakSpeed + s * 70) % (height - 60)) + topY;
          const streakLen = 45 + (s % 3) * 22;

          const streakGrad = ctx.createLinearGradient(streakX, streakY, streakX, streakY + streakLen);
          streakGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          streakGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
          streakGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.fillStyle = streakGrad;
          ctx.beginPath();
          ctx.ellipse(streakX, streakY + streakLen / 2, 2.5, streakLen / 2, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Translucent surface caustics
        ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
        for (let c = 0; c < 5; c++) {
          const cY = ((time * 170 + c * 100) % (height - 80)) + topY;
          ctx.beginPath();
          ctx.ellipse(topCenterX + Math.sin(time + c) * 32, cY, 42, 8, 0.1, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore(); // end clip

        // ================= 3. IMPACT SPLASH CREST AT BASE =================
        const splashRadiusX = bottomHalfWidth * 1.18;
        const splashRadiusY = 18;
        const splashGrad = ctx.createRadialGradient(
          bottomCenterX, bottomY, 12,
          bottomCenterX, bottomY, splashRadiusX
        );
        splashGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
        splashGrad.addColorStop(0.35, 'rgba(186, 230, 253, 0.90)');
        splashGrad.addColorStop(0.75, 'rgba(2, 132, 199, 0.5)');
        splashGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');

        ctx.fillStyle = splashGrad;
        ctx.beginPath();
        ctx.ellipse(bottomCenterX, bottomY + 6, splashRadiusX, splashRadiusY, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // ================= 4. PHYSICS WATER DROPLETS & SPRAY =================
      spawnDroplets();

      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.x += d.vx;
        d.y += d.vy;
        d.vy += 0.42; // gravity acceleration
        d.life++;

        // When reaching podium floor (height - 38): trigger bounce splash
        if (d.y >= height - 40 && !d.isSplash) {
          d.isSplash = true;
          d.vy = -Math.abs(d.vy) * 0.45; // bounce upward
          d.vx = (Math.random() - 0.5) * 6.5; // explode sideways
          d.radius *= 0.78;
        }

        const dropAlpha = d.alpha * (1 - d.life / d.maxLife);

        if (d.life >= d.maxLife || dropAlpha <= 0 || d.y > height) {
          drops.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = dropAlpha;

        // Droplet outer glow halo (fast GPU fill, 0% CPU blur penalty)
        ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius + 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Droplet solid core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fill();

        // Droplet motion trail
        ctx.fillStyle = 'rgba(186, 230, 253, 0.55)';
        ctx.beginPath();
        ctx.ellipse(d.x, d.y - d.vy * 0.8, d.radius * 0.6, d.radius * 1.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [phase]);

  if (phase === 'none' || phase === 'drained') {
    return null;
  }

  return (
    <div
      className={`absolute left-[19%] top-[56%] w-[62%] h-[48%] z-[18] pointer-events-none select-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain pointer-events-none"
      />
    </div>
  );
};
