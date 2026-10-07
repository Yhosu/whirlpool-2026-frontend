import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
}

interface Comet {
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  speed: number;
  angle: number;
  length: number;
  thickness: number;
  progress: number;
  duration: number;
  active: boolean;
  particles: Particle[];
}

export const ShootingStarCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth || 960);
    let height = (canvas.height = canvas.offsetHeight || 540);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 960;
      height = canvas.height = canvas.offsetHeight || 540;
    };
    window.addEventListener('resize', handleResize);

    const comet: Comet = {
      x: 0,
      y: 0,
      startX: 0,
      startY: 0,
      targetX: 0,
      targetY: 0,
      speed: 1,
      angle: 0,
      length: 65,
      thickness: 3,
      progress: 0,
      duration: 50,
      active: false,
      particles: [],
    };

    let cooldown = 30; // Frames before first comet

    const spawnComet = () => {
      // Pick random start and end points across appliances
      const variants = [
        // 1: Top-left to bottom-right across appliances
        {
          startX: width * (0.05 + Math.random() * 0.15),
          startY: height * (0.15 + Math.random() * 0.2),
          targetX: width * (0.75 + Math.random() * 0.2),
          targetY: height * (0.45 + Math.random() * 0.25),
        },
        // 2: Upper-right heading downwards-left
        {
          startX: width * (0.85 + Math.random() * 0.1),
          startY: height * (0.12 + Math.random() * 0.18),
          targetX: width * (0.2 + Math.random() * 0.25),
          targetY: height * (0.4 + Math.random() * 0.25),
        },
        // 3: Fast horizontal-diagonal sweep across washer
        {
          startX: width * (0.12 + Math.random() * 0.15),
          startY: height * (0.28 + Math.random() * 0.15),
          targetX: width * (0.82 + Math.random() * 0.15),
          targetY: height * (0.52 + Math.random() * 0.15),
        },
      ];

      const v = variants[Math.floor(Math.random() * variants.length)];
      comet.startX = v.startX;
      comet.startY = v.startY;
      comet.targetX = v.targetX;
      comet.targetY = v.targetY;
      comet.x = comet.startX;
      comet.y = comet.startY;
      comet.progress = 0;
      comet.duration = Math.floor(40 + Math.random() * 25); // ~650ms - 1000ms
      const dx = comet.targetX - comet.startX;
      const dy = comet.targetY - comet.startY;
      comet.angle = Math.atan2(dy, dx);
      comet.length = 50 + Math.random() * 35; // short, crisp tail
      comet.thickness = 2.5 + Math.random() * 1.5;
      comet.active = true;
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Manage comet spawning
      if (!comet.active) {
        cooldown--;
        if (cooldown <= 0) {
          spawnComet();
        }
      } else {
        comet.progress++;
        const t = comet.progress / comet.duration;
        comet.x = comet.startX + (comet.targetX - comet.startX) * t;
        comet.y = comet.startY + (comet.targetY - comet.startY) * t;

        // Emit sparkling tail particles
        if (Math.random() < 0.8) {
          comet.particles.push({
            x: comet.x + (Math.random() - 0.5) * 6,
            y: comet.y + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 1.2 - Math.cos(comet.angle) * 1.5,
            vy: (Math.random() - 0.5) * 1.2 - Math.sin(comet.angle) * 1.5,
            alpha: 1,
            size: 1.5 + Math.random() * 2,
            color: Math.random() > 0.4 ? '#FFFFFF' : '#FFD95E',
          });
        }

        // Draw Comet Tail (tapering incandescent gradient)
        const tailX = comet.x - Math.cos(comet.angle) * comet.length;
        const tailY = comet.y - Math.sin(comet.angle) * comet.length;

        const grad = ctx.createLinearGradient(tailX, tailY, comet.x, comet.y);
        grad.addColorStop(0, 'rgba(253, 195, 43, 0)');
        grad.addColorStop(0.5, 'rgba(255, 217, 94, 0.45)');
        grad.addColorStop(0.85, 'rgba(255, 255, 255, 0.85)');
        grad.addColorStop(1, '#FFFFFF');

        ctx.save();
        ctx.strokeStyle = grad;
        ctx.lineWidth = comet.thickness;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(comet.x, comet.y);
        ctx.stroke();

        // Glowing outer halo on tail
        ctx.strokeStyle = 'rgba(253, 195, 43, 0.25)';
        ctx.lineWidth = comet.thickness * 2.8;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(comet.x, comet.y);
        ctx.stroke();

        // Radiant Comet Head (Bright Core + Star Flare)
        const radGlow = ctx.createRadialGradient(comet.x, comet.y, 0, comet.x, comet.y, 14);
        radGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
        radGlow.addColorStop(0.3, 'rgba(255, 235, 150, 0.85)');
        radGlow.addColorStop(0.7, 'rgba(253, 195, 43, 0.4)');
        radGlow.addColorStop(1, 'rgba(253, 195, 43, 0)');

        ctx.fillStyle = radGlow;
        ctx.beginPath();
        ctx.arc(comet.x, comet.y, 14, 0, Math.PI * 2);
        ctx.fill();

        // 4-point cross star flare
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(comet.x - 9, comet.y);
        ctx.lineTo(comet.x + 9, comet.y);
        ctx.moveTo(comet.x, comet.y - 9);
        ctx.lineTo(comet.x, comet.y + 9);
        ctx.stroke();

        ctx.restore();

        // Check if finished
        if (comet.progress >= comet.duration) {
          comet.active = false;
          cooldown = Math.floor(60 + Math.random() * 80); // 1.2s to 2.5s pause before next comet
        }
      }

      // Update and draw spark particles
      for (let i = comet.particles.length - 1; i >= 0; i--) {
        const p = comet.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.035;

        if (p.alpha <= 0) {
          comet.particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = '#FFD95E';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-35"
    />
  );
};
