import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text, Sparkles } from '@react-three/drei';
import { createPrizeBallTexture } from './textures';

interface PrizeRevealProps {
  prizeText: string;
  isJackpot: boolean;
  ballPos: [number, number, number];
  ballPosRef?: React.MutableRefObject<[number, number, number]>;
  breakTrigger: boolean;
  revealProgress: number; // 0 to 1
  revealProgressRef?: React.MutableRefObject<number>;
}

interface FragmentState {
  phiStart: number;
  phiLength: number;
  thetaStart: number;
  thetaLength: number;
  dir: THREE.Vector3;
  pos: THREE.Vector3;
  rot: THREE.Euler;
  vel: THREE.Vector3;
  rotSpeed: THREE.Vector3;
}

export const PrizeReveal: React.FC<PrizeRevealProps> = ({
  prizeText,
  isJackpot,
  ballPos,
  ballPosRef,
  breakTrigger,
  revealProgress,
  revealProgressRef,
}) => {
  const ballTexture = useMemo(() => createPrizeBallTexture(prizeText), [prizeText]);
  const mainGroupRef = useRef<THREE.Group>(null);
  const fragmentsGroupRef = useRef<THREE.Group>(null);
  const textGroupRef = useRef<THREE.Group>(null);

  // 6 Radial Spherical Calotte Fragments
  const fragments = useMemo<FragmentState[]>(() => {
    // Partition sphere into 6 geometric segments (top cap, bottom cap, 4 quadrants)
    const configs = [
      // Top hemisphere cap
      { phiStart: 0, phiLength: Math.PI * 2, thetaStart: 0, thetaLength: Math.PI / 3, dir: new THREE.Vector3(0, 1.2, 0.4) },
      // Bottom hemisphere cap
      { phiStart: 0, phiLength: Math.PI * 2, thetaStart: (Math.PI * 2) / 3, thetaLength: Math.PI / 3, dir: new THREE.Vector3(0, -0.6, 0.5) },
      // 4 Equatorial quadrants
      { phiStart: 0, phiLength: Math.PI / 2, thetaStart: Math.PI / 3, thetaLength: Math.PI / 3, dir: new THREE.Vector3(1.2, 0.3, 0.6) },
      { phiStart: Math.PI / 2, phiLength: Math.PI / 2, thetaStart: Math.PI / 3, thetaLength: Math.PI / 3, dir: new THREE.Vector3(0.3, 0.4, 1.3) },
      { phiStart: Math.PI, phiLength: Math.PI / 2, thetaStart: Math.PI / 3, thetaLength: Math.PI / 3, dir: new THREE.Vector3(-1.2, 0.3, 0.6) },
      { phiStart: (Math.PI * 3) / 2, phiLength: Math.PI / 2, thetaStart: Math.PI / 3, thetaLength: Math.PI / 3, dir: new THREE.Vector3(-0.3, 0.4, -0.8) },
    ];

    return configs.map((c) => ({
      ...c,
      pos: new THREE.Vector3(0, 0, 0),
      rot: new THREE.Euler(0, 0, 0),
      vel: c.dir.clone().normalize().multiplyScalar(2.8 + Math.random() * 1.5),
      rotSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8
      ),
    }));
  }, []);

  // Reset fragment states when breakTrigger occurs
  useEffect(() => {
    if (breakTrigger) {
      fragments.forEach((f) => {
        f.pos.set(0, 0, 0);
        f.rot.set(0, 0, 0);
        f.vel.copy(f.dir).normalize().multiplyScalar(3.2 + Math.random() * 2.0);
      });
    }
  }, [breakTrigger, fragments]);

  // Frame physics for ball position, separating fragments, and text scale
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);

    // Update parent group position
    if (mainGroupRef.current) {
      const pos = ballPosRef ? ballPosRef.current : ballPos;
      mainGroupRef.current.position.set(pos[0], pos[1], pos[2]);
    }

    // Update fractured Voronoi fragments
    if (breakTrigger && fragmentsGroupRef.current) {
      fragmentsGroupRef.current.children.forEach((child, i) => {
        const frag = fragments[i];
        if (!frag) return;

        // Radial impulse integration with air resistance
        frag.pos.addScaledVector(frag.vel, dt);
        frag.vel.multiplyScalar(0.92); // drag

        frag.rot.x += frag.rotSpeed.x * dt;
        frag.rot.y += frag.rotSpeed.y * dt;
        frag.rot.z += frag.rotSpeed.z * dt;

        child.position.copy(frag.pos);
        child.rotation.copy(frag.rot);
      });
    }

    // Update text reveal scale & ascent if ref provided
    if (textGroupRef.current && revealProgressRef) {
      const prog = revealProgressRef.current;
      textGroupRef.current.position.y = prog * 0.45;
      textGroupRef.current.scale.set(prog, prog, prog);
    }
  });

  const prog = revealProgressRef ? revealProgressRef.current : revealProgress;

  return (
    <group ref={mainGroupRef} position={ballPos}>
      {/* ================= 1. INTACT SPHERE (BEFORE FRACTURE) ================= */}
      {!breakTrigger && (
        <mesh castShadow>
          <sphereGeometry args={[0.26, 48, 48]} />
          <meshPhysicalMaterial
            map={ballTexture}
            metalness={0.92}
            roughness={0.12}
            clearcoat={1.0}
            clearcoatRoughness={0.06}
            reflectivity={1.0}
            envMapIntensity={2.5}
          />
        </mesh>
      )}

      {/* ================= 2. 3D FRACTURED VORONOI CALOTTES ================= */}
      {breakTrigger && (
        <group ref={fragmentsGroupRef}>
          {fragments.map((frag, idx) => (
            <mesh key={idx} castShadow>
              <sphereGeometry
                args={[
                  0.26,
                  24,
                  18,
                  frag.phiStart,
                  frag.phiLength,
                  frag.thetaStart,
                  frag.thetaLength,
                ]}
              />
              <meshPhysicalMaterial
                map={ballTexture}
                metalness={0.92}
                roughness={0.14}
                clearcoat={1.0}
                side={THREE.DoubleSide}
                envMapIntensity={2.0}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* ================= 3. RADIANT 3D PRIZE REVELATION ================= */}
      {breakTrigger && (
        <group ref={textGroupRef} position={[0, prog * 0.45, 0]}>
          {/* Light sweep core aura */}
          <pointLight
            color="#FFD700"
            intensity={4.0 * prog}
            distance={4.5}
            decay={2}
          />

          {/* Golden Radiant Sweep Disc */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
            <ringGeometry args={[0.05, 0.8 * Math.max(0.01, prog), 36]} />
            <meshBasicMaterial
              color="#FFE27A"
              transparent
              opacity={0.7 * prog}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Real 3D Winning Text with Bevel & Depth */}
          <group scale={[prog, prog, prog]}>
            <Text
              position={[0, 0.28, 0.15]}
              fontSize={0.28}
              color="#FFD700"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#101010"
            >
              {prizeText}
              <meshPhysicalMaterial
                color="#FFD700"
                emissive="#FFA000"
                emissiveIntensity={0.6 + 0.4 * Math.sin(prog * Math.PI)}
                metalness={0.95}
                roughness={0.12}
                clearcoat={1.0}
              />
            </Text>

            {/* Official Badge Subtitle in 3D */}
            <Text
              position={[0, 0.08, 0.15]}
              fontSize={0.075}
              color="#FFFFFF"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.008}
              outlineColor="#000000"
            >
              {isJackpot ? '★ PREMIO MAYOR WHIRLPOOL ★' : 'PREMIO OFICIAL WHIRLPOOL'}
            </Text>
          </group>

          {/* Golden Celebration Sparkles */}
          <Sparkles
            count={isJackpot ? 60 : 35}
            scale={2.2 * prog}
            size={3.5}
            speed={0.6}
            color="#FFD700"
          />
        </group>
      )}
    </group>
  );
};
