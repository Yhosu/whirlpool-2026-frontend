import React, { useEffect } from 'react';
import { WasherDrumCanvas } from './3d/WasherDrumCanvas';
import { MachineState } from '../../types';
import { playWaterSplashSound } from '../../utils/sound';

// Appliance assets
import lavadoraImg from '../../assets/Lavadora Frontal.png';
import tapaLavadoraImg from '../../assets/Tapa de lavadora 1.png';
import coin500 from '../../assets/500Bs.png';
import { CrispPrizeBall } from './CrispPrizeBall';
import { RealisticWaterTorrentCanvas } from './3d/RealisticWaterTorrentCanvas';

interface WhirlpoolHeroWasherProps {
  isSpinning?: boolean;
  isDoorOpen?: boolean;
  isCapOut?: boolean;
  drumState?: MachineState;
  winningCoinImg?: string;
  prizeAmount?: string | number;
  waterDrainPhase?: 'none' | 'flushing' | 'draining' | 'drained';
  showTopCoin?: boolean;
  onControlScreenClick?: () => void;
  hasActiveCode?: boolean;
  isIdle?: boolean;
  className?: string;
}

export const WhirlpoolHeroWasher: React.FC<WhirlpoolHeroWasherProps> = ({
  isSpinning = false,
  isDoorOpen = false,
  isCapOut = false,
  drumState = 'idle',
  winningCoinImg,
  prizeAmount,
  waterDrainPhase: propDrainPhase,
  showTopCoin = false,
  onControlScreenClick,
  hasActiveCode = false,
  isIdle = true,
  className = '',
}) => {
  // Water drainage sequence: 'none' -> 'flushing' -> 'draining' -> 'drained'
  const [internalDrainPhase, setInternalDrainPhase] = React.useState<'none' | 'flushing' | 'draining' | 'drained'>('none');
  const activeDrainPhase = propDrainPhase !== undefined ? propDrainPhase : internalDrainPhase;

  useEffect(() => {
    if (isDoorOpen) {
      setInternalDrainPhase('flushing');
      const soundTimer = setTimeout(() => {
        playWaterSplashSound();
      }, 200);

      // A los 1700ms: el torrente cesa al terminar la apertura suave
      const drainTimer = setTimeout(() => {
        setInternalDrainPhase('draining');
      }, 1700);

      // A los 3000ms: el agua se disolvió completamente por el desagüe
      const finishedTimer = setTimeout(() => {
        setInternalDrainPhase('drained');
      }, 3000);

      return () => {
        clearTimeout(soundTimer);
        clearTimeout(drainTimer);
        clearTimeout(finishedTimer);
      };
    } else {
      setInternalDrainPhase('none');
    }
  }, [isDoorOpen]);

  return (
    <div className={`relative w-full aspect-[563/794] select-none ${className}`}>
      {/* Base contact shadow beneath washer on top of podium */}
      <div className="absolute -bottom-2 inset-x-2 h-4 bg-black/80 blur-md rounded-full pointer-events-none" />

      {/* ================= PREMIO 500 BS. APOYADO SOBRE LA LAVADORA (SOLO EN HOME '/') ================= */}
      {showTopCoin && (
        <div className="absolute left-[34%] -top-[18.5%] w-[31%] aspect-square z-30 pointer-events-none group">
          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-[76%] h-[22%] bg-black/80 blur-[2.5px] rounded-[50%]" />
          <img
            src={coin500}
            alt="Bs. 500"
            className="w-full h-full object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.4)] relative z-10 transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      {/* ================= 1. CUERPO REAL DE LA LAVADORA (LAVADORA FRONTAL.PNG - SIN CAMBIAR) ================= */}
      {/* Clean, authentic Whirlpool front chassis: NO weird glow, NO pulsing border */}
      <img
        src={lavadoraImg}
        alt="Lavadora Frontal Whirlpool"
        className={`w-full h-full object-contain drop-shadow-[0_22px_38px_rgba(0,0,0,0.5)] brightness-[1.02] contrast-[1.02] relative z-10 transition-transform ${
          isSpinning ? 'translate-y-[0.4px]' : ''
        }`}
      />

      {/* ================= 2. TAMBOR 3D REAL (CIRCULO DE LA PUERTA / TAMBOR) ================= */}
      {/* Dynamic 3D fluid water & prize spheres swirling inside the porthole aperture */}
      <div
        className="absolute left-[19.2%] top-[26.8%] w-[61.6%] aspect-square rounded-full z-[14] overflow-hidden shadow-[inset_0_4px_24px_rgba(0,0,0,0.95)] bg-[#07090c] washer-drum-circle"
        style={{
          borderRadius: '50%',
          clipPath: 'circle(50% at 50% 50%)',
          WebkitClipPath: 'circle(50% at 50% 50%)',
          maskImage: 'radial-gradient(circle, #000000 99.5%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(circle, #000000 99.5%, transparent 100%)',
        }}
      >
        <WasherDrumCanvas
          machineState={drumState}
          className="w-full h-full"
        />
      </div>

      {/* Bisel perimetral sobrio de cromo oscuro grafito (fiel a la lavadora real) */}
      <div
        className="absolute left-[19.2%] top-[26.8%] w-[61.6%] aspect-square rounded-full z-[15] pointer-events-none ring-1 ring-white/20 shadow-[inset_0_2px_8px_rgba(0,0,0,0.7)]"
        style={{
          borderRadius: '50%',
          clipPath: 'circle(50% at 50% 50%)',
          WebkitClipPath: 'circle(50% at 50% 50%)',
        }}
      />

      {/* ================= 0. PANTALLA DIGITAL DE CONTROL (TOUCHSCREEN HOTSPOT) ================= */}
      {/* Ubicada con cálculo milimétrico sobre el rectángulo completo de la pantalla (62.5% X, 2.9% Y, 28.8% W, 11.2% H) */}
      <div
        className="absolute z-[26]"
        style={{
          left: '62.5%',
          top: '2.9%',
          width: '28.8%',
          height: '11.2%',
        }}
      >
        <button
          type="button"
          onClick={onControlScreenClick}
          aria-label="Pantalla de control digital Whirlpool: Clic para introducir código"
          className="w-full h-full relative rounded-[6px] cursor-pointer group focus:outline-none transition-transform active:scale-[0.98]"
        >
          {/* Borde ultra-brillante con resplandor neón cyan + oro reflectante (animate-screen-glow) */}
          <div className="absolute -inset-[3px] rounded-[8px] border-[2.5px] border-white animate-screen-glow pointer-events-none transition-all group-hover:border-[#FDC32B] group-hover:shadow-[0_0_30px_rgba(253,195,43,1),0_0_65px_rgba(0,229,255,0.95),inset_0_0_20px_rgba(255,255,255,1)]" />

          {/* Destello de cristal iluminado con gradiente translúcido */}
          <div className="absolute inset-0 rounded-[5px] bg-gradient-to-tr from-cyan-400/25 via-white/15 to-amber-300/20 backdrop-brightness-125 transition-opacity group-hover:opacity-100 pointer-events-none" />

          {/* Línea de escaneo / brillo tenue diagonal constante */}
          <div className="absolute inset-0 rounded-[5px] overflow-hidden pointer-events-none">
            <div className="w-[200%] h-full bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full animate-btn-shimmer" />
          </div>
        </button>

        {/* Flecha animada llamativa señalando la pantalla: "Click aquí para introducir el código" */}
        {!hasActiveCode && isIdle && (
          <div
            onClick={onControlScreenClick}
            className="absolute -top-10 sm:-top-12 right-0 sm:right-1 z-30 cursor-pointer flex flex-col items-center animate-bounce-subtle pointer-events-auto"
          >
            <div className="bg-[#101010] text-[#FDC32B] border-2 border-[#FDC32B] text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl shadow-[0_6px_22px_rgba(0,0,0,0.7)] whitespace-nowrap flex items-center gap-1.5 hover:scale-105 transition-transform">
              <span className="w-2 h-2 rounded-full bg-[#FDC32B] animate-ping" />
              <span className="hidden sm:inline">Click aquí para introducir el código</span>
              <span className="inline sm:hidden">Toca para ingresar código</span>
            </div>
            {/* Punta de flecha hacia abajo */}
            <div className="w-0 h-0 border-x-[6px] border-x-transparent border-t-[8px] border-t-[#FDC32B] -mt-[1px]" />
          </div>
        )}
      </div>

      {/* ================= 3. TAPA DE LA LAVADORA EN 3D (TAPA DE LAVADORA 1.PNG) ================= */}
      {/* Tapa transparente con refracción y bisagra a la izquierda que se abre en perspectiva 3D */}
      <div
        className="absolute left-[16.5%] top-[24.1%] w-[67%] aspect-square z-[24] pointer-events-none"
        style={{
          transformOrigin: '0% 50%',
          WebkitTransformOrigin: '0% 50%',
          transform: isDoorOpen ? 'perspective(1100px) rotateY(-78deg) translateZ(14px)' : 'none',
          WebkitTransform: isDoorOpen ? 'perspective(1100px) rotateY(-78deg) translateZ(14px)' : 'none',
          transition: 'transform 1.65s cubic-bezier(0.25, 0.95, 0.4, 1)',
          WebkitTransition: '-webkit-transform 1.65s cubic-bezier(0.25, 0.95, 0.4, 1)',
          backfaceVisibility: 'visible',
          WebkitBackfaceVisibility: 'visible',
        }}
      >
        {/* Resplandor luminoso activo ÚNICAMENTE en la tapa durante el centrifugado */}
        {isSpinning && (
          <div
            className="absolute -inset-2.5 rounded-full pointer-events-none animate-door-glow -z-10"
            style={{ borderRadius: '50%' }}
          />
        )}

        {/* Marco exterior de la compuerta con tirador ergonómico */}
        <div
          className={`relative w-full h-full rounded-full border-[7px] flex items-center justify-center overflow-hidden transition-all duration-500 ${
            isSpinning
              ? 'border-[#FFD95E] shadow-[0_0_32px_rgba(253,195,43,0.95),0_0_55px_rgba(0,229,255,0.65),inset_0_0_20px_rgba(255,255,255,0.85)]'
              : isDoorOpen
                ? 'border-[#374151] shadow-[-18px_10px_35px_rgba(0,0,0,0.85),inset_0_2px_4px_rgba(255,255,255,0.4)]'
                : 'border-[#22262d] shadow-[0_12px_32px_rgba(0,0,0,0.65),inset_0_2px_4px_rgba(255,255,255,0.2)]'
          }`}
        >
          {/* Anillo de cromo interior con destello giratorio durante el centrifugado */}
          {isSpinning && (
            <div
              className="absolute inset-0 rounded-full pointer-events-none animate-door-shimmer"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent 0%, rgba(253,195,43,0.85) 25%, transparent 50%, rgba(255,255,255,0.95) 75%, transparent 100%)',
                maskImage: 'radial-gradient(circle, transparent 64%, black 66%)',
                WebkitMaskImage: 'radial-gradient(circle, transparent 64%, black 66%)',
              }}
            />
          )}
          <div className="absolute inset-0 rounded-full border border-white/25 pointer-events-none" />

          {/* Vidrio cristalino: alta transparencia cerrado (25%), visible y tangible abierto (85%) */}
          <div className="w-full h-full rounded-full relative overflow-hidden bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.03)_40%,transparent_75%)]">
            <img
              src={tapaLavadoraImg}
              alt="Tapa de lavadora"
              className={`w-full h-full object-contain pointer-events-none drop-shadow transition-opacity duration-700 ${
                isDoorOpen ? 'opacity-85 brightness-110' : 'opacity-25'
              }`}
            />
            {/* Reflejo especular curvo de cristal óptico fino */}
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0.03)_28%,transparent_50%)] pointer-events-none" />
          </div>

          {/* Pestillo / tirador derecho de la puerta */}
          <div className="absolute right-1 top-1/2 -translate-y-1/2 w-2.5 h-8 bg-[#546274] rounded-l-md shadow-md border-l border-white/40" />
        </div>
      </div>

      {/* ================= 4. TORRENTE REALISTA DE AGUA 3D CAYENDO DEL TAMBOR AL PODIO ================= */}
      {/* Simulación en Canvas de fluido parabólico, caústicas vivas y gotas de impacto sobre el podio */}
      <RealisticWaterTorrentCanvas phase={activeDrainPhase} />

      {/* ================= 5. PELOTA DE PREMIO APOYADA DIRECTAMENTE SOBRE EL CHARCO DE AGUA ================= */}
      {/* Al terminar, la pelota se asienta sobre el agua desparramada en primer plano teniéndola como soporte */}
      {isCapOut && (prizeAmount || winningCoinImg) ? (
        <div
          className="absolute left-1/2 top-[96%] sm:top-[97%] -translate-x-1/2 -translate-y-1/2 z-[25] pointer-events-none transition-all duration-700 ease-out opacity-100 scale-100"
        >
          <div className="relative w-[190px] sm:w-[230px] aspect-square flex items-center justify-center animate-water-ball-eject">
            <div className="w-full h-full animate-ball-float">
              <CrispPrizeBall
                amount={prizeAmount || ''}
                fallbackImg={winningCoinImg}
                className="w-full h-full"
                isOnWater={true}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
