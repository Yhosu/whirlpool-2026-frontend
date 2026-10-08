import React from 'react';
import { MachineState } from '../../types';
import { OrbitalComet3D } from './OrbitalComet3D';
import { WhirlpoolHeroWasher } from './WhirlpoolHeroWasher';

// Appliance assets
import heladeraImg from '../../assets/Heladera.png';
import microondasImg from '../../assets/Microondas.png';
import botonValeImg from '../../assets/Botón vale de consumo.png';
import tecnoDisfrutaImg from '../../assets/¡Tecnología que se disfruta!.png';
import podioImg from '../../assets/Podio.png';

// Prize coin assets
import coin3000 from '../../assets/3000 Bs. 2.png';
import coin2000 from '../../assets/2000Bs.png';
import coin1000 from '../../assets/1000Bs.png';
import coin250 from '../../assets/250Bs.png';

interface MachineProps {
  state: MachineState;
  readoutText: string;
  led1: boolean;
  led2: boolean;
  led3: boolean;
}

export const Machine: React.FC<MachineProps> = ({
  state,
}) => {
  const isSpinning = state === 'washing';
  const isDoorOpen = state === 'opening' || state === 'awarding';
  const isCapOut = state === 'awarding';

  return (
    <div className="relative w-full max-w-[960px] mx-auto select-none mt-2 mb-2 overflow-visible">
      {/* 3D Appliance Stage with Responsive Aspect Ratio */}
      <div className="relative w-full aspect-[960/540] mx-auto overflow-visible">
        {/* ================= 3D PODIUM BASE ================= */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[3%] w-[96%] aspect-[1892/207] z-0 pointer-events-none">
          {/* Ground drop shadow beneath podium */}
          <div className="absolute inset-x-8 -bottom-3 h-8 bg-black/60 blur-xl rounded-[50%]" />
          <img
            src={podioImg}
            alt="Podio Oficial"
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>

        {/* ================= HELADERA (LEFT) ================= */}
        {/* Standing squarely on top of Podio.png (bottom: 19.5%) with showroom specular luster */}
        <div className="absolute left-[15%] bottom-[19.5%] w-[24%] aspect-[555/1217] z-10 group">
          {/* Base contact shadow on top platform */}
          <div className="absolute -bottom-1.5 inset-x-2 h-3 bg-black/65 blur-sm rounded-full pointer-events-none" />
          <img
            src={heladeraImg}
            alt="Heladera Whirlpool"
            className="w-full h-full object-contain drop-shadow-[0_18px_32px_rgba(0,0,0,0.4)] brightness-[1.06] contrast-[1.04]"
          />
        </div>

        {/* ================= LAVADORA FRONTAL (CENTER STAR) ================= */}
        <div className="absolute left-[36%] bottom-[19.5%] w-[29%] aspect-[563/794] z-20">
          <WhirlpoolHeroWasher
            isSpinning={isSpinning}
            isDoorOpen={isDoorOpen}
            isCapOut={isCapOut}
            drumState={state}
            winningCoinImg={coin3000}
            showTopCoin={true}
          />
        </div>

        {/* ================= MICROONDAS (RIGHT) ================= */}
        {/* Standing squarely on top of Podio.png (bottom: 19.5%) with showroom luster */}
        <div className="absolute left-[61%] bottom-[19.5%] w-[26%] aspect-[497/262] z-10 group">
          {/* Base contact shadow on top platform */}
          <div className="absolute -bottom-1 inset-x-2 h-3 bg-black/60 blur-sm rounded-full pointer-events-none" />
          <img
            src={microondasImg}
            alt="Microondas Whirlpool"
            className="w-full h-full object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.4)] brightness-[1.06] contrast-[1.03]"
          />
        </div>

        {/* ================= FLOATING PRIZE COINS (ALWAYS IN FRONT, z-30) ================= */}
        {/* 1. Coin Bs. 250 (Left of fridge) */}
        <img
          src={coin250}
          alt="Bs. 250"
          className="absolute left-[8%] bottom-[48%] w-[8%] aspect-square object-contain drop-shadow-lg z-30 pointer-events-none"
        />

        {/* 2. Coin Bs. 1.000 (Bottom-left foot of washer, in front of washer!) */}
        <img
          src={coin1000}
          alt="Bs. 1.000"
          className="absolute left-[33%] bottom-[18%] w-[8.2%] aspect-square object-contain drop-shadow-xl z-30 pointer-events-none"
        />

        {/* 3. Coin Bs. 2.000 (Right of microwave, in front!) */}
        <img
          src={coin2000}
          alt="Bs. 2.000"
          className="absolute right-[8%] bottom-[32%] w-[8%] aspect-square object-contain drop-shadow-lg z-30 pointer-events-none"
        />

        {/* ================= FLOATING BADGE (BOTÓN VALE DE CONSUMO) ================= */}
        {/* Positioned cleanly to the top-right so it does NOT overlap the slogan or washer */}
        <div className="absolute right-[2%] top-[0%] w-[22%] aspect-[571/527] z-30 select-none">
          <img
            src={botonValeImg}
            alt="Gana hasta Bs. 3.000 en vales de consumo al instante"
            className="w-full h-full object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.4)] animate-badge-lively pointer-events-auto cursor-pointer"
          />
        </div>

        {/* ================= SLOGAN: ¡TECNOLOGÍA QUE SE DISFRUTA! ================= */}
        {/* Positioned cleanly to the right of the washer and above the microwave without overlap */}
        <div className="absolute left-[65.5%] top-[41%] w-[17.5%] aspect-[372/98] z-25 select-none pointer-events-none">
          <img
            src={tecnoDisfrutaImg}
            alt="¡Tecnología que se disfruta!"
            className="w-full h-full object-contain drop-shadow-md"
          />
        </div>

        {/* ================= 3D ORBITAL COMET & SHOOTING STAR ================= */}
        {/* Multi-directional, non-repeating 3D shooting star orbiting around the appliances */}
        <OrbitalComet3D />
      </div>
    </div>
  );
};
