import React from 'react';
import { WasherDrumCanvas } from './3d/WasherDrumCanvas';
import { MachineState } from '../../types';

// Appliance assets
import lavadoraImg from '../../assets/Lavadora Frontal.png';
import coin500 from '../../assets/500Bs.png';
import coin3000 from '../../assets/3000 Bs. 2.png';

interface WhirlpoolHeroWasherProps {
  isSpinning?: boolean;
  isDoorOpen?: boolean;
  isCapOut?: boolean;
  drumState?: MachineState;
  winningCoinImg?: string;
  showTopCoin?: boolean;
  className?: string;
}

export const WhirlpoolHeroWasher: React.FC<WhirlpoolHeroWasherProps> = ({
  isSpinning = false,
  isDoorOpen = false,
  isCapOut = false,
  drumState = 'idle',
  winningCoinImg = coin3000,
  showTopCoin = false,
  className = '',
}) => {
  return (
    <div className={`relative w-full aspect-[563/794] select-none ${className}`}>
      {/* Base contact shadow beneath washer */}
      <div className="absolute -bottom-1.5 inset-x-3 h-3.5 bg-black/75 blur-sm rounded-full pointer-events-none" />

      {/* ================= PREMIO 500 BS. APOYADO SOBRE LA LAVADORA (SOLO SI showTopCoin ES TRUE) ================= */}
      {showTopCoin && (
        <div className="absolute left-[34%] -top-[18.5%] w-[31%] aspect-square z-30 pointer-events-none group">
          {/* Sombra de contacto sobre la superficie superior */}
          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-[76%] h-[22%] bg-black/80 blur-[2.5px] rounded-[50%]" />
          <img
            src={coin500}
            alt="Bs. 500"
            className="w-full h-full object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.4)] relative z-10 transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      {/* Realistic Machine Body from Lavadora Frontal.png with subtle vibration during spin */}
      <img
        src={lavadoraImg}
        alt="Lavadora Frontal Whirlpool"
        className={`w-full h-full object-contain drop-shadow-[0_22px_38px_rgba(0,0,0,0.5)] brightness-[1.06] contrast-[1.03] relative z-10 transition-transform ${
          isSpinning ? 'animate-[pulse_0.12s_ease-in-out_infinite]' : ''
        }`}
      />

      {/* ================= 3D REALISTIC DRUM WITH WATER SHADERS & PRIZE BALLS ================= */}
      {/* Real 3D experience inside the drum with fluid dynamics, zero CPU lag on the rest of the machine */}
      <div className="absolute left-[19.2%] top-[26.8%] w-[61.6%] aspect-square rounded-full z-[14] overflow-hidden shadow-[inset_0_4px_22px_rgba(0,0,0,0.9)] bg-[#07090c]">
        <WasherDrumCanvas
          machineState={drumState}
          className="w-full h-full"
        />
      </div>

      {/* ================= GLOWING ILLUMINATED RIM BORDER AROUND WASHER DRUM ================= */}
      <div
        className="absolute left-[18.8%] top-[26.4%] w-[62.4%] aspect-square rounded-full z-[15] pointer-events-none transition-all duration-300"
        style={{
          border: '2.5px solid rgba(255, 230, 130, 0.95)',
          boxShadow: isSpinning
            ? '0 0 18px #FDC32B, 0 0 35px #FFE27A, 0 0 50px rgba(253, 195, 43, 0.7), inset 0 0 14px rgba(255,255,255,0.8)'
            : '0 0 12px rgba(253, 195, 43, 0.85), 0 0 22px rgba(255, 226, 122, 0.55), inset 0 0 10px rgba(255, 255, 255, 0.6), inset 0 0 16px rgba(253, 195, 43, 0.3)',
          animation: isSpinning
            ? 'drumRimSpinPulse 0.5s ease-in-out infinite alternate'
            : 'drumRimGlow 3.5s ease-in-out infinite alternate',
        }}
      />

      {/* Secondary Concentric Chrome Bezel Accent Ring */}
      <div className="absolute left-[19.2%] top-[26.8%] w-[61.6%] aspect-square rounded-full z-[15] pointer-events-none ring-1 ring-white/50 shadow-[inset_0_0_12px_rgba(255,217,94,0.3)]" />

      {/* ================= 3D HINGED GLASS DOOR (SMOKED DARK TRANSPARENT GLASS) ================= */}
      {/* Como en negro pero transparente: agua y pelotas de premios 100% visibles */}
      <div
        className="absolute left-[16.5%] top-[24.1%] w-[67%] aspect-square z-[16] pointer-events-none"
        style={{
          transformOrigin: '0% 50%',
          transform: isDoorOpen ? 'perspective(1100px) rotateY(-112deg) translateZ(12px)' : 'none',
          transition: 'transform 0.85s cubic-bezier(0.34, 1.25, 0.64, 1)',
        }}
      >
        {/* Outer dark chrome door frame bezel with handle and hinge */}
        <div className="relative w-full h-full rounded-full border-[7px] border-[#22262d] shadow-[0_12px_32px_rgba(0,0,0,0.65),inset_0_2px_4px_rgba(255,255,255,0.2)] flex items-center justify-center overflow-hidden">
          {/* Inner chrome accent line */}
          <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none" />

          {/* Smoked Dark Transparent Glass Window (Como en negro pero transparente) */}
          <div className="w-full h-full rounded-full bg-[radial-gradient(circle_at_45%_40%,rgba(15,20,28,0.08)_0%,rgba(10,14,20,0.22)_65%,rgba(0,0,0,0.50)_100%)] relative overflow-hidden backdrop-brightness-[0.94]">
            {/* Curved optical glass specular reflection arc */}
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.20)_0%,rgba(255,255,255,0.03)_32%,transparent_55%)] pointer-events-none" />
            
            {/* Secondary bottom specular reflection crescent */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-white/5 blur-sm pointer-events-none" />
          </div>

          {/* Right edge door handle latch detail */}
          <div className="absolute right-1 top-1/2 -translate-y-1/2 w-2 h-7 bg-[#475569] rounded-l-md shadow-md border-l border-white/30" />
        </div>
      </div>

      {/* ================= REALISTIC WATER SPILL & CASCADE (POURING OUT OF THE DRUM) ================= */}
      <div
        className={`absolute left-[33%] top-[72%] w-[34%] h-[24%] z-[18] pointer-events-none transition-all duration-700 ${
          isDoorOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-75'
        }`}
      >
        {/* Waterfall flow stream */}
        <div className="relative w-full h-full flex flex-col items-center">
          {/* Glistening water sheet spilling over the lower chrome rim */}
          <div className="w-[82%] h-[65%] rounded-b-2xl bg-gradient-to-b from-[#38bdf8]/75 via-[#0284c7]/65 to-transparent blur-[0.5px] shadow-[0_8px_16px_rgba(56,189,248,0.5)] relative overflow-hidden">
            {/* Animated water specular ripple highlights */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#ffffff_0%,transparent_70%)] opacity-80 animate-pulse" />
          </div>

          {/* Water splash droplets and mist at impact bottom */}
          <div className="w-[110%] h-[35%] -mt-1 flex items-center justify-center relative">
            <div className="absolute w-[90%] h-3 bg-[#38bdf8]/50 blur-sm rounded-full" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/90 shadow-[0_0_8px_#38bdf8] animate-ping" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/80 shadow-[0_0_6px_#38bdf8] mx-3 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-white/90 shadow-[0_0_8px_#38bdf8] animate-ping" />
          </div>
        </div>
      </div>

      {/* ================= PRIZE EJECTION AURA & CAPSULE ================= */}
      <div className="absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2 z-[25] pointer-events-none">
        <div
          className="w-[140px] sm:w-[170px] aspect-square transition-all duration-700 ease-out flex items-center justify-center"
          style={{
            opacity: isCapOut ? 1 : 0,
            transform: isCapOut ? 'scale(1.4) translateY(12%)' : 'scale(0.2) translateY(-60%)',
            filter: 'drop-shadow(0 0 35px #FDC32B) drop-shadow(0 0 15px #FFD95E)',
          }}
        >
          <img
            src={winningCoinImg}
            alt="Premio Ganador"
            className="w-full h-full object-contain animate-bounce-subtle"
          />
        </div>
      </div>
    </div>
  );
};
