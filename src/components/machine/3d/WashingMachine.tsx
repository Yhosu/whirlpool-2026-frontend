import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import { createDrumPerforationTexture, createPrizeBallTexture } from './textures';

interface WashingMachineProps {
  drumRotation: number;
  readoutText: string;
  isReady: boolean;
  onScreenClick?: () => void;
  drumLightIntensity?: number;
}

export const WashingMachine: React.FC<WashingMachineProps> = ({
  drumRotation,
  readoutText,
  isReady,
  onScreenClick,
  drumLightIntensity = 2.5,
}) => {
  const drumGroupRef = useRef<THREE.Group>(null);
  const ballsGroupRef = useRef<THREE.Group>(null);
  const perforationMap = useMemo(() => createDrumPerforationTexture(), []);

  // Pre-generate textures for the floating lottery balls inside the drum
  const ballTextures = useMemo(() => [
    createPrizeBallTexture('Bs. 3.000'),
    createPrizeBallTexture('Bs. 2.000'),
    createPrizeBallTexture('Bs. 1.000'),
    createPrizeBallTexture('Bs. 500'),
    createPrizeBallTexture('Bs. 250'),
    createPrizeBallTexture('Bs. 100'),
  ], []);

  // Initial offsets for the balls inside the drum
  const ballsInitialData = useMemo(() => [
    { pos: [0.12, -0.12, 0.22] as [number, number, number], r: 0.13, speed: 1.1, rotSpeed: [1.2, 0.8, 1.5] },
    { pos: [-0.18, 0.08, 0.16] as [number, number, number], r: 0.12, speed: 0.9, rotSpeed: [-0.9, 1.4, -0.7] },
    { pos: [0.05, 0.18, 0.28] as [number, number, number], r: 0.125, speed: 1.3, rotSpeed: [1.5, -1.1, 0.9] },
    { pos: [-0.14, -0.16, 0.32] as [number, number, number], r: 0.115, speed: 0.85, rotSpeed: [-1.2, -0.8, 1.1] },
    { pos: [0.22, 0.04, 0.14] as [number, number, number], r: 0.12, speed: 1.05, rotSpeed: [0.7, 1.6, -1.3] },
    { pos: [-0.02, -0.02, 0.24] as [number, number, number], r: 0.11, speed: 1.2, rotSpeed: [1.1, 1.0, 1.2] },
  ], []);

  // Sync rotating drum orientation & animate floating lottery balls
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (drumGroupRef.current) {
      drumGroupRef.current.rotation.z = -drumRotation;
    }
    if (ballsGroupRef.current) {
      ballsGroupRef.current.children.forEach((mesh, i) => {
        const data = ballsInitialData[i];
        if (!data) return;
        mesh.rotation.x += data.rotSpeed[0] * dt * (1 + Math.abs(drumRotation) * 0.1);
        mesh.rotation.y += data.rotSpeed[1] * dt * (1 + Math.abs(drumRotation) * 0.1);
        mesh.rotation.z += data.rotSpeed[2] * dt * (1 + Math.abs(drumRotation) * 0.1);

        // Gentle orbital bounce
        const t = performance.now() * 0.002 * data.speed;
        mesh.position.y = data.pos[1] + Math.sin(t + i) * 0.035;
        mesh.position.x = data.pos[0] + Math.cos(t * 0.8 + i) * 0.035;
      });
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ================= 1. MAIN CHASSIS BODY (DARK GRAPHITE WHIRLPOOL CABINET) ================= */}
      {/* Premium dark titanium/graphite metallic cabinet matching the hero machine */}
      <RoundedBox
        args={[2.0, 2.36, 1.84]}
        radius={0.06}
        smoothness={4}
        position={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#22252A"
          roughness={0.22}
          metalness={0.88}
          clearcoat={0.3}
          clearcoatRoughness={0.15}
          reflectivity={0.9}
        />
      </RoundedBox>

      {/* Top Worktop Lid */}
      <RoundedBox
        args={[2.04, 0.08, 1.88]}
        radius={0.025}
        smoothness={3}
        position={[0, 1.21, 0.01]}
      >
        <meshStandardMaterial color="#1A1D21" roughness={0.2} metalness={0.85} />
      </RoundedBox>

      {/* Bottom Plinth / Base Kickplate */}
      <RoundedBox
        args={[1.96, 0.2, 1.82]}
        radius={0.03}
        smoothness={3}
        position={[0, -1.08, 0.02]}
      >
        <meshStandardMaterial color="#15171A" roughness={0.35} metalness={0.8} />
      </RoundedBox>

      {/* Maintenance Drain Cap (Bottom Right) */}
      <mesh position={[0.72, -1.08, 0.935]}>
        <cylinderGeometry args={[0.055, 0.055, 0.02, 24]} />
        <meshStandardMaterial color="#2E333A" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* ================= 2. UPPER CONTROL FASCIA ================= */}
      {/* Dark Graphite Fascia Inset Bar */}
      <RoundedBox
        args={[1.92, 0.44, 0.05]}
        radius={0.03}
        smoothness={3}
        position={[0, 0.91, 0.93]}
      >
        <meshStandardMaterial color="#111316" roughness={0.3} metalness={0.7} />
      </RoundedBox>

      {/* Left: Detergent Dispenser Drawer */}
      <group position={[-0.6, 0.91, 0.96]}>
        <RoundedBox args={[0.56, 0.34, 0.03]} radius={0.02} smoothness={2}>
          <meshStandardMaterial color="#26292E" roughness={0.25} metalness={0.85} />
        </RoundedBox>
        {/* Recessed Handle Bar */}
        <mesh position={[0, -0.09, 0.02]}>
          <boxGeometry args={[0.36, 0.03, 0.02]} />
          <meshStandardMaterial color="#141619" roughness={0.6} />
        </mesh>
        {/* Whirlpool Brand Signature Lockup */}
        <Text
          position={[0, 0.05, 0.022]}
          fontSize={0.048}
          color="#F2F5F8"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.04}
        >
          Whirlpool
        </Text>
      </group>

      {/* Center: Brushed Chrome Rotary Program Dial */}
      <group position={[0, 0.91, 0.96]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.06, 32]} />
          <meshStandardMaterial color="#D0D5DA" roughness={0.12} metalness={0.95} />
        </mesh>
        {/* Knurled Outer Bezel Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.02]}>
          <cylinderGeometry args={[0.14, 0.14, 0.02, 32]} />
          <meshStandardMaterial color="#26292F" roughness={0.35} metalness={0.85} />
        </mesh>
        {/* Illuminated Selector Notch */}
        <mesh position={[0, 0.09, 0.035]}>
          <boxGeometry args={[0.015, 0.05, 0.01]} />
          <meshBasicMaterial color="#00E5FF" />
        </mesh>
      </group>

      {/* Right: Electronic Interactive LED Touch Screen */}
      <group
        position={[0.58, 0.91, 0.96]}
        onClick={(e) => {
          e.stopPropagation();
          onScreenClick?.();
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        {/* Screen Frame Border */}
        <RoundedBox args={[0.62, 0.34, 0.03]} radius={0.02} smoothness={2}>
          <meshStandardMaterial
            color="#080C12"
            roughness={0.2}
            metalness={0.5}
            emissive="#00E5FF"
            emissiveIntensity={isReady ? 0.35 : 0.15}
          />
        </RoundedBox>

        {/* Digital Glass Surface */}
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[0.58, 0.3]} />
          <meshPhysicalMaterial
            color="#03060C"
            emissive="#003740"
            emissiveIntensity={0.65}
            roughness={0.08}
            metalness={0.1}
            clearcoat={1.0}
          />
        </mesh>

        {/* Touch Button Indicator Glow Strip */}
        <mesh position={[0, -0.1, 0.025]}>
          <planeGeometry args={[0.48, 0.03]} />
          <meshBasicMaterial color={isReady ? '#FDC32B' : '#00E5FF'} />
        </mesh>

        {/* Dynamic Status LEDs */}
        <mesh position={[0.22, 0.09, 0.025]}>
          <circleGeometry args={[0.018, 16]} />
          <meshBasicMaterial color={isReady ? '#00E5FF' : '#555555'} />
        </mesh>
        <mesh position={[0.22, 0.03, 0.025]}>
          <circleGeometry args={[0.018, 16]} />
          <meshBasicMaterial color={isReady ? '#FDC32B' : '#555555'} />
        </mesh>
        <mesh position={[0.22, -0.03, 0.025]}>
          <circleGeometry args={[0.018, 16]} />
          <meshBasicMaterial color="#10B981" />
        </mesh>

        {/* Live Readout Text on 3D LED Display */}
        <Text
          position={[-0.05, 0.04, 0.026]}
          fontSize={0.034}
          color="#00E5FF"
          anchorX="center"
          anchorY="middle"
          maxWidth={0.38}
        >
          {readoutText}
        </Text>
        <Text
          position={[-0.05, -0.04, 0.026]}
          fontSize={0.022}
          color={isReady ? '#FDC32B' : '#778899'}
          anchorX="center"
          anchorY="middle"
          maxWidth={0.38}
        >
          {isReady ? 'TOCAR AQUÍ' : 'CENTRIFUGANDO'}
        </Text>
      </group>

      {/* ================= 3. PORTHOLE CAVITY & GLOWING ACCENT RIM ================= */}
      {/* Front Outer Collar Inset */}
      <mesh position={[0, -0.06, 0.91]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.73, 0.73, 0.04, 48, 1, true]} />
        <meshStandardMaterial color="#1D2025" roughness={0.3} metalness={0.85} />
      </mesh>

      {/* Dark Chrome Accent Bezel around Drum opening (Realistic, no weird glow) */}
      <mesh position={[0, -0.06, 0.925]}>
        <torusGeometry args={[0.67, 0.014, 16, 64]} />
        <meshStandardMaterial color="#2B3038" roughness={0.22} metalness={0.92} />
      </mesh>

      {/* Dark Flexible Rubber Gasket Bellow */}
      <mesh position={[0, -0.06, 0.86]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.66, 0.055, 16, 48]} />
        <meshStandardMaterial color="#181A1D" roughness={0.92} metalness={0.1} />
      </mesh>

      {/* Tub Housing Interior Liner */}
      <mesh position={[0, -0.06, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.67, 0.67, 1.1, 36, 1, true]} />
        <meshStandardMaterial color="#101215" roughness={0.7} metalness={0.3} side={THREE.BackSide} />
      </mesh>

      {/* ================= 4. ROTATING STAINLESS STEEL DRUM ================= */}
      <group position={[0, -0.06, 0.35]}>
        <group ref={drumGroupRef}>
          {/* Perforated Drum Cylinder Wall */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.61, 0.61, 1.05, 48, 1, true]} />
            <meshStandardMaterial
              map={perforationMap}
              bumpMap={perforationMap}
              bumpScale={0.035}
              color="#D8DEE4"
              roughness={0.18}
              metalness={0.94}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Drum Back Wall (Concave Pressed Steel with Star Ridges) */}
          <mesh position={[0, 0, -0.52]}>
            <circleGeometry args={[0.61, 36]} />
            <meshStandardMaterial color="#C5CBD1" roughness={0.25} metalness={0.92} />
          </mesh>
          <mesh position={[0, 0, -0.51]}>
            <torusGeometry args={[0.35, 0.03, 12, 36]} />
            <meshStandardMaterial color="#E0E4E8" roughness={0.18} metalness={0.95} />
          </mesh>

          {/* 3 Interior Curved Baffle Lifters (120° apart) */}
          {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, idx) => (
            <group key={idx} rotation={[0, 0, angle]}>
              <mesh position={[0, 0.53, 0]}>
                <boxGeometry args={[0.07, 0.12, 0.85]} />
                <meshStandardMaterial color="#3E434A" roughness={0.6} metalness={0.4} />
              </mesh>
            </group>
          ))}
        </group>

        {/* Floating Lottery Prize Balls Churning Inside Drum (Matching the hero visual) */}
        <group ref={ballsGroupRef}>
          {ballsInitialData.map((data, idx) => (
            <mesh key={idx} position={data.pos}>
              <sphereGeometry args={[data.r, 24, 24]} />
              <meshStandardMaterial
                map={ballTextures[idx % ballTextures.length]}
                roughness={0.2}
                metalness={0.45}
              />
            </mesh>
          ))}
        </group>

        {/* ================= 5. CLEAN NEUTRAL DRUM INTERIOR ILLUMINATION ================= */}
        {/* Stainless steel interior rim accent */}
        <mesh position={[0, 0, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.58, 0.012, 12, 36]} />
          <meshStandardMaterial color="#A4ADB8" roughness={0.3} metalness={0.8} />
        </mesh>
        <pointLight
          position={[0, 0.35, 0.1]}
          color="#EBF4FE"
          intensity={Math.min(1.2, drumLightIntensity * 0.5)}
          distance={2.6}
          decay={2}
        />
      </group>
    </group>
  );
};
