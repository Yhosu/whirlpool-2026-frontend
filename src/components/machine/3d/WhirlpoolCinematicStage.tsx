import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import gsap from 'gsap';
import confetti from 'canvas-confetti';

import { WashingMachine } from './WashingMachine';
import { DoorRig } from './DoorRig';
import { WaterPhysicsFloor } from './WaterPhysicsFloor';
import { PrizeReveal } from './PrizeReveal';
import {
  startSpinSound,
  playDoorOpenSound,
  playCapsuleEjectSound,
  playWinSound,
  playWaterSplashSound,
} from '../../../utils/sound';

export type MachinePhase = 'idle' | 'spinning' | 'opening' | 'cameraPan' | 'breaking' | 'revealed';

interface WhirlpoolCinematicStageProps {
  machinePhase: MachinePhase;
  prizeText?: string;
  isJackpot?: boolean;
  onPhaseChange?: (phase: MachinePhase) => void;
  onSpinFinished?: () => void;
  onScreenClick?: () => void;
  readoutText?: string;
  isReady?: boolean;
}

/**
 * Inner 3D Cinematic Scene where GSAP controls camera, rig, and physical effects
 * completely in the Three.js frame loop without React re-render performance drops.
 */
const CinematicSceneContent: React.FC<{
  machinePhase: MachinePhase;
  prizeText: string;
  isJackpot: boolean;
  onPhaseChange?: (phase: MachinePhase) => void;
  onSpinFinished?: () => void;
  onScreenClick?: () => void;
  readoutText: string;
  isReady: boolean;
}> = ({
  machinePhase,
  prizeText,
  isJackpot,
  onPhaseChange,
  onSpinFinished,
  onScreenClick,
  readoutText,
  isReady,
}) => {
  const { camera } = useThree();

  // Mutable animation state driven exclusively by GSAP timeline
  const anim = useRef({
    // Camera coordinates & LookAt target
    camX: 0,
    camY: 0.1,
    camZ: 4.6,
    lookX: 0,
    lookY: 0,
    lookZ: 0,
    shakeIntensity: 0,

    // Washer Rig state
    doorAngle: 0,
    drumRotation: 0,
    drumSpeed: 0.4,
    drumLight: 2.2,

    // Physical Ball position
    ballX: 0,
    ballY: -0.06,
    ballZ: 0.35,

    // Water & Prize Triggers
    wetness: 0,
    dryProgress: 0,
    revealProgress: 0,
  });

  // Direct mutable refs passed to children for 60fps frame loop updates
  const doorAngleRef = useRef(0);
  const ballPosRef = useRef<[number, number, number]>([0, -0.06, 0.35]);
  const wetnessRef = useRef(0);
  const dryProgressRef = useRef(0);
  const revealProgressRef = useRef(0);

  // Discrete state flags that only flip once per lifecycle
  const [splashActive, setSplashActive] = useState(false);
  const [breakTrigger, setBreakTrigger] = useState(false);

  // Master GSAP Timeline reference
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Trigger spin choreography sequence
  useEffect(() => {
    if (machinePhase === 'spinning') {
      // Kill any ongoing timeline
      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      const audioStop = startSpinSound();

      // Reset animation state
      anim.current.doorAngle = 0;
      anim.current.drumSpeed = 0.4;
      anim.current.ballX = 0;
      anim.current.ballY = -0.06;
      anim.current.ballZ = 0.35;
      anim.current.wetness = 0;
      anim.current.dryProgress = 0;
      anim.current.revealProgress = 0;
      anim.current.shakeIntensity = 0;

      doorAngleRef.current = 0;
      ballPosRef.current = [0, -0.06, 0.35];
      wetnessRef.current = 0;
      dryProgressRef.current = 0;
      revealProgressRef.current = 0;

      setSplashActive(false);
      setBreakTrigger(false);

      // Create Strict Cinematic GSAP Timeline
      const tl = gsap.timeline({
        onComplete: () => {
          onSpinFinished?.();
        },
      });
      timelineRef.current = tl;

      // ================= PHASE 1: HIGH SPEED ACCELERATION (0s - 2.2s) =================
      tl.to(
        anim.current,
        {
          drumSpeed: 30,
          camZ: 4.15,
          camY: 0.05,
          duration: 2.2,
          ease: 'power2.in',
        },
        0
      );

      // ================= PHASE 2: DOOR OPEN & WATER TORRENT (2.2s - 3.2s) =================
      tl.call(
        () => {
          audioStop();
          playDoorOpenSound();
          playWaterSplashSound();
          setSplashActive(true);
          onPhaseChange?.('opening');
        },
        undefined,
        2.2
      );

      tl.to(
        anim.current,
        {
          doorAngle: -1.95, // ~ -112 degrees outwards to the left
          drumSpeed: 4.0,
          wetness: 1.0,
          duration: 0.9,
          ease: 'power3.out',
        },
        2.2
      );

      // ================= PHASE 3: CAMERA PAN & BALL CASCADE (3.1s - 4.2s) =================
      tl.call(
        () => {
          onPhaseChange?.('cameraPan');
        },
        undefined,
        3.1
      );

      // Camera smoothly tracks downward following the water cascade and ball
      tl.to(
        anim.current,
        {
          camY: -0.45,
          camZ: 3.25,
          lookY: -0.75,
          lookZ: 1.25,
          duration: 1.1,
          ease: 'power3.inOut',
        },
        3.1
      );

      // Ball parabolic trajectory out of the drum onto the floor
      tl.to(
        anim.current,
        {
          ballZ: 1.35,
          ballX: 0.04,
          duration: 1.1,
          ease: 'power2.out',
        },
        3.1
      );

      tl.to(
        anim.current,
        {
          ballY: -1.02, // Impact height on floor
          duration: 1.1,
          ease: 'power2.in',
        },
        3.1
      );

      // ================= PHASE 4: FLOOR IMPACT & SPHERE FRACTURE (4.2s) =================
      tl.call(
        () => {
          onPhaseChange?.('breaking');
          playCapsuleEjectSound();
          playWinSound(isJackpot);

          // Camera shake on physical impact
          gsap.fromTo(
            anim.current,
            { shakeIntensity: 0.085 },
            {
              shakeIntensity: 0,
              duration: 0.45,
              ease: 'power3.out',
            }
          );

          setBreakTrigger(true);
        },
        undefined,
        4.2
      );

      // ================= PHASE 5: 3D PRIZE REVELATION & WATER MIST DRYING (4.3s - 5.8s) =================
      tl.call(
        () => {
          onPhaseChange?.('revealed');
          confetti({
            particleCount: isJackpot ? 180 : 110,
            spread: 80,
            origin: { y: 0.55 },
            colors: ['#FDC32B', '#FFD95E', '#FFFFFF', '#00A3E0', '#FF3B30'],
          });
        },
        undefined,
        4.35
      );

      // 3D text revelation with upward ascent & organic water puddle shrinkage
      tl.to(
        anim.current,
        {
          revealProgress: 1.0,
          dryProgress: 1.0,
          camZ: 2.85,
          camY: -0.4,
          lookY: -0.65,
          duration: 1.5,
          ease: 'expo.out',
        },
        4.35
      );
    }
  }, [machinePhase, isJackpot, onPhaseChange, onSpinFinished]);

  // Frame Loop: Native camera update with camera shake & synchronized ref updates
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);

    // Continuous drum rotation
    anim.current.drumRotation += anim.current.drumSpeed * dt;

    // Propagate continuous float state to refs without triggering React re-renders
    doorAngleRef.current = anim.current.doorAngle;
    ballPosRef.current = [anim.current.ballX, anim.current.ballY, anim.current.ballZ];
    wetnessRef.current = anim.current.wetness;
    dryProgressRef.current = anim.current.dryProgress;
    revealProgressRef.current = anim.current.revealProgress;

    // Camera shake calculation
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
      {/* ================= STUDIO LIGHTING (MANDATORY DIRECTIVES) ================= */}
      <Environment preset="studio" />

      {/* Warm Ambient Fill */}
      <ambientLight color="#FFFFFF" intensity={0.75} />

      {/* Key Light (Lateral Soft Product Spotlight) */}
      <directionalLight
        position={[4.5, 6, 4.5]}
        color="#FFFBF2"
        intensity={2.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />

      {/* Cold Rim Light behind appliance (Silhouette Hairlight) */}
      <directionalLight
        position={[-3.5, 4.5, -4.5]}
        color="#90CCFF"
        intensity={3.2}
      />

      {/* Ground Soft Fill Light */}
      <directionalLight position={[0, -2, 3]} color="#FFE6A8" intensity={0.5} />

      {/* ================= MODULAR ATOMIC 3D COMPONENTS ================= */}
      {/* 1. Washing Machine Cabinet, Panel & Rotating Drum */}
      <WashingMachine
        drumRotation={anim.current.drumRotation}
        readoutText={readoutText}
        isReady={isReady}
        onScreenClick={onScreenClick}
        drumLightIntensity={anim.current.drumLight}
      />

      {/* 2. Door Rig with Transmission Glass & Smooth Hinge Pivot */}
      <DoorRig doorAngleRef={doorAngleRef} />

      {/* 3. Wet/Dry Reflective Floor with Water Physics */}
      <WaterPhysicsFloor
        wetness={anim.current.wetness}
        wetnessRef={wetnessRef}
        splashActive={splashActive}
        dryProgress={anim.current.dryProgress}
        dryProgressRef={dryProgressRef}
      />

      {/* 4. Prize Sphere, Voronoi Fracture & 3D Typography */}
      <PrizeReveal
        prizeText={prizeText}
        isJackpot={isJackpot}
        ballPos={[anim.current.ballX, anim.current.ballY, anim.current.ballZ]}
        ballPosRef={ballPosRef}
        breakTrigger={breakTrigger}
        revealProgress={anim.current.revealProgress}
        revealProgressRef={revealProgressRef}
      />
    </>
  );
};

export const WhirlpoolCinematicStage: React.FC<WhirlpoolCinematicStageProps> = ({
  machinePhase,
  prizeText = 'Bs. 3.000',
  isJackpot = false,
  onPhaseChange,
  onSpinFinished,
  onScreenClick,
  readoutText = 'Listo para girar',
  isReady = true,
}) => {
  return (
    <div className="relative w-full h-full overflow-visible select-none">
      <Canvas
        camera={{
          position: [0, 0.1, 4.6],
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
            onPhaseChange={onPhaseChange}
            onSpinFinished={onSpinFinished}
            onScreenClick={onScreenClick}
            readoutText={readoutText}
            isReady={isReady}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
