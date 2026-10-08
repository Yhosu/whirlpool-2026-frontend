import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';

// Official high-res prize assets
import coin3000 from '../../../assets/3000 Bs. 2.png';
import coin2000 from '../../../assets/2000Bs.png';
import coin1000 from '../../../assets/1000Bs.png';
import coin500 from '../../../assets/500Bs.png';
import coin250 from '../../../assets/250Bs.png';
import coin100 from '../../../assets/100Bs.png';

interface PrizeBall3DProps {
  prizeText: string;
  isJackpot?: boolean;
  ballPos: [number, number, number];
  ballPosRef?: React.MutableRefObject<[number, number, number]>;
  ballRotRef?: React.MutableRefObject<[number, number, number]>;
  revealProgress?: number;
  revealProgressRef?: React.MutableRefObject<number>;
  visible?: boolean;
}

const getAssetForPrize = (text: string) => {
  const str = String(text);
  if (str.includes('3000') || str.includes('3.000')) return coin3000;
  if (str.includes('2000') || str.includes('2.000')) return coin2000;
  if (str.includes('1000') || str.includes('1.000')) return coin1000;
  if (str.includes('500')) return coin500;
  if (str.includes('250')) return coin250;
  return coin100;
};

// Texture cache to prevent redundant Canvas creations
const ballTextureCache = new Map<string, THREE.CanvasTexture>();

function createSphericalPrizeTexture(imgSrc: string): THREE.CanvasTexture {
  if (ballTextureCache.has(imgSrc)) {
    return ballTextureCache.get(imgSrc)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  if (ctx) {
    // 1. Rich golden pearl base fill matching Whirlpool official prize balls
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#E5A00D');
    grad.addColorStop(0.2, '#FDC32B');
    grad.addColorStop(0.5, '#FFE066');
    grad.addColorStop(0.8, '#FDC32B');
    grad.addColorStop(1, '#C68A08');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Subtle pearlescent horizontal reflections
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.fillRect(0, 180, 1024, 45);

    // 2. Load the official asset image and draw directly onto the front & back equator
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imgSrc;
    img.onload = () => {
      // Front medallion (centered at x = 512, y = 256)
      const size = 320;
      ctx.drawImage(img, 512 - size / 2, 256 - size / 2, size, size);

      // Back medallion (wrapped around edges at x = 0 and x = 1024)
      ctx.drawImage(img, 0 - size / 2, 256 - size / 2, size, size);
      ctx.drawImage(img, 1024 - size / 2, 256 - size / 2, size, size);

      texture.needsUpdate = true;
    };
  }

  ballTextureCache.set(imgSrc, texture);
  return texture;
}

export const PrizeBall3D: React.FC<PrizeBall3DProps> = ({
  prizeText,
  isJackpot = false,
  ballPos,
  ballPosRef,
  ballRotRef,
  revealProgress = 1.0,
  revealProgressRef,
  visible = true,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Group>(null);

  const assetSrc = useMemo(() => getAssetForPrize(prizeText), [prizeText]);
  const ballTexture = useMemo(() => createSphericalPrizeTexture(assetSrc), [assetSrc]);

  useFrame(() => {
    if (!visible) return;

    const pos = ballPosRef ? ballPosRef.current : ballPos;
    const rot = ballRotRef ? ballRotRef.current : [0, 0, 0];
    const prog = revealProgressRef ? revealProgressRef.current : revealProgress;

    if (meshRef.current) {
      meshRef.current.position.set(pos[0], pos[1], pos[2]);
      meshRef.current.rotation.set(rot[0], rot[1], rot[2]);
    }

    // Dynamic contact shadow on the floor (floor is at y = -1.18)
    if (shadowRef.current) {
      shadowRef.current.position.set(pos[0], -1.17, pos[2]);
      const heightAboveFloor = Math.max(0, pos[1] - (-0.92));
      const shadowScale = Math.max(0.1, 1.0 - heightAboveFloor * 0.8);
      shadowRef.current.scale.set(shadowScale, shadowScale, shadowScale);
      (shadowRef.current.material as THREE.MeshBasicMaterial).opacity =
        Math.max(0, 0.75 - heightAboveFloor * 0.6);
    }

    // Golden victory aura on floor around ball
    if (auraRef.current) {
      auraRef.current.position.set(pos[0], -1.165, pos[2]);
      auraRef.current.scale.set(prog, prog, prog);
    }
  });

  if (!visible) return null;

  return (
    <group>
      {/* ================= 1. PHYSICAL 3D WINNING PRIZE BALL ================= */}
      <mesh ref={meshRef} position={ballPos} castShadow>
        <sphereGeometry args={[0.26, 48, 48]} />
        <meshPhysicalMaterial
          map={ballTexture}
          metalness={0.25}
          roughness={0.12}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          reflectivity={1.0}
          envMapIntensity={2.5}
        />
      </mesh>

      {/* ================= 2. FLOOR CONTACT DROP SHADOW ================= */}
      <mesh
        ref={shadowRef}
        position={[ballPos[0], -1.17, ballPos[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.28, 32]} />
        <meshBasicMaterial
          color="#06090E"
          transparent
          opacity={0.75}
          depthWrite={false}
        />
      </mesh>

      {/* ================= 3. CELEBRATORY RADIANT FLOOR AURA & SPARKLES ================= */}
      <group ref={auraRef} position={[ballPos[0], -1.165, ballPos[2]]}>
        {/* Soft golden light glow ring in the puddle */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.1, 0.75, 36]} />
          <meshBasicMaterial
            color="#FFD700"
            transparent
            opacity={0.35}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Ambient point light illuminating the ball on the floor */}
        <pointLight
          position={[0, 0.45, 0.2]}
          color="#FFE27A"
          intensity={2.8}
          distance={3.2}
          decay={2}
        />

        {/* Golden celebratory sparkles rising around the winning ball */}
        <Sparkles
          count={isJackpot ? 45 : 28}
          scale={1.5}
          size={3.2}
          speed={0.8}
          color="#FFD700"
        />
      </group>
    </group>
  );
};
