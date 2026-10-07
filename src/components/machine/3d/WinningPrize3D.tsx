import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createWinningBallTexture } from './textures';

interface WinningPrize3DProps {
  prizeAmount: string;
  isJackpot?: boolean;
  className?: string;
}

interface SceneProps {
  prizeAmount: string;
  isJackpot?: boolean;
  rotationOffset: React.MutableRefObject<{ x: number; y: number }>;
  isUserInteracting: React.MutableRefObject<boolean>;
}

/**
 * 3D Scene containing the floating, interactive Winning Prize Ball
 * with high-gloss clearcoat reflections, bold pure-black typography,
 * orbiting golden sparkles, and full 360-degree rotation.
 */
const WinningBallScene: React.FC<SceneProps> = ({
  prizeAmount,
  isJackpot,
  rotationOffset,
  isUserInteracting,
}) => {
  const ballGroupRef = useRef<THREE.Group>(null);
  const sparksRef = useRef<THREE.InstancedMesh>(null);

  // Animation timeline state (flight from drum -> foreground)
  const animTime = useRef(0);
  const autoRotateSpeed = useRef(0.65);

  // Texture
  const texture = useMemo(() => {
    return createWinningBallTexture(prizeAmount);
  }, [prizeAmount]);

  // Orbiting Golden Sparkles
  const SPARK_COUNT = 36;
  const sparkData = useMemo(() => {
    const dummy = new THREE.Object3D();
    const items = [];
    for (let i = 0; i < SPARK_COUNT; i++) {
      const angle = (i / SPARK_COUNT) * Math.PI * 2;
      const radius = 1.35 + (Math.random() - 0.5) * 0.45;
      const y = (Math.random() - 0.5) * 1.4;
      const speed = 0.8 + Math.random() * 0.8;
      const scale = 0.035 + Math.random() * 0.055;
      items.push({ angle, radius, y, speed, scale });
    }
    return { dummy, items };
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.033);
    animTime.current += dt;
    const t = animTime.current;

    // 1. Flight Trajectory from Drum Interior (-1.6 Z) to Front Center (+1.1 Z)
    if (ballGroupRef.current) {
      if (t < 1.4) {
        // Smooth cubic ease-out launch
        const progress = Math.min(t / 1.4, 1.0);
        const ease = 1 - Math.pow(1 - progress, 3);

        const curZ = THREE.MathUtils.lerp(-1.6, 1.1, ease);
        const curScale = THREE.MathUtils.lerp(0.2, 1.0, ease);
        const curY = THREE.MathUtils.lerp(-0.2, 0.1, ease);

        ballGroupRef.current.position.set(0, curY, curZ);
        ballGroupRef.current.scale.set(curScale, curScale, curScale);

        // Rapid initial spin while shooting forward
        rotationOffset.current.y += (1 - progress) * 12.0 * dt;
      } else {
        // Continuous gentle breathing hover in front
        const hoverY = 0.1 + Math.sin(t * 2.2) * 0.05;
        ballGroupRef.current.position.set(0, hoverY, 1.1);
        ballGroupRef.current.scale.set(1.0, 1.0, 1.0);

        // Auto-rotation when not actively being dragged by user
        if (!isUserInteracting.current) {
          rotationOffset.current.y += autoRotateSpeed.current * dt;
          rotationOffset.current.x = THREE.MathUtils.lerp(rotationOffset.current.x, 0.08, dt * 2.0);
        }
      }

      ballGroupRef.current.rotation.x = rotationOffset.current.x;
      ballGroupRef.current.rotation.y = rotationOffset.current.y;
    }

    // 2. Animate Orbiting Golden Sparkles
    if (sparksRef.current) {
      const { dummy, items } = sparkData;
      for (let i = 0; i < SPARK_COUNT; i++) {
        const item = items[i];
        item.angle += item.speed * dt;
        const x = Math.cos(item.angle) * item.radius;
        const z = Math.sin(item.angle) * item.radius + 1.1;
        const y = item.y + Math.sin(t * 3.0 + i) * 0.1;

        dummy.position.set(x, y, z);
        const pulse = item.scale * (1.0 + Math.sin(t * 4.0 + i) * 0.35);
        dummy.scale.set(pulse, pulse, pulse);
        dummy.updateMatrix();
        sparksRef.current.setMatrixAt(i, dummy.matrix);
      }
      sparksRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Studio Lighting */}
      <ambientLight intensity={1.1} color="#ffffff" />
      <directionalLight position={[2, 3, 4]} intensity={2.6} color="#ffffff" />
      <directionalLight position={[-3, -1, 2]} intensity={1.2} color="#ffd95e" />
      <pointLight position={[0, 1.8, 2.5]} intensity={3.5} color="#fffbeb" distance={6} />
      <pointLight position={[0, -1.5, 1.5]} intensity={2.2} color="#fdc32b" distance={5} />

      {/* Main Interactive 3D Ball Group */}
      <group ref={ballGroupRef}>
        {/* The Photorealistic Winning Sphere */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[1.05, 64, 64]} />
          <meshPhysicalMaterial
            map={texture}
            roughness={0.08}
            metalness={0.05}
            clearcoat={1.0}
            clearcoatRoughness={0.04}
            reflectivity={0.96}
            envMapIntensity={2.0}
          />
        </mesh>

        {/* Golden Specular Halo Ring behind the ball */}
        <mesh position={[0, 0, -0.05]}>
          <ringGeometry args={[1.08, 1.28, 64]} />
          <meshBasicMaterial
            color="#FFD700"
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Orbiting Golden Sparkles */}
      <instancedMesh ref={sparksRef} args={[undefined, undefined, SPARK_COUNT]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={isJackpot ? '#FFF066' : '#FFD700'} />
      </instancedMesh>
    </>
  );
};

