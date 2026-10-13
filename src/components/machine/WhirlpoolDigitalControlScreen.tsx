import React, { useState, useRef } from 'react';
import { Play, CheckCircle2, AlertCircle, X } from 'lucide-react';
import whirlpoolLogo from '../../assets/whirlpool-footer-logo.png';

// ================= NATIVE WEB AUDIO BEEP (SHARED SINGLETON, 0 DEPENDENCIES) =================
let sharedAudioCtx: AudioContext | null = null;

const getSharedAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  try {
    if (!sharedAudioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        sharedAudioCtx = new AudioContextClass();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
};

const playApplianceBeep = (type: 'beep' | 'success' | 'error' = 'beep') => {
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'beep') {
      // Classic capacitive touch beep (1850 Hz, 65ms)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1850, now);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.start(now);
      osc.stop(now + 0.07);
    } else if (type === 'success') {
      // Melodic dual-tone cycle confirmation (E6 -> A6)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1318.5, now);
      osc.frequency.setValueAtTime(1760, now + 0.08);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'error') {
      // Low dual warning buzz
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    }
  } catch {
    // Ignore audio permission or browser restriction
  }
};

// ================= 7-SEGMENT LED MAP =================
// Standard segments: a(top), b(top-right), c(bot-right), d(bottom), e(bot-left), f(top-left), g(middle)
const SEGMENT_MAP: Record<string, string[]> = {
  '0': ['a', 'b', 'c', 'd', 'e', 'f'],
  '1': ['b', 'c'],
  '2': ['a', 'b', 'g', 'e', 'd'],
  '3': ['a', 'b', 'g', 'c', 'd'],
  '4': ['f', 'g', 'b', 'c'],
  '5': ['a', 'f', 'g', 'c', 'd'],
  '6': ['a', 'f', 'g', 'e', 'c', 'd'],
  '7': ['a', 'b', 'c'],
  '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  '9': ['a', 'b', 'c', 'd', 'f', 'g'],
  'A': ['a', 'b', 'c', 'e', 'f', 'g'],
  'B': ['c', 'd', 'e', 'f', 'g'],
  'C': ['a', 'd', 'e', 'f'],
  'D': ['b', 'c', 'd', 'e', 'g'],
  'E': ['a', 'd', 'e', 'f', 'g'],
  'F': ['a', 'e', 'f', 'g'],
  'G': ['a', 'c', 'd', 'e', 'f'],
  'H': ['b', 'c', 'e', 'f', 'g'],
  'I': ['b', 'c'],
  'J': ['b', 'c', 'd', 'e'],
  'L': ['d', 'e', 'f'],
  'N': ['c', 'e', 'g'],
  'O': ['a', 'b', 'c', 'd', 'e', 'f'],
  'P': ['a', 'b', 'e', 'f', 'g'],
  'R': ['e', 'g'],
  'S': ['a', 'f', 'g', 'c', 'd'],
  'T': ['d', 'e', 'f', 'g'],
  'U': ['b', 'c', 'd', 'e', 'f'],
  'Y': ['b', 'c', 'd', 'f', 'g'],
  '-': ['g'],
  '_': ['d'],
  '=': ['d', 'g'],
  ' ': [],
};

// ================= INDIVIDUAL 7-SEGMENT SVG DIGIT =================
interface SevenSegmentDigitProps {
  char?: string;
}

