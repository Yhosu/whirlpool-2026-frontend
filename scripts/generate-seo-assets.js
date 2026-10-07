import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.resolve(__dirname, '../public');
const assetsDir = path.resolve(__dirname, '../src/assets');

async function run() {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log('Generating SEO Assets...');

  // 1. Generate Favicon from whirlpool-logo-clean.png / whirlpool-official-logo.png
  const logoPath = path.join(assetsDir, 'whirlpool-logo-clean.png');
  const coinPath = path.join(assetsDir, '3000 Bs. 2.png');
  const washerPath = path.join(assetsDir, 'Lavadora Frontal.png');
  const titlePath = path.join(assetsDir, 'titulo.png');
  const bgTexturePath = path.join(assetsDir, 'textura-fondo.png');

  // Let's create a circular branded favicon (Whirlpool yellow badge with Whirlpool iconic W)
  // 64x64 favicon base
  const faviconSvg = `
  <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="31" fill="#FDC32B"/>
    <circle cx="32" cy="32" r="28" fill="#101010"/>
    <path d="M16 23 L23 43 L32 27 L41 43 L48 23" stroke="#FDC32B" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="32" cy="20" r="3.5" fill="#FFE27A"/>
  </svg>
  `;

  const faviconSvgBuffer = Buffer.from(faviconSvg);

  // Generate 16x16, 32x32, 48x48, 180x180 PNGs
  const p16 = await sharp(faviconSvgBuffer).resize(16, 16).png().toBuffer();
  const p32 = await sharp(faviconSvgBuffer).resize(32, 32).png().toBuffer();
  const p48 = await sharp(faviconSvgBuffer).resize(48, 48).png().toBuffer();
  const p180 = await sharp(faviconSvgBuffer).resize(180, 180).png().toBuffer();

  fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), p16);
  fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), p32);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), p180);

  // Create real .ico file containing 16, 32, and 48 png frames
  // ICO file format specification:
  // Header: 2 bytes reserved (0), 2 bytes type (1 = icon), 2 bytes image count
  // Directory entry per image: 16 bytes each
  // Image data blocks
  function createIco(images) {
    const numImages = images.length;
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0); // reserved
    header.writeUInt16LE(1, 2); // icon type
    header.writeUInt16LE(numImages, 4); // count

    let offset = 6 + 16 * numImages;
    const entries = [];
    const dataBuffers = [];

    for (const img of images) {
      const entry = Buffer.alloc(16);
      entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
      entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
      entry.writeUInt8(0, 2); // color count
      entry.writeUInt8(0, 3); // reserved
      entry.writeUInt16LE(1, 4); // color planes
      entry.writeUInt16LE(32, 6); // bits per pixel
      entry.writeUInt32LE(img.data.length, 8); // size of image
      entry.writeUInt32LE(offset, 12); // offset

      entries.push(entry);
      dataBuffers.push(img.data);
      offset += img.data.length;
    }

    return Buffer.concat([header, ...entries, ...dataBuffers]);
  }

  const icoBuffer = createIco([
    { width: 16, height: 16, data: p16 },
    { width: 32, height: 32, data: p32 },
    { width: 48, height: 48, data: p48 },
  ]);

  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('Favicon (.ico & PNGs) created.');

  // 2. Generate OpenGraph Banner Image (1200x630)
  // Rich golden sunburst background, official title badge, washer and prize badge
  const width = 1200;
  const height = 630;

  // Background canvas: warm golden radial gradient
  const bgSvg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="sunburst" cx="50%" cy="45%" r="65%">
        <stop offset="0%" stop-color="#FFE27A"/>
        <stop offset="55%" stop-color="#FDC32B"/>
        <stop offset="100%" stop-color="#EAA814"/>
      </radialGradient>
      <linearGradient id="overlay" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#101010" stop-opacity="0.85"/>
        <stop offset="40%" stop-color="#101010" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="#101010" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#sunburst)"/>
    <rect width="${width}" height="${height}" fill="url(#overlay)"/>
    <!-- Bottom banner badge with safe left-side positioning -->
    <rect x="0" y="525" width="${width}" height="105" fill="#101010" fill-opacity="0.95"/>
    <rect x="0" y="522" width="${width}" height="3" fill="#FDC32B"/>
    <text x="60" y="568" font-family="Arial, sans-serif" font-weight="900" font-size="28" fill="#FDC32B" letter-spacing="2">WHIRLPOOL SPECIAL DAYS</text>
    <text x="60" y="602" font-family="Arial, sans-serif" font-weight="700" font-size="20" fill="#FFFFFF">Gana hasta Bs. 3.000 al instante | Dismac y Distribuidores</text>
  </svg>
  `;

  // Process overlays
  const composites = [
    { input: Buffer.from(bgSvg), top: 0, left: 0 }
  ];

  // If title exists, resize and composite
  if (fs.existsSync(titlePath)) {
    const titleBuffer = await sharp(titlePath).resize(580, null, { fit: 'inside' }).toBuffer();
    composites.push({ input: titleBuffer, top: 50, left: 60 });
  }

  // If washer exists, composite on the right
  if (fs.existsSync(washerPath)) {
    const washerBuffer = await sharp(washerPath).resize(420, null, { fit: 'inside' }).toBuffer();
    composites.push({ input: washerBuffer, top: 40, left: 680 });
  }

  // If coin exists, composite near washer
  if (fs.existsSync(coinPath)) {
    const coinBuffer = await sharp(coinPath).resize(180, 180, { fit: 'inside' }).toBuffer();
    composites.push({ input: coinBuffer, top: 120, left: 560 });
  }

  const ogBuffer = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 253, g: 195, b: 43, alpha: 1 }
    }
  })
  .composite(composites)
  .jpeg({ quality: 90 })
  .toBuffer();

  fs.writeFileSync(path.join(publicDir, 'og-image.jpg'), ogBuffer);
  fs.writeFileSync(path.join(publicDir, 'og-image.png'), await sharp(ogBuffer).png().toBuffer());
  console.log('og-image.jpg and og-image.png created.');

  console.log('All SEO Assets generated successfully!');
}

run().catch(console.error);