export const WinningPrize3D: React.FC<WinningPrize3DProps> = ({
  prizeAmount,
  isJackpot = false,
  className = '',
}) => {
  const [hintVisible, setHintVisible] = useState(true);

  // Rotation and drag interaction references
  const rotationOffset = useRef({ x: 0.1, y: 0.0 });
  const isUserInteracting = useRef(false);
  const prevMouse = useRef({ x: 0, y: 0 });

  // DOM Drag Handlers on outer container for 100% reliable 360° touch & mouse drag
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isUserInteracting.current = true;
    prevMouse.current = { x: e.clientX, y: e.clientY };
    setHintVisible(false);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isUserInteracting.current) return;
    const dx = e.clientX - prevMouse.current.x;
    const dy = e.clientY - prevMouse.current.y;
    prevMouse.current = { x: e.clientX, y: e.clientY };

    rotationOffset.current.y += dx * 0.014;
    rotationOffset.current.x = Math.max(-0.6, Math.min(0.6, rotationOffset.current.x + dy * 0.014));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isUserInteracting.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative w-full h-full select-none cursor-grab active:cursor-grabbing ${className}`}
    >
      <Canvas
        camera={{
          position: [0, 0, 3.8],
          fov: 44,
          near: 0.1,
          far: 20,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        dpr={[1, Math.min(window.devicePixelRatio || 1, 2)]}
        className="w-full h-full"
      >
        <WinningBallScene
          prizeAmount={prizeAmount}
          isJackpot={isJackpot}
          rotationOffset={rotationOffset}
          isUserInteracting={isUserInteracting}
        />
      </Canvas>

      {/* Interactive 3D Hint Badge */}
      {hintVisible && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none bg-black/75 backdrop-blur-md text-[#FFE27A] border border-[#FFE27A]/50 rounded-full px-3.5 py-1 text-[11px] font-mono font-bold tracking-wider animate-pulse flex items-center gap-1.5 shadow-lg">
          <span>👆</span>
          <span>Arrastra para girar en 360°</span>
        </div>
      )}
    </div>
  );
};
