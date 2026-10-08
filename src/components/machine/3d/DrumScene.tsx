import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MachineState } from '../../../types';
import {
  createPrizeBallTexture,
  createDrumPerforationTexture,
  createRubberGasketTexture,
  createGlassDropletsTexture,
} from './textures';
import {
  createFrontWaterVolumeMaterial,
} from './waterShader';

export interface CycleInfo {
  name: string;
  rpm: number;
  flowType: string;
  description: string;
}

interface DrumSceneProps {
  machineState: MachineState;
  speedMultiplier?: number;
  interactive?: boolean;
  clickTrigger?: number;
  onCycleChange?: (info: CycleInfo) => void;
}

// 9 Prominent Prize Balls Configuration (Ultra-low CPU, high legibility)
const PRIZE_TIERS = [
  'Bs. 3.000',
  'Bs. 3.000',
  'Bs. 2.000',
  'Bs. 2.000',
  'Bs. 1.000',
  'Bs. 1.000',
  'Bs. 500',
  'Bs. 250',
  'Bs. 100',
];

interface BallPhysics {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: THREE.Euler;
  rotVel: THREE.Vector3;
  radius: number;
  mass: number;
  tier: string;
}

interface WashCycle {
  id: string;
  name: string;
  rpm: number;
  targetSpeed: number; // in rad/s
  waterLevel: number;
  turbulence: number;
  foamDensity: number;
  isOscillating?: boolean;
  flowType: string;
  description: string;
  duration: number; // seconds
}

// Gentle, low-overhead cycle configurations
const AUTONOMOUS_CYCLES: WashCycle[] = [
  {
    id: 'vaiven-suave',
    name: 'Vaivén Suave & Remojo',
    rpm: 16,
    targetSpeed: 1.65,
    waterLevel: -0.15,
    turbulence: 0.7,
    foamDensity: 1.1,
    isOscillating: true,
    flowType: 'Flujo Ondulante Bidireccional',
    description: 'Movimiento oscilante para inmersión de esferas',
    duration: 7.5,
  },
  {
    id: 'lavado-suave',
    name: 'Lavado Suave con Espuma',
    rpm: 24,
    targetSpeed: 2.5,
    waterLevel: -0.22,
    turbulence: 1.1,
    foamDensity: 1.4,
    isOscillating: false,
    flowType: 'Torbellino Frontal con Espuma',
    description: 'Arrastre continuo de paletas y caída dinámica en agua',
    duration: 8.0,
  },
  {
    id: 'centrifugado-moderado',
    name: 'Centrifugado Moderado',
    rpm: 48,
    targetSpeed: 5.0,
    waterLevel: -0.26,
    turbulence: 1.5,
    foamDensity: 1.6,
    isOscillating: false,
    flowType: 'Vórtice Centrífugo de Pared',
    description: 'Fuerza centrífuga donde el agua trepa por los costados',
    duration: 6.0,
  },
];

