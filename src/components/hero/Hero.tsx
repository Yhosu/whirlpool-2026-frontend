import React from 'react';
import { Machine } from '../machine/Machine';
import { StageSpotlights } from '../machine/StageSpotlights';
import { MachineState } from '../../types';

// Assets for Hero
import tituloImg from '../../assets/titulo.png';
import texturaFondoImg from '../../assets/textura-fondo.png';
import iconCompras from '../../assets/Objeto inteligente vectorial copia 6.png';
import iconParticipas from '../../assets/Objeto inteligente vectorial 2.png';
import iconGanas from '../../assets/Objeto inteligente vectorial 3.png';

interface HeroProps {
  machineState: MachineState;
  readoutText: string;
  led1: boolean;
  led2: boolean;
  led3: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  machineState,
  readoutText,
  led1,
  led2,
  led3,
}) => {
  // 26 radial sunburst rays
  const rays = Array.from({ length: 26 });

  return (
    <header className="relative overflow-hidden text-center hero-radial-bg pt-4 pb-10">
      {/* Background Radial Sunburst Rays */}
      <div className="absolute inset-0 pointer-events-none opacity-35 z-0">
        {rays.map((_, i) => (
          <span
            key={i}
            className="absolute left-1/2 top-[10%] w-[3px] h-[170vh] origin-top"
            style={{
              background: 'linear-gradient(rgba(255,255,255,0.75), rgba(255,255,255,0) 55%)',
              transform: `rotate(${i * (360 / 26)}deg)`,
            }}
          />
        ))}
      </div>

      {/* Background Wallpaper Texture with transparent appliance icons from textura-fondo.png */}
      <div
        className="absolute inset-0 pointer-events-none opacity-45 z-0 bg-[length:550px] sm:bg-[length:700px] bg-repeat select-none"
        style={{ backgroundImage: `url(${texturaFondoImg})` }}
      />

      {/* Overhead Showroom Stage Spotlights anchored at Top: 0 of Page / Header */}
      <StageSpotlights />

      <div className="relative z-10 w-full max-w-[1140px] mx-auto px-3 sm:px-5">
        {/* Main High-Definition Title Graphic (Whirlpool + Marca Americana + SPECIAL days + coins) */}
        <div className="flex justify-center w-full px-2 mb-2">
          <img
            src={tituloImg}
            alt="Whirlpool Special Days - Marca Americana"
            className="w-[clamp(320px,74vw,700px)] h-auto object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.25)] select-none"
          />
        </div>

        {/* The Appliances Stage & Washing Machine on Podio.png (with comfortable breathing room) */}
        <div id="machine-wrapper" className="mt-2 sm:mt-4 md:mt-5">
          <Machine
            state={machineState}
            readoutText={readoutText}
            led1={led1}
            led2={led2}
            led3={led3}
          />
        </div>

        {/* Flow Pills: COMPRAS > PARTICIPAS > GANAS (Enlarged & High-Impact Responsive Styling) */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-3 md:gap-4 flex-wrap mt-6 sm:mt-7 select-none px-2">
          {/* 1. COMPRAS */}
          <div className="flex items-center gap-2 sm:gap-3 bg-[#FFD95E] hover:bg-[#FDC32B] border-[2px] sm:border-[2.5px] border-[#101010] rounded-xl sm:rounded-2xl py-2 sm:py-2.5 md:py-3 px-3 sm:px-5 md:px-6 shadow-[0_4px_14px_rgba(0,0,0,0.14)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-all cursor-pointer">
            <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-[#101010] flex items-center justify-center p-1 sm:p-1.5 shadow-inner flex-none">
              <img src={iconCompras} alt="" className="w-full h-full object-contain" />
            </div>
            <span className="font-display text-[#101010] text-xs sm:text-base md:text-xl font-black tracking-wider">
              COMPRAS
            </span>
          </div>

          <span className="font-display text-lg sm:text-2xl md:text-4xl text-[#101010] font-black opacity-80 px-0.5">
            ›
          </span>

          {/* 2. PARTICIPAS */}
          <div className="flex items-center gap-2 sm:gap-3 bg-[#FFD95E] hover:bg-[#FDC32B] border-[2px] sm:border-[2.5px] border-[#101010] rounded-xl sm:rounded-2xl py-2 sm:py-2.5 md:py-3 px-3 sm:px-5 md:px-6 shadow-[0_4px_14px_rgba(0,0,0,0.14)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-all cursor-pointer">
            <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-[#101010] flex items-center justify-center p-1 sm:p-1.5 shadow-inner flex-none">
              <img src={iconParticipas} alt="" className="w-full h-full object-contain" />
            </div>
            <span className="font-display text-[#101010] text-xs sm:text-base md:text-xl font-black tracking-wider">
              PARTICIPAS
            </span>
          </div>

          <span className="font-display text-lg sm:text-2xl md:text-4xl text-[#101010] font-black opacity-80 px-0.5">
            ›
          </span>

          {/* 3. GANAS */}
          <div className="flex items-center gap-2 sm:gap-3 bg-[#FFD95E] hover:bg-[#FDC32B] border-[2px] sm:border-[2.5px] border-[#101010] rounded-xl sm:rounded-2xl py-2 sm:py-2.5 md:py-3 px-3 sm:px-5 md:px-6 shadow-[0_4px_14px_rgba(0,0,0,0.14)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-all cursor-pointer">
            <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-[#101010] flex items-center justify-center p-1 sm:p-1.5 shadow-inner flex-none">
              <img src={iconGanas} alt="" className="w-full h-full object-contain" />
            </div>
            <span className="font-display text-[#101010] text-xs sm:text-base md:text-xl font-black tracking-wider">
              GANAS
            </span>
          </div>
        </div>

        {/* Promotion Dates */}
        <p className="mt-4 font-extrabold text-[clamp(13px,3.2vw,16px)] text-[#101010]">
          Del 9 de Octubre al 8 de Noviembre de 2026.
        </p>
      </div>
    </header>
  );
};