const SevenSegmentDigit: React.FC<SevenSegmentDigitProps> = ({ char = '' }) => {
  const upperChar = char.toUpperCase();
  const activeSegments = SEGMENT_MAP[upperChar] || (upperChar ? ['g'] : []);

  // Check which segment is illuminated
  const isA = activeSegments.includes('a');
  const isB = activeSegments.includes('b');
  const isC = activeSegments.includes('c');
  const isD = activeSegments.includes('d');
  const isE = activeSegments.includes('e');
  const isF = activeSegments.includes('f');
  const isG = activeSegments.includes('g');

  // Realistic LED segment styling:
  // Active: Pure brilliant white (#FFFFFF) with multi-layer cyan/ice glow
  // Inactive: Unlit ghost segment (#1A232E at 20% opacity)
  const activeClass = 'led-glow-active transition-all duration-150';
  const inactiveClass = 'fill-[#18202A] opacity-25 transition-all duration-150';

  return (
    <div className="relative inline-flex items-center select-none flex-none">
      <svg
        viewBox="0 0 46 74"
        className="w-[28px] h-[46px] xs:w-[34px] xs:h-[54px] sm:w-[42px] sm:h-[68px]"
        style={{ transform: 'skewX(-5deg)' }}
        aria-hidden="true"
      >
        <defs>
          <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Segment a (top horizontal) */}
        <polygon
          points="8,5 12,2 34,2 38,5 33,8 13,8"
          className={isA ? activeClass : inactiveClass}
        />

        {/* Segment b (top-right vertical) */}
        <polygon
          points="39,7 43,10 43,33 39,36 36,32 36,11"
          className={isB ? activeClass : inactiveClass}
        />

        {/* Segment c (bottom-right vertical) */}
        <polygon
          points="39,38 43,41 43,64 39,67 36,63 36,42"
          className={isC ? activeClass : inactiveClass}
        />

        {/* Segment d (bottom horizontal) */}
        <polygon
          points="8,69 12,66 34,66 38,69 33,72 13,72"
          className={isD ? activeClass : inactiveClass}
        />

        {/* Segment e (bottom-left vertical) */}
        <polygon
          points="7,38 10,42 10,63 7,67 3,64 3,41"
          className={isE ? activeClass : inactiveClass}
        />

        {/* Segment f (top-left vertical) */}
        <polygon
          points="7,7 10,11 10,32 7,36 3,33 3,10"
          className={isF ? activeClass : inactiveClass}
        />

        {/* Segment g (middle horizontal) */}
        <polygon
          points="8,37 11,34 35,34 38,37 35,40 11,40"
          className={isG ? activeClass : inactiveClass}
        />
      </svg>
    </div>
  );
};

// ================= COMPONENTE PRINCIPAL =================
export interface WhirlpoolDigitalControlScreenProps {
  codigoInput?: string;
  onChangeCodigo?: (val: string) => void;
  onSubmit?: (e?: React.FormEvent) => void;
  isChecking?: boolean;
  errorMessage?: string;
  successMessage?: string;
  onClose?: () => void;
  className?: string;
}

