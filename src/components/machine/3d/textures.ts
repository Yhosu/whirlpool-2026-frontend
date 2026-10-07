import * as THREE from 'three';

// Cache generated textures to avoid re-creation
const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Creates procedural photorealistic textures for the lottery prize balls.
 * Features 8 high-contrast medallions distributed across the entire sphere
 * so that no matter how the ball rotates or tumbles in the water,
 * the bold JET-BLACK numbers and letters ("3000 Bs.", etc.) are 100% legible and visible!
 */
export function createPrizeBallTexture(amount: string): THREE.CanvasTexture {
  const cacheKey = `ball_v3_hd_${amount}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. Rich lustrous golden pearl yellow base with subtle metallic sheen
    const baseGrad = ctx.createLinearGradient(0, 0, 1024, 1024);
    baseGrad.addColorStop(0, '#FFE55C');
    baseGrad.addColorStop(0.25, '#FFC700');
    baseGrad.addColorStop(0.55, '#F59E0B');
    baseGrad.addColorStop(0.85, '#D97706');
    baseGrad.addColorStop(1, '#B45309');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle pearlescent horizontal highlights
    for (let i = 0; i < 3; i++) {
      const y = 200 + i * 300;
      const hGrad = ctx.createLinearGradient(0, y - 60, 0, y + 60);
      hGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      hGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.18)');
      hGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = hGrad;
      ctx.fillRect(0, y - 60, 1024, 120);
    }

    // Clean prize amount: extract number and currency
    const cleanNum = amount.replace('Bs.', '').trim();

    // 8 Medallion Centers covering all 360° of the sphere:
    // - 4 along Equator (y = 512)
    // - 2 along Upper Hemisphere (y = 230)
    // - 2 along Lower Hemisphere (y = 794)
    const badgeConfigs = [
      { cx: 128, cy: 512, r: 104 },
      { cx: 384, cy: 512, r: 104 },
      { cx: 640, cy: 512, r: 104 },
      { cx: 896, cy: 512, r: 104 },
      { cx: 256, cy: 230, r: 96 },
      { cx: 768, cy: 230, r: 96 },
      { cx: 256, cy: 794, r: 96 },
      { cx: 768, cy: 794, r: 96 },
    ];

    badgeConfigs.forEach(({ cx, cy, r }) => {
      ctx.save();
      ctx.translate(cx, cy);

      // 1. Deep Contact Drop Shadow underneath medallion
      ctx.beginPath();
      ctx.arc(2, 4, r + 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fill();

      // 2. Outer Jet-Black Border Ring
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();

      // 3. Golden Rim
      ctx.beginPath();
      ctx.arc(0, 0, r - 4, 0, Math.PI * 2);
      ctx.fillStyle = '#FDC32B';
      ctx.fill();

      // 4. Inner Black Outline
      ctx.beginPath();
      ctx.arc(0, 0, r - 7, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();

      // 5. Brilliant Pure White Disc (Maximum Contrast 21:1 for perfect readability)
      ctx.beginPath();
      ctx.arc(0, 0, r - 9, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      // Inner subtle top gloss on white disc
      const discGrad = ctx.createLinearGradient(0, -r, 0, 0);
      discGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      discGrad.addColorStop(1, 'rgba(240, 243, 246, 0.2)');
      ctx.fillStyle = discGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r - 9, 0, Math.PI * 2);
      ctx.fill();

      // 6. TOP LABEL: "Bs." in PURE JET-BLACK (#000000)
      ctx.fillStyle = '#000000';
      ctx.font = '900 24px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Bs.', 0, -r * 0.52);

      // 7. MAIN PRIZE NUMBER in ULTRA-BOLD PURE JET-BLACK (#000000)
      const isLong = cleanNum.length > 4;
      const isMedium = cleanNum.length > 3;
      const numFontSize = isLong ? 54 : isMedium ? 64 : 74;
      ctx.font = `900 ${numFontSize}px "Anton", Impact, "Arial Black", sans-serif`;
      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.fillText(cleanNum, 0, 2);
      ctx.strokeText(cleanNum, 0, 2);

      // 8. BOTTOM ACCENT: 3 Solid Stars or Gold Emblem
      const starY = r * 0.54;
      const drawStar = (sx: number, sy: number, starR: number) => {
        ctx.save();
        ctx.translate(sx, sy);
        ctx.fillStyle = '#F59E0B';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          ctx.lineTo(
            Math.cos(((18 + i * 72) * Math.PI) / 180) * starR,
            -Math.sin(((18 + i * 72) * Math.PI) / 180) * starR
          );
          ctx.lineTo(
            Math.cos(((54 + i * 72) * Math.PI) / 180) * (starR * 0.45),
            -Math.sin(((54 + i * 72) * Math.PI) / 180) * (starR * 0.45)
          );
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      };

      drawStar(-26, starY, 6.5);
      drawStar(0, starY - 2, 8.5);
      drawStar(26, starY, 6.5);

      ctx.restore();
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates ultra-high-definition texture for the featured winning prize ball
 * that pops out of the washing machine on /girar.
 */
export function createWinningBallTexture(amount: string): THREE.CanvasTexture {
  const cacheKey = `winning_ball_hd_${amount}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. Premium 24K Royal Gold Gradient
    const goldGrad = ctx.createLinearGradient(0, 0, 1024, 1024);
    goldGrad.addColorStop(0, '#FFF59D');
    goldGrad.addColorStop(0.2, '#FDD835');
    goldGrad.addColorStop(0.5, '#FBC02D');
    goldGrad.addColorStop(0.8, '#F57F17');
    goldGrad.addColorStop(1, '#E65100');
    ctx.fillStyle = goldGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Dynamic metallic glint bands
    const glint = ctx.createLinearGradient(0, 0, 1024, 0);
    glint.addColorStop(0, 'rgba(255,255,255,0.05)');
    glint.addColorStop(0.35, 'rgba(255,255,255,0.35)');
    glint.addColorStop(0.5, 'rgba(255,255,255,0.05)');
    glint.addColorStop(0.85, 'rgba(255,255,255,0.3)');
    glint.addColorStop(1, 'rgba(255,255,255,0.05)');
    ctx.fillStyle = glint;
    ctx.fillRect(0, 0, 1024, 1024);

    const cleanNum = amount.replace('Bs.', '').trim();

    // 8 Badges across all sides
    const badgeConfigs = [
      { cx: 128, cy: 512, r: 110 },
      { cx: 384, cy: 512, r: 110 },
      { cx: 640, cy: 512, r: 110 },
      { cx: 896, cy: 512, r: 110 },
      { cx: 256, cy: 230, r: 100 },
      { cx: 768, cy: 230, r: 100 },
      { cx: 256, cy: 794, r: 100 },
      { cx: 768, cy: 794, r: 100 },
    ];

    badgeConfigs.forEach(({ cx, cy, r }) => {
      ctx.save();
      ctx.translate(cx, cy);

      // Deep Shadow
      ctx.beginPath();
      ctx.arc(3, 5, r + 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fill();

      // Jet Black Outer Frame
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();

      // Brilliant Gold Ring
      ctx.beginPath();
      ctx.arc(0, 0, r - 4, 0, Math.PI * 2);
      ctx.fillStyle = '#FFD700';
      ctx.fill();

      // Black Line
      ctx.beginPath();
      ctx.arc(0, 0, r - 7, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();

      // Pure White Disc
      ctx.beginPath();
      ctx.arc(0, 0, r - 9, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      // Header: "WHIRLPOOL" in bold black
      ctx.fillStyle = '#000000';
      ctx.font = '900 16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('WHIRLPOOL', 0, -r * 0.62);

      // Currency: "Bs." in solid black
      ctx.font = '900 24px system-ui, sans-serif';
      ctx.fillText('Bs.', 0, -r * 0.38);

      // Main Prize Number: HUGE & BLACK
      const isLong = cleanNum.length > 4;
      const isMedium = cleanNum.length > 3;
      const numFontSize = isLong ? 56 : isMedium ? 68 : 80;
      ctx.font = `900 ${numFontSize}px "Anton", Impact, "Arial Black", sans-serif`;
      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.fillText(cleanNum, 0, 8);
      ctx.strokeText(cleanNum, 0, 8);

      // Footer: "PREMIO OFICIAL" in bold black
      ctx.font = '900 13px system-ui, sans-serif';
      ctx.fillText('★ PREMIO OFICIAL ★', 0, r * 0.58);

      ctx.restore();
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates brushed stainless steel perforated drum texture
 */
export function createDrumPerforationTexture(): THREE.CanvasTexture {
  const cacheKey = 'drum_perf_hd';
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. Brushed Steel Background with directional noise
    ctx.fillStyle = '#C0C5CA';
    ctx.fillRect(0, 0, 1024, 512);

    // Subtle brushed horizontal streaks
    for (let i = 0; i < 180; i++) {
      const y = Math.random() * 512;
      const h = 1 + Math.random() * 3;
      const alpha = 0.05 + Math.random() * 0.12;
      ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
      ctx.fillRect(0, y, 1024, h);
    }

    // 2. Punched Holes Array (Hexagonal / Staggered pattern)
    const holeRadius = 3.6;
    const stepX = 22;
    const stepY = 18;

    for (let y = 0; y < 512; y += stepY) {
      const row = Math.floor(y / stepY);
      const offsetX = (row % 2) * (stepX / 2);
      for (let x = -stepX; x < 1024 + stepX; x += stepX) {
        const hx = x + offsetX;

        // Dark hole interior
        ctx.beginPath();
        ctx.arc(hx, y, holeRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#1A1C20';
        ctx.fill();

        // Metallic pressed bevel highlight
        ctx.beginPath();
        ctx.arc(hx + 0.8, y + 0.8, holeRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Opposite shadow bevel
        ctx.beginPath();
        ctx.arc(hx - 0.6, y - 0.6, holeRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates rubber gasket bellow grooves texture
 */
export function createRubberGasketTexture(): THREE.CanvasTexture {
  const cacheKey = 'rubber_gasket';
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#1F2226';
    ctx.fillRect(0, 0, 512, 512);

    // Concentric rubber folds
    const cx = 256;
    const cy = 256;
    for (let r = 80; r < 250; r += 14) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.lineWidth = 5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates water condensation beads & droplets texture for the inside glass face
 */
export function createGlassDropletsTexture(): THREE.CanvasTexture {
  const cacheKey = 'glass_droplets';
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.clearRect(0, 0, 512, 512);

    // Random micro-droplets
    for (let i = 0; i < 350; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = 1.2 + Math.random() * 3.8;

      // Drop highlight and shadow
      const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0.5, x, y, r);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      grad.addColorStop(0.6, 'rgba(200, 235, 255, 0.45)');
      grad.addColorStop(1, 'rgba(0, 30, 60, 0.6)');

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Dripping rivulets / sliding trails
    for (let j = 0; j < 12; j++) {
      const startX = 60 + Math.random() * 392;
      let startY = 40 + Math.random() * 200;
      const length = 40 + Math.random() * 120;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(
        startX + (Math.random() - 0.5) * 8,
        startY + length * 0.5,
        startX + (Math.random() - 0.5) * 6,
        startY + length
      );
      ctx.strokeStyle = 'rgba(220, 245, 255, 0.35)';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Droplet pool at end of trickle
      ctx.beginPath();
      ctx.arc(startX, startY + length, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}
