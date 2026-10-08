import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface WaterCascadeTorrentProps {
  activeProgress: number; // 0 = no water flow, 1 = maximum torrent flow
  activeProgressRef?: React.MutableRefObject<number>;
}

export const WaterCascadeTorrent: React.FC<WaterCascadeTorrentProps> = ({
  activeProgress,
  activeProgressRef,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const foamTopRef = useRef<THREE.Mesh>(null);
  const foamBottomRef = useRef<THREE.Mesh>(null);

  // Procedural flowing water texture with specular caustic ripples
  const waterTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Flow gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, '#7dd3fc');
      grad.addColorStop(0.3, '#38bdf8');
      grad.addColorStop(0.7, '#0284c7');
      grad.addColorStop(1, '#0369a1');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 512);

      // Ripple streaks
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (let i = 0; i < 28; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 512;
        const w = 6 + Math.random() * 18;
        const h = 25 + Math.random() * 65;
        ctx.beginPath();
        ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  // Curved Chute Geometry for natural parabolic water fall
  const geometry = useMemo(() => {
    // 16 height segments curving from drum collar [0, -0.42, 0.88] to floor [0, -1.17, 1.35]
    const geom = new THREE.PlaneGeometry(0.58, 0.95, 12, 24);
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const v = (pos.getY(i) + 0.475) / 0.95; // 0 at bottom, 1 at top
      // Parabolic curvature in Y and Z
      const y = THREE.MathUtils.lerp(-1.17, -0.42, v);
      const z = THREE.MathUtils.lerp(1.35, 0.9, Math.pow(v, 0.8));
      // Taper width wider at bottom
      const xTaper = THREE.MathUtils.lerp(1.25, 0.85, v);
      pos.setX(i, pos.getX(i) * xTaper);
      pos.setY(i, y);
      pos.setZ(i, z);
    }
    geom.computeVertexNormals();
    return geom;
  }, []);

  useFrame((_, delta) => {
    const prog = activeProgressRef ? activeProgressRef.current : activeProgress;

    // Fast downward water UV scrolling
    if (waterTexture) {
      waterTexture.offset.y -= delta * 3.8;
      waterTexture.offset.x = Math.sin(performance.now() * 0.003) * 0.05;
    }

    if (meshRef.current) {
      const scaleVal = Math.min(1.0, prog * 1.2);
      meshRef.current.scale.set(scaleVal, 1, scaleVal);
      const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
      mat.opacity = Math.max(0, prog * 0.88);
    }

    if (foamTopRef.current) {
      (foamTopRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, prog * 0.75);
    }

    if (foamBottomRef.current) {
      (foamBottomRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, prog * 0.9);
      foamBottomRef.current.scale.set(prog, 1, prog);
    }
  });

  const prog = activeProgressRef ? activeProgressRef.current : activeProgress;
  if (prog <= 0.01) return null;

  return (
    <group>
      {/* ================= 1. FLOWING WATER SHEET ================= */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshPhysicalMaterial
          map={waterTexture}
          color="#93c5fd"
          transmission={0.82}
          transparent
          opacity={0.88}
          roughness={0.05}
          ior={1.333}
          metalness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.04}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* ================= 2. FOAM LIP AT DRUM THRESHOLD ================= */}
      <mesh ref={foamTopRef} position={[0, -0.42, 0.91]} rotation={[Math.PI / 4, 0, 0]}>
        <capsuleGeometry args={[0.025, 0.45, 8, 16]} />
        <meshBasicMaterial
          color="#FFFFFF"
          transparent
          opacity={0.8}
          depthWrite={false}
        />
      </mesh>

      {/* ================= 3. FOAM IMPACT AT FLOOR LEVEL ================= */}
      <mesh
        ref={foamBottomRef}
        position={[0, -1.168, 1.34]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.32, 24]} />
        <meshBasicMaterial
          color="#E0F2FE"
          transparent
          opacity={0.85}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};