export const WhirlpoolDigitalControlScreen: React.FC<WhirlpoolDigitalControlScreenProps> = ({
  codigoInput: controlledInput,
  onChangeCodigo,
  onSubmit,
  isChecking = false,
  errorMessage = '',
  successMessage = '',
  onClose,
  className = '',
}) => {
  // Self-contained internal state fallback if used standalone
  const [internalCode, setInternalCode] = useState('');
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeValue = controlledInput !== undefined ? controlledInput : internalCode;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    playApplianceBeep('beep');
    if (onChangeCodigo) {
      onChangeCodigo(val);
    } else {
      setInternalCode(val);
    }
  };

  const handleConsultarClick = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isChecking) return;
    setIsButtonPressed(true);
    setTimeout(() => setIsButtonPressed(false), 250);

    if (activeValue.trim()) {
      playApplianceBeep('success');
    } else {
      playApplianceBeep('error');
    }

    if (onSubmit) {
      onSubmit(e);
    }
  };

  // Focus input when clicking anywhere on the screen glass
  const handleScreenGlassClick = () => {
    inputRef.current?.focus();
  };

  // Convert current input into 7-segment digit array:
  // Show up to 7 display cells. If input has fewer chars, the remaining positions
  // stay visible as unlit "ghost" segments (like an authentic physical washing machine).
  const trimmed = activeValue.trim();
  const displayChars = trimmed.length > 0 ? trimmed.split('').slice(0, 8) : [];
  const totalSlots = Math.max(6, displayChars.length);
  const paddedChars: string[] = [];

  for (let i = 0; i < totalSlots; i++) {
    paddedChars.push(displayChars[i] || '');
  }

  return (
    <div
      className={`relative w-full max-w-[720px] mx-auto select-none rounded-[26px] p-2 sm:p-3 bg-gradient-to-b from-[#8C96A4] via-[#CED6E0] to-[#7B8492] shadow-[0_26px_70px_rgba(0,0,0,0.85),0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_3px_rgba(255,255,255,0.7)] border-2 border-[#E2E8F0]/80 transition-all gpu-accelerated ${className}`}
    >
      {/* Marco bisel metálico interior (aluminio cepillado satinado) */}
      <div className="relative rounded-[22px] bg-gradient-to-b from-[#2B3038] via-[#1E232B] to-[#151920] p-3 sm:p-5 shadow-[inset_0_2px_6px_rgba(0,0,0,0.9),0_1px_1px_rgba(255,255,255,0.25)] border border-[#4B5565]">

        {/* ================= 1. CABECERA LIMPIA: LOGO WHIRLPOOL + BOTÓN CERRAR ================= */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#303844]/80">
          <div className="flex items-center gap-3">
            <img
              src={whirlpoolLogo}
              alt="Whirlpool"
              className="h-5 sm:h-7 w-auto object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] brightness-110"
            />
            <div className="h-4 w-px bg-[#4B5565]" />
            <span className="text-[10px] sm:text-[11px] font-mono tracking-widest uppercase font-bold text-slate-300">

            </span>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar pantalla"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#20252D] hover:bg-[#343D49] border border-[#485362] text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ================= 2. PANTALLA DE CRISTAL ACRÍLICO NEGRO AZABACHE CON DISPLAY LED ================= */}
        <div
          onClick={handleScreenGlassClick}
          className="relative mt-3 sm:mt-4 rounded-[16px] bg-[#07090C] border border-[#232B36] p-4 sm:p-6 shadow-[inset_0_4px_24px_rgba(0,0,0,0.95)] overflow-hidden cursor-text group"
        >
          {/* Reflejo especular curvo de cristal acrílico real */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none" />
          <div className="absolute -top-12 left-1/4 w-[120%] h-24 bg-white/[0.03] rotate-[-12deg] blur-md pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-7">

            {/* ZONA IZQUIERDA: DISPLAY DIGITAL 7 SEGMENTOS ("NÚMEROS CON PALITOS") */}
            <div className="w-full flex-1 flex flex-col items-center md:items-start">

              {/* Etiqueta superior del display */}
              <div className="flex items-center gap-2 mb-2 text-[10px] sm:text-xs font-mono font-bold tracking-widest text-[#00E5FF]/80 uppercase">
                <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF] animate-pulse" />
                <span>Display LED</span>
              </div>

              {/* Contenedor físico de los dígitos 7 segmentos (de corrido, sin dos puntos) */}
              <div className="flex items-center justify-center md:justify-start gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-3 bg-[#0B0F15] rounded-xl border border-[#1B232E] shadow-[inset_0_2px_12px_rgba(0,0,0,0.9)] max-w-full overflow-x-auto">
                {paddedChars.map((ch, idx) => (
                  <SevenSegmentDigit
                    key={idx}
                    char={ch}
                  />
                ))}
              </div>

              {/* Input de texto interactivo integrado con marco sutil */}
              <div className="w-full mt-3 sm:mt-4">
                <div className="relative flex items-center bg-[#0C1017] border-2 border-[#242E3B] focus-within:border-[#00E5FF] focus-within:shadow-[0_0_16px_rgba(0,229,255,0.35)] rounded-xl px-3 py-2 sm:py-2.5 transition-all">
                  <span className="text-xs sm:text-sm font-mono font-bold text-slate-400 mr-2 select-none">
                    &gt;
                  </span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={activeValue}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleConsultarClick();
                      }
                    }}
                    placeholder="Escribe aquí tu código"
                    disabled={isChecking}
                    autoFocus
                    className="w-full bg-transparent text-white font-mono text-sm sm:text-base font-bold tracking-wider outline-none placeholder:text-slate-500 placeholder:font-sans placeholder:text-xs sm:placeholder:text-sm"
                  />
                  {activeValue && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onChangeCodigo) onChangeCodigo('');
                        setInternalCode('');
                        inputRef.current?.focus();
                      }}
                      className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* ZONA DERECHA: TECLA TÁCTIL PRINCIPAL ("PLAY" + "CONSULTAR") */}
            <div className="flex flex-col items-center justify-center flex-none pt-2 md:pt-0">
              <button
                type="button"
                onClick={handleConsultarClick}
                disabled={isChecking}
                aria-label="Consultar código"
                className={`relative w-[68px] h-[68px] sm:w-[84px] sm:h-[84px] rounded-full p-1.5 flex items-center justify-center transition-all duration-200 cursor-pointer focus:outline-none ${isButtonPressed
                  ? 'scale-90 brightness-90 shadow-[0_2px_8px_rgba(0,0,0,0.9)]'
                  : 'hover:scale-105 active:scale-95 shadow-[0_10px_25px_rgba(0,0,0,0.85),0_0_20px_rgba(0,229,255,0.3)]'
                  }`}
                style={{
                  background: 'radial-gradient(circle at 35% 30%, #3B4452 0%, #1A2029 65%, #0F1318 100%)',
                  boxShadow: isButtonPressed
                    ? 'inset 0 4px 8px rgba(0,0,0,0.8), 0 0 10px rgba(0,229,255,0.4)'
                    : '0 8px 20px rgba(0,0,0,0.7), inset 0 2px 4px rgba(255,255,255,0.4), 0 0 24px rgba(0,229,255,0.3)',
                }}
              >
                {/* Bisel perimetral cromado con luz táctil */}
                <div className="absolute inset-0 rounded-full border-2 border-[#5A6678] hover:border-[#00E5FF] transition-colors pointer-events-none" />

                {/* Ícono triangular de Play con relieve y glow luminiscente */}
                <div className="relative flex items-center justify-center w-full h-full rounded-full bg-gradient-to-b from-[#252C36] to-[#12161D]">
                  <Play
                    className="w-7 h-7 sm:w-9 sm:h-9 text-white fill-white ml-1 play-btn-glow"
                  />
                </div>
              </button>

              {/* Etiqueta serigrafiada "CONSULTAR" directamente debajo de la tecla de Play */}
              <span className="mt-2 text-xs sm:text-sm font-black uppercase tracking-widest text-slate-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                {isChecking ? 'VALIDANDO…' : 'CONSULTAR'}
              </span>
            </div>

          </div>

          {/* Avisos de confirmación o error dentro del cristal */}
          {errorMessage && (
            <div className="mt-4 p-2.5 rounded-lg bg-red-950/70 border border-red-500/60 text-red-200 text-xs font-semibold flex items-center gap-2 animate-shake text-left">
              <AlertCircle className="w-4 h-4 text-red-400 flex-none" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mt-4 p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-500/60 text-emerald-200 text-xs font-semibold flex items-center gap-2 text-left">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-none" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* ================= 3. TEXTO SERIGRAFIADO OFICIAL EN EL MARCO METÁLICO INFERIOR ================= */}
        <div className="mt-3 sm:mt-4 pt-2 flex items-center justify-between text-slate-400 text-[10px] sm:text-xs">
          <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400">
            Whirlpool Special Days • Edición 2026
          </span>
          {/* Texto requerido al pie de la letra */}
          <span className="font-bold tracking-wide text-slate-200 text-right">
            Lava 14 kg | Seca 8 kg
          </span>
        </div>

      </div>
    </div>
  );
};

export default WhirlpoolDigitalControlScreen;
