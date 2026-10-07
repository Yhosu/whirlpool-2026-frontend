import React, { Suspense, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { DrumScene } from './DrumScene';
import { MachineState } from '../../../types';
import coin3000 from '../../../assets/3000 Bs. 2.png';
import coin1000 from '../../../assets/1000Bs.png';
import coin500 from '../../../assets/500Bs.png';

interface WasherDrumCanvasProps {
  machineState: MachineState;
  className?: string;
  interactive?: boolean;
  onCycleChange?: (info: { name: string; rpm: number; flowType: string; description: string }) => void;
}

// Robust check to test if WebGL context can actually be created (crucial for Facebook in-app browser)
function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

// Lightweight CSS/HTML Fallback for older browsers or in-app webviews without WebGL
const FallbackDrum: React.FC<{ isSpinning: boolean }> = ({ isSpinning }) => (
  <div className="relative w-full h-full overflow-hidden rounded-full bg-gradient-to-b from-[#11161d] to-[#07090c] flex items-center justify-center">
    {/* Rotating drum perforations texture */}
    <div
      className={`absolute inset-0 rounded-full opacity-35 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:12px_12px] ${
        isSpinning ? 'animate-spin' : ''
      }`}
      style={{ animationDuration: isSpinning ? '0.4s' : '18s' }}
    />

    {/* Blue water pool at bottom */}
    <div
      className={`absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-[#0284c7]/70 via-[#38bdf8]/40 to-transparent blur-[0.5px] rounded-b-full transition-all duration-700 ${
        isSpinning ? 'scale-y-110 opacity-90' : 'opacity-70'
      }`}
    />

    {/* Floating prize coins */}
    <div className={`relative z-10 w-[78%] h-[78%] flex items-center justify-center ${isSpinning ? 'animate-spin' : ''}`}>
      <img
        src={coin3000}
        alt="Premio"
        className="w-[45%] aspect-square object-contain absolute left-[12%] bottom-[18%] drop-shadow-lg"
      />
      <img
        src={coin1000}
        alt="Premio"
        className="w-[40%] aspect-square object-contain absolute right-[15%] bottom-[14%] drop-shadow-lg"
      />
      <img
        src={coin500}
        alt="Premio"
        className="w-[36%] aspect-square object-contain absolute left-[32%] bottom-[38%] drop-shadow-md"
      />
    </div>
  </div>
);

export const WasherDrumCanvas: React.FC<WasherDrumCanvasProps> = ({
  machineState,
  className = '',
  interactive = true,
  onCycleChange,
}) => {
  const [clickCount, setClickCount] = useState<number>(0);
  const [webGlFailed, setWebGlFailed] = useState<boolean>(false);

  const hasWebGL = useMemo(() => {
    return checkWebGLSupport();
  }, []);

  const isSpinning = machineState === 'washing';

  // If WebGL is not available on this device or failed, use zero-CPU fallback
  if (!hasWebGL || webGlFailed) {
    return (
      <div className={`relative w-full h-full overflow-hidden select-none rounded-full ${className}`}>
        <FallbackDrum isSpinning={isSpinning} />
      </div>
    );
  }

  const handleInteraction = () => {
    if (!interactive) return;
    setClickCount((prev) => prev + 1);
  };

  return (
    <div
      onClick={handleInteraction}
      className={`relative w-full h-full overflow-hidden cursor-pointer select-none rounded-full ${className}`}
      title="Haz clic para agitar el agua y las esferas"
    >
      <Canvas
        camera={{
          position: [0, 0, 4.35],
          fov: 46,
          near: 0.1,
          far: 15,
        }}
        gl={{
          antialias: false, // Disabling antialiasing on circular masked drum saves massive GPU fillrate
          alpha: true,
          powerPreference: 'low-power', // Low-power mode prevents CPU/GPU fans from spinning up
          stencil: false,
          depth: true,
          precision: 'mediump', // Smooth and ultra-fast on mobile devices and in-app webviews
        }}
        dpr={1} // Lock pixel ratio to 1 to prevent burning GPU on Retina/4K displays
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', () => {
            setWebGlFailed(true);
          });
        }}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <DrumScene
            machineState={machineState}
            clickTrigger={clickCount}
            interactive={interactive}
            onCycleChange={onCycleChange}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
