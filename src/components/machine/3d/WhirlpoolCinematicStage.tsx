import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import gsap from 'gsap';

import { WashingMachine } from './WashingMachine';
import { DoorRig } from './DoorRig';
import { WaterPhysicsFloor } from './WaterPhysicsFloor';
import { WaterCascadeTorrent } from './WaterCascadeTorrent';
import { PrizeBall3D } from './PrizeBall3D';
import { playWaterSplashSound } from '../../../utils/sound';

export type MachinePhase = 'idle' | 'spinning' | 'opening' | 'awarding' | 'revealed';

interface WhirlpoolCinematicStageProps {
  machinePhase: MachinePhase;
  prizeText?: string;
  isJackpot?: boolean;
  readoutText?: string;
  onScreenClick?: () => void;
  isReady?: boolean;
  className?: string;
}

/**
 * Inner 3D Cinematic Scene where Three.js and GSAP orchestrate
 * camera movement, door opening, water cascade, floor puddles,
 * and 3D prize ball with native 60fps frame loop updates.
 */
const CinematicSceneContent: React.FC<{
  machinePhase: MachinePhase;
  prizeText: string;
  isJackpot: boolean;
  readoutText: string;
  onScreenClick?: () => void;
  isReady: boolean;
}> = ({
  machinePhase,
  prizeText,
  isJackpot,
  readoutText,
  onScreenClick,
  isReady,
}) => {
  const { camera, size } = useThree();
  const isMobile = size.width < 640;

  // Master animation coordinates driven by GSAP timeline and frame loop
  const anim = useRef({
    // Camera coordinates & LookAt target
    camX: 0,
    camY: 0.05,
    camZ: isMobile ? 4.85 : 4.25,
    lookX: 0,
    lookY: -0.05,
    lookZ: 0,
    shakeIntensity: 0,

    // Washer Rig state
    doorAngle: 0,
    drumRotation: 0,
    drumSpeed: 0.5,
    drumLight: 1.0,

    // Physical Ball position & rotation
    ballX: 0,
    ballY: -0.22,
    ballZ: 0.4,
    ballRotX: 0,
    ballRotY: 0,
    ballRotZ: 0,

    // Water & Torrent state
    waterCascadeFlow: 0,
    wetness: 0,
    dryProgress: 0,
    revealProgress: 0,
  });

  // Direct mutable refs passed to child meshes for 60fps frame loop updates
  const doorAngleRef = useRef(0);
  const ballPosRef = useRef<[number, number, number]>([0, -0.22, 0.4]);
  const ballRotRef = useRef<[number, number, number]>([0, 0, 0]);
  const waterFlowRef = useRef(0);
  const wetnessRef = useRef(0);
  const dryProgressRef = useRef(0);
  const revealProgressRef = useRef(0);

  // Discrete state flags
  const [splashActive, setSplashActive] = useState(false);
  const [ballVisible, setBallVisible] = useState(false);

  // Active GSAP Timeline
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Respond to phase changes
  useEffect(() => {
    // Kill any existing timeline
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    const defaultCamZ = isMobile ? 4.85 : 4.25;

    // ==========================================
    // PHASE 1: IDLE / RESET
    // ==========================================
    if (machinePhase === 'idle') {
      const tl = gsap.timeline();
      timelineRef.current = tl;

      // Smooth camera reset to frontal perspective
      tl.to(
        anim.current,
        {
          camX: 0,
          camY: 0.05,
          camZ: defaultCamZ,
          lookX: 0,
          lookY: -0.05,
          lookZ: 0,
          shakeIntensity: 0,
          doorAngle: 0,
          drumSpeed: 0.5,
          waterCascadeFlow: 0,
          wetness: 0,
          dryProgress: 1,
          revealProgress: 0,
          ballX: 0,
          ballY: -0.22,
          ballZ: 0.4,
          ballRotX: 0,
          ballRotY: 0,
          duration: 1.0,
          ease: 'power2.out',
        },
        0
      );

      setSplashActive(false);
      setBallVisible(false);
    }

    // ==========================================
    // PHASE 2: SPINNING (TURBO CENTRIFUGE)
    // ==========================================
    if (machinePhase === 'spinning') {
      const tl = gsap.timeline();
      timelineRef.current = tl;

      // Reset door and ball inside drum
      anim.current.doorAngle = 0;
      anim.current.waterCascadeFlow = 0;
      anim.current.wetness = 0;
      anim.current.ballX = 0;
      anim.current.ballY = -0.22;
      anim.current.ballZ = 0.4;
      anim.current.ballRotX = 0;
      anim.current.ballRotY = 0;
      setBallVisible(false);
      setSplashActive(false);

      // Accelerate drum to turbo centrifuge RPM with subtle torque cam vibration
      tl.to(
        anim.current,
        {
          drumSpeed: 28,
          camZ: defaultCamZ - 0.1,
          shakeIntensity: 0.003, // subtle authentic physical vibration
          duration: 2.4,
          ease: 'power2.in',
        },
        0
      );
    }

    // ==========================================
    // PHASE 3: OPENING (DOOR OPENS + CAMERA CHANGE + WATER CASACADE + BALL ON FLOOR)
    // ==========================================
    if (machinePhase === 'opening') {
      const tl = gsap.timeline();
      timelineRef.current = tl;

      // Drum decelerates to a gentle stop
      tl.to(
        anim.current,
        {
          drumSpeed: 0,
          shakeIntensity: 0,
          duration: 0.8,
          ease: 'power2.out',
        },
        0
      );

      // 1. Tapa de lavadora swings open in 3D perspective around left hinge
      tl.to(
        anim.current,
        {
          doorAngle: -2.0, // ~ -115 degrees outwards to the left
          duration: 1.1,
          ease: 'power3.out',
        },
        0.1
      );

      // 2. THE CAMERA CHANGE: Smooth cinematic glide down and in towards floor
      tl.to(
        anim.current,
        {
          camX: 0,
          camY: -0.52,
          camZ: isMobile ? 3.65 : 3.2,
          lookX: 0,
          lookY: -0.92,
          lookZ: 0.75,
          duration: 1.3,
          ease: 'power3.inOut',
        },
        0.15
      );

      // 3. Water Cascade pours down over lower lip into the floor
      tl.to(
        anim.current,
        {
          waterCascadeFlow: 1.0,
          wetness: 1.0,
          dryProgress: 0,
          duration: 0.6,
          ease: 'power2.out',
        },
        0.25
      );

      // Trigger floor splash sound & particle droplets when water impacts floor
      tl.call(
        () => {
          playWaterSplashSound();
          setSplashActive(true);
          setBallVisible(true);
        },
        undefined,
        0.4
      );

      // 4. Physical 3D Prize Ball rolls out with the water torrent down onto the floor
      tl.fromTo(
        anim.current,
        {
          ballX: 0,
          ballY: -0.22,
          ballZ: 0.45,
          ballRotX: 0,
          ballRotY: 0,
        },
        {
          ballZ: 1.35,
          ballRotX: Math.PI * 2.2, // realistic rolling rotation
          duration: 0.9,
          ease: 'power2.out',
        },
        0.4
      );

      // Parabolic fall down to floor impact height (y = -0.92)
      tl.fromTo(
        anim.current,
        { ballY: -0.22 },
        {
          ballY: -0.92,
          duration: 0.8,
          ease: 'power2.in',
        },
        0.4
      );

      // Gentle bounce & roll forward into final spotlight position on wet floor
      tl.to(
        anim.current,
        {
          ballY: -0.84, // slight bounce up
          duration: 0.18,
          ease: 'power2.out',
        },
        1.2
      );

      tl.to(
        anim.current,
        {
          ballY: -0.92, // settle back to floor
          ballZ: 1.45, // roll slightly forward
          ballRotX: Math.PI * 2.5, // finish aligned
          ballRotY: 0, // front medallion perfectly faces camera
          duration: 0.22,
          ease: 'bounce.out',
        },
        1.38
      );

      // Taper water flow to a steady gentle stream/trickle
      tl.to(
        anim.current,
        {
          waterCascadeFlow: 0.35,
          duration: 1.2,
          ease: 'power2.out',
        },
        1.2
      );
    }

    // ==========================================
    // PHASE 4 & 5: AWARDING & REVEALED
    // ==========================================
    if (machinePhase === 'awarding' || machinePhase === 'revealed') {
      setBallVisible(true);
      const tl = gsap.timeline();
      timelineRef.current = tl;

      // Close-up hero framing on the 3D prize ball resting on the wet floor
      tl.to(
        anim.current,
        {
          doorAngle: -2.0,
          camY: -0.56,
          camZ: isMobile ? 3.45 : 3.05,
          lookY: -0.92,
          lookZ: 0.85,
          revealProgress: 1.0,
          waterCascadeFlow: 0.15,
          wetness: 1.0,
          ballY: -0.92,
          ballZ: 1.45,
          duration: 1.2,
          ease: 'expo.out',
        },
        0
      );
    }
  }, [machinePhase, isMobile]);

  // Frame Loop: Smooth camera orientation, vibration, and mutable ref distribution
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);

    // Continuous drum rotation
    anim.current.drumRotation += anim.current.drumSpeed * dt;

    // Distribute mutable states to refs for 60fps children without triggering React re-renders
    doorAngleRef.current = anim.current.doorAngle;
    ballPosRef.current = [anim.current.ballX, anim.current.ballY, anim.current.ballZ];
    ballRotRef.current = [anim.current.ballRotX, anim.current.ballRotY, anim.current.ballRotZ];
    waterFlowRef.current = anim.current.waterCascadeFlow;
    wetnessRef.current = anim.current.wetness;
    dryProgressRef.current = anim.current.dryProgress;
    revealProgressRef.current = anim.current.revealProgress;

    // Camera torque vibration
    const shake = anim.current.shakeIntensity;
    const shakeX = (Math.random() - 0.5) * 2 * shake;
    const shakeY = (Math.random() - 0.5) * 2 * shake;

    camera.position.set(
      anim.current.camX + shakeX,
      anim.current.camY + shakeY,
      anim.current.camZ
    );
    camera.lookAt(
      anim.current.lookX,
      anim.current.lookY,
      anim.current.lookZ
    );
  });

  return (
    <>
      {/* ================= STUDIO LIGHTING (CLEAN SHOWROOM, NO WEIRD GLOWS) ================= */}
      <Environment preset="studio" />

      {/* Balanced neutral ambient fill */}
      <ambientLight color="#FFFFFF" intensity={0.65} />

      {/* Key Light: Lateral Soft Product Spotlight */}
      <directionalLight
        position={[4.5, 6, 4.5]}
        color="#FFFFFF"
        intensity={2.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />

      {/* Neutral hairlight silhouette */}
      <directionalLight
        position={[-3.5, 4.5, -4.5]}
        color="#E2EEF8"
        intensity={2.4}
      />

      {/* Soft Ground Floor Fill */}
      <directionalLight position={[0, -2, 3]} color="#FFFFFF" intensity={0.4} />

      {/* ================= 1. WASHING MACHINE CHASSIS & ROTATING DRUM ================= */}
      <WashingMachine
        drumRotation={anim.current.drumRotation}
        readoutText={readoutText}
        isReady={isReady}
        onScreenClick={onScreenClick}
        drumLightIntensity={anim.current.drumLight}
      />

      {/* ================= 2. 3D DOOR RIG WITH AUTHENTIC GLASS LID ================= */}
      <DoorRig doorAngleRef={doorAngleRef} />

      {/* ================= 3. PHYSICAL 3D WATER CASCADE (POURING OUT ONTO FLOOR) ================= */}
      <WaterCascadeTorrent
        activeProgress={anim.current.waterCascadeFlow}
        activeProgressRef={waterFlowRef}
      />

      {/* ================= 4. REFLECTIVE WET FLOOR WITH WATER PHYSICS ================= */}
      <WaterPhysicsFloor
        wetness={anim.current.wetness}
        wetnessRef={wetnessRef}
        splashActive={splashActive}
        dryProgress={anim.current.dryProgress}
        dryProgressRef={dryProgressRef}
      />

      {/* ================= 5. 3D WINNING PRIZE BALL WITH ASSET TEXTURE ON FLOOR ================= */}
      <PrizeBall3D
        prizeText={prizeText}
        isJackpot={isJackpot}
        ballPos={[anim.current.ballX, anim.current.ballY, anim.current.ballZ]}
        ballPosRef={ballPosRef}
        ballRotRef={ballRotRef}
        revealProgress={anim.current.revealProgress}
        revealProgressRef={revealProgressRef}
        visible={ballVisible}
      />
    </>
  );
};

export const WhirlpoolCinematicStage: React.FC<WhirlpoolCinematicStageProps> = ({
  machinePhase,
  prizeText = 'Bs. 3.000',
  isJackpot = false,
  readoutText = 'Listo para girar',
  onScreenClick,
  isReady = true,
  className = '',
}) => {
  return (
    <div className={`relative w-full h-full overflow-visible select-none ${className}`}>
      <Canvas
        camera={{
          position: [0, 0.05, 4.35],
          fov: 44,
          near: 0.1,
          far: 30,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2)]}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <CinematicSceneContent
            machinePhase={machinePhase}
            prizeText={prizeText}
            isJackpot={isJackpot}
            readoutText={readoutText}
            onScreenClick={onScreenClick}
            isReady={isReady}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