export const DrumScene: React.FC<DrumSceneProps> = ({
  machineState,
  speedMultiplier = 1.0,
  clickTrigger = 0,
  onCycleChange,
}) => {
  const drumGroupRef = useRef<THREE.Group>(null);
  const splashesRef = useRef<THREE.InstancedMesh>(null);
  const bubblesRef = useRef<THREE.InstancedMesh>(null);
  const ballsGroupRef = useRef<THREE.Group>(null);
  const ballMeshRefs = useRef<THREE.Mesh[]>([]);

  // Physics constants
  const DRUM_RADIUS = 2.05;
  const DRUM_FRONT_Z = 0.52;
  const DRUM_BACK_Z = -1.25;
  const BALL_RADIUS = 0.35; // Larger radius so prize numbers are bold, prominent and ultra-legible
  const VANE_COUNT = 3;
  const VANE_HEIGHT = 0.45;

  // Textures
  const textures = useMemo(() => {
    return {
      drumPerf: createDrumPerforationTexture(),
      gasket: createRubberGasketTexture(),
      droplets: createGlassDropletsTexture(),
      prizeBalls: {
        'Bs. 3.000': createPrizeBallTexture('Bs. 3.000'),
        'Bs. 2.000': createPrizeBallTexture('Bs. 2.000'),
        'Bs. 1.000': createPrizeBallTexture('Bs. 1.000'),
        'Bs. 500': createPrizeBallTexture('Bs. 500'),
        'Bs. 250': createPrizeBallTexture('Bs. 250'),
        'Bs. 100': createPrizeBallTexture('Bs. 100'),
      },
    };
  }, []);

  // Custom Shaders (Pure sapphire blue, pure white suds, zero green)
  const frontWaterMaterial = useMemo(() => createFrontWaterVolumeMaterial(), []);

  // Autonomous Cycle State
  const cycleIndex = useRef(0);
  const cycleTimeRemaining = useRef(AUTONOMOUS_CYCLES[0].duration);
  const currentAngularVel = useRef(AUTONOMOUS_CYCLES[0].targetSpeed);
  const currentWaterLevel = useRef(AUTONOMOUS_CYCLES[0].waterLevel);
  const currentTurbulence = useRef(AUTONOMOUS_CYCLES[0].turbulence);
  const currentFoamDensity = useRef(AUTONOMOUS_CYCLES[0].foamDensity);
  const drumAngle = useRef(0);

  // Click Random Surge Boost State
  const surgeBoostTimer = useRef(0);
  const surgeType = useRef(0);
  const prevClickTrigger = useRef(clickTrigger);

  // Initialize 18 Balls Physics State
  const balls = useMemo<BallPhysics[]>(() => {
    return PRIZE_TIERS.map((tier, i) => {
      const angle = -Math.PI / 2 + (i - 9) * 0.16 + (Math.random() - 0.5) * 0.2;
      const dist = 1.05 + Math.random() * 0.55;
      return {
        pos: new THREE.Vector3(
          Math.cos(angle) * dist,
          Math.sin(angle) * dist - 0.2,
          -0.75 + (i % 6) * 0.22 + (Math.random() - 0.5) * 0.1
        ),
        vel: new THREE.Vector3((Math.random() - 0.5) * 0.4, 0, (Math.random() - 0.5) * 0.2),
        rot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
        rotVel: new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 3
        ),
        radius: BALL_RADIUS,
        mass: 1.0,
        tier,
      };
    });
  }, []);

  // 12 Rising Bubbles (Ultra-lightweight & fluid on low-power devices)
  const BUBBLE_COUNT = 12;
  const bubbleParticles = useMemo(() => {
    const dummy = new THREE.Object3D();
    const data = [];
    for (let i = 0; i < BUBBLE_COUNT; i++) {
      data.push({
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * 2.8,
          -1.85 + Math.random() * 1.5,
          -0.8 + Math.random() * 1.1
        ),
        speedY: 0.7 + Math.random() * 1.2,
        wobbleFreq: 2.0 + Math.random() * 3.5,
        wobbleAmp: 0.04 + Math.random() * 0.08,
        scale: 0.02 + Math.random() * 0.04,
        offset: Math.random() * Math.PI * 2,
      });
    }
    return { dummy, data };
  }, []);

  // 8 Water Splash Droplets (Active only during spin, zero overhead when idle)
  const SPLASH_COUNT = 8;
  const splashParticles = useMemo(() => {
    const dummy = new THREE.Object3D();
    const data = [];
    for (let i = 0; i < SPLASH_COUNT; i++) {
      data.push({
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * 2.6,
          -0.5 + Math.random() * 1.2,
          -0.8 + Math.random() * 1.1
        ),
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          1 + Math.random() * 3,
          (Math.random() - 0.5) * 1.5
        ),
        scale: 0.025 + Math.random() * 0.04,
        life: Math.random(),
      });
    }
    return { dummy, data };
  }, []);

  // Handle Click Random Effect Trigger
  useEffect(() => {
    if (clickTrigger !== prevClickTrigger.current && clickTrigger > 0) {
      prevClickTrigger.current = clickTrigger;

      // Random effect among 5 exciting behaviors
      const effect = Math.floor(Math.random() * 5);
      surgeType.current = effect;
      surgeBoostTimer.current = 2.4; // 2.4 seconds active duration

      if (effect === 0) {
        // 0. Ola Gigante de Choque & Chapoteo (Wave Tsunami)
        currentTurbulence.current = 3.6;
        balls.forEach((b) => {
          b.vel.y += 3.5 + Math.random() * 2.5;
          b.vel.x += (Math.random() - 0.5) * 3.0;
        });
      } else if (effect === 1) {
        // 1. Torbellino Acelerado (Vortex Kick)
        currentAngularVel.current = (Math.random() > 0.5 ? 8.2 : -8.2);
        currentTurbulence.current = 2.8;
      } else if (effect === 2) {
        // 2. Inversión Brusca con Choque de Pelotas
        currentAngularVel.current = -currentAngularVel.current * 1.8;
        currentTurbulence.current = 3.0;
        balls.forEach((b) => {
          b.rotVel.z += (Math.random() - 0.5) * 12;
          b.vel.x += (Math.random() - 0.5) * 3.2;
        });
      } else if (effect === 3) {
        // 3. Erupción de Burbujas & Espuma
        currentFoamDensity.current = 3.2;
        currentTurbulence.current = 2.2;
        balls.forEach((b) => {
          b.vel.y += 2.8;
        });
      } else if (effect === 4) {
        // 4. Doble Vaivén Sísmico
        currentAngularVel.current = 6.0;
        currentTurbulence.current = 2.5;
      }
    }
  }, [clickTrigger, balls]);

  // Notify initial cycle
  useEffect(() => {
    if (onCycleChange) {
      const c = AUTONOMOUS_CYCLES[0];
      onCycleChange({
        name: c.name,
        rpm: c.rpm,
        flowType: c.flowType,
        description: c.description,
      });
    }
  }, [onCycleChange]);

  // Main Low-Overhead Physics & Animation Loop
  useFrame((state, delta) => {
    // If the browser tab is hidden or minimized, skip processing to conserve battery and CPU
    if (typeof document !== 'undefined' && document.hidden) return;

    const dt = Math.min(delta, 0.033);
    const time = state.clock.getElapsedTime();

    // 1. AUTONOMOUS RANDOM CYCLE CONTROLLER
    cycleTimeRemaining.current -= dt;
    if (surgeBoostTimer.current > 0) {
      surgeBoostTimer.current -= dt;
    }

    if (cycleTimeRemaining.current <= 0) {
      let nextIndex = Math.floor(Math.random() * AUTONOMOUS_CYCLES.length);
      if (nextIndex === cycleIndex.current) {
        nextIndex = (nextIndex + 1) % AUTONOMOUS_CYCLES.length;
      }
      cycleIndex.current = nextIndex;
      const nextCycle = AUTONOMOUS_CYCLES[nextIndex];
      cycleTimeRemaining.current = nextCycle.duration + (Math.random() - 0.5) * 1.6;

      if (onCycleChange) {
        onCycleChange({
          name: nextCycle.name,
          rpm: nextCycle.rpm,
          flowType: nextCycle.flowType,
          description: nextCycle.description,
        });
      }
    }

    const activeCycle = AUTONOMOUS_CYCLES[cycleIndex.current];

    // Compute target rotational speed (smooth, comfortable)
    let targetSpeed = activeCycle.targetSpeed;
    if (activeCycle.isOscillating) {
      targetSpeed = activeCycle.targetSpeed * Math.sin(time * 1.8);
    }

    // Override if game is currently in 'washing' draw phase
    if (machineState === 'washing') {
      targetSpeed = 12.0; // Centrifugado turbo durante sorteo
    } else if (machineState === 'opening' || machineState === 'awarding') {
      targetSpeed = 0.4;
    }

    // If click surge is active, maintain dynamic boost
    if (surgeBoostTimer.current > 0) {
      if (surgeType.current === 4) {
        // Double shake oscillation
        targetSpeed = 5.0 * Math.sin(time * 6.0);
      }
    }

    // Smooth Lerp parameters
    currentAngularVel.current = THREE.MathUtils.lerp(
      currentAngularVel.current,
      targetSpeed * speedMultiplier,
      dt * 1.8
    );
    const isDraining = machineState === 'opening' || machineState === 'awarding';
    const targetWater = isDraining
      ? -3.2 // Complete drainage down and out of the drum (desagüe total)
      : machineState === 'washing'
        ? -0.32
        : activeCycle.waterLevel;
    const targetFoam = isDraining
      ? 0.0
      : surgeBoostTimer.current > 0
        ? currentFoamDensity.current
        : activeCycle.foamDensity;

    currentWaterLevel.current = THREE.MathUtils.lerp(
      currentWaterLevel.current,
      targetWater,
      isDraining ? dt * 4.6 : dt * 1.4
    );
    currentTurbulence.current = THREE.MathUtils.lerp(
      currentTurbulence.current,
      isDraining ? 0.0 : (surgeBoostTimer.current > 0 ? currentTurbulence.current : activeCycle.turbulence),
      isDraining ? dt * 4.0 : dt * 1.6
    );
    currentFoamDensity.current = THREE.MathUtils.lerp(
      currentFoamDensity.current,
      targetFoam,
      isDraining ? dt * 5.0 : dt * 1.6
    );

    drumAngle.current += currentAngularVel.current * dt;

    if (drumGroupRef.current) {
      drumGroupRef.current.rotation.z = drumAngle.current;
    }

    const spinFactor = currentAngularVel.current;
    const waveSloshY = currentWaterLevel.current + Math.sin(time * 2.8) * 0.10;

    // 2. UPDATE SHADER UNIFORMS
    frontWaterMaterial.uniforms.uTime.value = time;
    frontWaterMaterial.uniforms.uSpinSpeed.value = spinFactor / 2.0;
    frontWaterMaterial.uniforms.uTurbulence.value = currentTurbulence.current;
    frontWaterMaterial.uniforms.uWaterLevel.value = currentWaterLevel.current;
    frontWaterMaterial.uniforms.uFoamDensity.value = currentFoamDensity.current;

    // 3. BALLS RIGID-BODY PHYSICS & BUOYANCY
    const paddleAngles = [
      drumAngle.current,
      drumAngle.current + (Math.PI * 2) / 3,
      drumAngle.current + (Math.PI * 4) / 3,
    ];

    for (let i = 0; i < balls.length; i++) {
      const b = balls[i];

      // Gravity
      b.vel.y += -9.81 * dt;

      // Submerged check against dynamic water level
      const dynamicLocalSurface =
        waveSloshY +
        Math.sin(b.pos.x * 2.2 - time * 2.6 * Math.sign(spinFactor || 1)) * 0.12 * currentTurbulence.current -
        b.pos.x * clamp(spinFactor * 0.18, -0.7, 0.7);

      const isSubmerged = b.pos.y < dynamicLocalSurface;

      if (isSubmerged) {
        const depth = dynamicLocalSurface - b.pos.y;
        const buoyancy = Math.min(depth * 34.0, 18.0);
        b.vel.y += buoyancy * dt;

        // Fluid resistance
        b.vel.x *= Math.pow(0.88, dt * 60);
        b.vel.y *= Math.pow(0.92, dt * 60);
        b.vel.z *= Math.pow(0.88, dt * 60);

        // Gentle swirl force
        const swirlTangential = spinFactor * 0.85;
        b.vel.x += -b.pos.y * swirlTangential * dt * 0.4;
        b.vel.y += b.pos.x * swirlTangential * dt * 0.4;
      }

      // Lifter Paddles
      const ballR = Math.sqrt(b.pos.x * b.pos.x + b.pos.y * b.pos.y);
      const ballTheta = Math.atan2(b.pos.y, b.pos.x);

      for (let p = 0; p < VANE_COUNT; p++) {
        let diff = (ballTheta - paddleAngles[p]) % (Math.PI * 2);
        if (diff < -Math.PI) diff += Math.PI * 2;
        if (diff > Math.PI) diff -= Math.PI * 2;

        if (diff >= -0.28 && diff <= 0.38 && ballR > DRUM_RADIUS - VANE_HEIGHT - b.radius) {
          const pushSpeed = spinFactor * ballR * 1.1;
          const tangX = -Math.sin(paddleAngles[p]) * pushSpeed;
          const tangY = Math.cos(paddleAngles[p]) * pushSpeed;

          b.vel.x = THREE.MathUtils.lerp(b.vel.x, tangX, 0.45);
          b.vel.y = THREE.MathUtils.lerp(b.vel.y, tangY, 0.45);
          b.rotVel.z += spinFactor * 1.2 * dt;
        }
      }

      // Centrifugal force when drum spins faster
      if (Math.abs(spinFactor) > 3.0) {
        const centForce = Math.pow(spinFactor, 2) * 0.07;
        if (ballR > 0.1) {
          b.vel.x += (b.pos.x / ballR) * centForce * dt;
          b.vel.y += (b.pos.y / ballR) * centForce * dt;
        }
      }

      // Integrate Position
      b.pos.addScaledVector(b.vel, dt);

      // Drum Wall Boundary Collisions
      const currentR = Math.sqrt(b.pos.x * b.pos.x + b.pos.y * b.pos.y);
      const maxAllowedR = DRUM_RADIUS - b.radius;
      if (currentR > maxAllowedR) {
        const nx = b.pos.x / currentR;
        const ny = b.pos.y / currentR;
        b.pos.x = nx * maxAllowedR;
        b.pos.y = ny * maxAllowedR;

        const dot = b.vel.x * nx + b.vel.y * ny;
        if (dot > 0) {
          b.vel.x -= (1 + 0.65) * dot * nx;
          b.vel.y -= (1 + 0.65) * dot * ny;
          b.vel.x *= 0.94;
          b.vel.y *= 0.94;
          b.rotVel.z += (nx * b.vel.y - ny * b.vel.x) * 0.4;
        }
      }

      // Front & Back Wall Confinement
      if (b.pos.z > DRUM_FRONT_Z - b.radius) {
        b.pos.z = DRUM_FRONT_Z - b.radius;
        if (b.vel.z > 0) b.vel.z = -b.vel.z * 0.6;
      }
      if (b.pos.z < DRUM_BACK_Z + b.radius) {
        b.pos.z = DRUM_BACK_Z + b.radius;
        if (b.vel.z < 0) b.vel.z = -b.vel.z * 0.6;
      }

      // Ball-Ball Collisions
      for (let j = i + 1; j < balls.length; j++) {
        const b2 = balls[j];
        const dx = b2.pos.x - b.pos.x;
        const dy = b2.pos.y - b.pos.y;
        const dz = b2.pos.z - b.pos.z;
        const distSq = dx * dx + dy * dy + dz * dz;
        const minDist = b.radius + b2.radius;

        if (distSq < minDist * minDist && distSq > 0.0001) {
          const d = Math.sqrt(distSq);
          const nx = dx / d;
          const ny = dy / d;
          const nz = dz / d;

          const overlap = 0.5 * (minDist - d);
          b.pos.x -= nx * overlap;
          b.pos.y -= ny * overlap;
          b.pos.z -= nz * overlap;
          b2.pos.x += nx * overlap;
          b2.pos.y += ny * overlap;
          b2.pos.z += nz * overlap;

          const kx = b.vel.x - b2.vel.x;
          const ky = b.vel.y - b2.vel.y;
          const kz = b.vel.z - b2.vel.z;
          const p = (2 * (nx * kx + ny * ky + nz * kz)) / (b.mass + b2.mass);

          b.vel.x -= p * b2.mass * nx * 0.8;
          b.vel.y -= p * b2.mass * ny * 0.8;
          b.vel.z -= p * b2.mass * nz * 0.8;
          b2.vel.x += p * b.mass * nx * 0.8;
          b2.vel.y += p * b.mass * ny * 0.8;
          b2.vel.z += p * b.mass * nz * 0.8;
        }
      }

      // Rotations
      b.rot.x += b.rotVel.x * dt;
      b.rot.y += b.rotVel.y * dt;
      b.rot.z += b.rotVel.z * dt;

      const mesh = ballMeshRefs.current[i];
      if (mesh) {
        mesh.position.copy(b.pos);
        mesh.rotation.copy(b.rot);
      }
    }

    // 4. UPDATE RISING BUBBLES
    if (bubblesRef.current) {
      if (isDraining || currentWaterLevel.current < -1.2) {
        bubblesRef.current.visible = false;
      } else {
        bubblesRef.current.visible = true;
        const { dummy, data } = bubbleParticles;
        const surfaceY = currentWaterLevel.current + 0.1;
        const speedMult = surgeBoostTimer.current > 0 && surgeType.current === 3 ? 2.8 : 1.0;

        for (let b = 0; b < BUBBLE_COUNT; b++) {
          const bp = data[b];
          bp.pos.y += bp.speedY * dt * speedMult;
          bp.pos.x += Math.sin(time * bp.wobbleFreq + bp.offset) * bp.wobbleAmp * dt + spinFactor * 0.03 * dt;

          if (bp.pos.y > surfaceY) {
            bp.pos.y = -1.9 + Math.random() * 0.4;
            bp.pos.x = (Math.random() - 0.5) * 2.7;
            bp.pos.z = -0.8 + Math.random() * 1.1;
          }

          dummy.position.copy(bp.pos);
          dummy.scale.set(bp.scale, bp.scale, bp.scale);
          dummy.updateMatrix();
          bubblesRef.current.setMatrixAt(b, dummy.matrix);
        }
        bubblesRef.current.instanceMatrix.needsUpdate = true;
      }
    }

    // 5. UPDATE WATER SPLASH DROPLETS (Only active during washing/spinning, zero CPU when idle)
    if (splashesRef.current) {
      if (machineState !== 'washing') {
        splashesRef.current.visible = false;
      } else {
        splashesRef.current.visible = true;
        const { dummy, data } = splashParticles;
        for (let s = 0; s < SPLASH_COUNT; s++) {
          const p = data[s];
          p.life -= dt * (0.8 + Math.abs(spinFactor) * 0.2);

          if (p.life <= 0) {
            p.pos.set(
              (Math.random() - 0.5) * 2.5,
              currentWaterLevel.current + Math.random() * 0.3,
              -0.8 + Math.random() * 1.2
            );
            const sprayAng = drumAngle.current + Math.random() * 1.2;
            p.vel.set(
              -Math.sin(sprayAng) * (1.8 + Math.abs(spinFactor) * 1.2) + (Math.random() - 0.5),
              Math.cos(sprayAng) * (2.0 + Math.abs(spinFactor) * 1.2) + Math.random() * 1.8,
              (Math.random() - 0.5) * 1.5
            );
            p.life = 1.0;
          } else {
            p.vel.y -= 7.8 * dt;
            p.pos.addScaledVector(p.vel, dt);
          }

          dummy.position.copy(p.pos);
          const curScale = p.scale * Math.sin(p.life * Math.PI);
          dummy.scale.set(curScale, curScale, curScale);
          dummy.updateMatrix();
          splashesRef.current.setMatrixAt(s, dummy.matrix);
        }
        splashesRef.current.instanceMatrix.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      {/* ================= LIGHTING SETUP ================= */}
      <ambientLight intensity={0.9} color="#ffffff" />

      {/* Interior Cool-White LED Spot (Washer Drum Light) */}
      <spotLight
        position={[0, 1.95, 0.5]}
        target-position={[0, -0.4, -0.5]}
        angle={Math.PI / 2.7}
        penumbra={0.7}
        intensity={2.0}
        color="#ffffff"
        castShadow={false}
      />

      {/* Direct Key Light to make PRIZE BALLS POP with bright golden brilliance */}
      <pointLight position={[0, 0.3, 1.1]} intensity={2.2} distance={4.0} color="#fffbeb" />

      {/* Crystal Clear Sapphire Underwater Glow (No green!) */}
      <pointLight position={[0, -0.8, 0.0]} intensity={2.6} distance={4.0} color="#0072ce" />

      {/* Top Wave Meniscus Specular Rim Light */}
      <directionalLight position={[0.8, 1.8, 2.5]} intensity={1.2} color="#ffffff" />

      {/* ================= 2. ROTATING STAINLESS STEEL DRUM ================= */}
      <group ref={drumGroupRef}>
        <mesh position={[0, 0, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[DRUM_RADIUS, DRUM_RADIUS, 1.8, 36, 1, true]} />
          <meshStandardMaterial
            map={textures.drumPerf}
            color="#3a424d"
            roughness={0.42}
            metalness={0.88}
            side={THREE.BackSide}
          />
        </mesh>

        <mesh position={[0, 0, -1.3]}>
          <circleGeometry args={[DRUM_RADIUS, 32]} />
          <meshStandardMaterial
            map={textures.drumPerf}
            color="#262d36"
            roughness={0.50}
            metalness={0.85}
          />
        </mesh>

        <mesh position={[0, 0, -1.26]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.52, 0.08, 20]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.18} />
        </mesh>

        {/* 3 Lifter Vanes */}
        {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, index) => {
          return (
            <group key={index} rotation={[0, 0, angle]}>
              <mesh position={[0, DRUM_RADIUS - VANE_HEIGHT * 0.5, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.06, 0.28, 1.65, 3]} />
                <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.35} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* ================= 3. 9 PHYSICS-DRIVEN PRIZE BALLS (HIGH CONTRAST & LUSTER) ================= */}
      <group ref={ballsGroupRef}>
        {balls.map((b, i) => {
          const ballTex = textures.prizeBalls[b.tier as keyof typeof textures.prizeBalls];
          return (
            <mesh
              key={i}
              ref={(el) => {
                if (el) ballMeshRefs.current[i] = el;
              }}
              position={b.pos}
              rotation={b.rot}
              castShadow={false}
            >
              <sphereGeometry args={[BALL_RADIUS, 18, 14]} />
              <meshStandardMaterial
                map={ballTex}
                roughness={0.25}
                metalness={0.12}
              />
            </mesh>
          );
        })}
      </group>

      {/* ================= 4. CRYSTAL-CLEAR PHOTOREALISTIC WATER SYSTEM ================= */}
      {/* Real circular fluid volume with caustics, sloshing waves & foam */}
      <mesh
        material={frontWaterMaterial}
        position={[0, 0, 0.44]}
      >
        <circleGeometry args={[2.02, 36]} />
      </mesh>

      {/* Rising Bubbles Stream (Standard material without expensive framebuffer transmission) */}
      <instancedMesh
        ref={bubblesRef}
        args={[undefined, undefined, BUBBLE_COUNT]}
      >
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.1}
          metalness={0.05}
          transparent
          opacity={0.65}
        />
      </instancedMesh>

      {/* Water Splash Droplets */}
      <instancedMesh
        ref={splashesRef}
        args={[undefined, undefined, SPLASH_COUNT]}
      >
        <sphereGeometry args={[1, 6, 6]} />
        <meshStandardMaterial
          color="#dbeafe"
          roughness={0.1}
          metalness={0.05}
          transparent
          opacity={0.8}
        />
      </instancedMesh>

    </group>
  );
};

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
