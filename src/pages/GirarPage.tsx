import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  RotateCw,
  Gift,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  Clock,
  Award,
  X,
  Ticket,
  Copy,
  Check,
  CreditCard,
} from 'lucide-react';
import { httpService, VerificarCodigoResult, PremioCanjeado } from '../services/httpService';
import {
  playClickSound,
  setSoundMuted,
  getSoundMuted,
  playCapsuleEjectSound,
  playWaterSplashSound,
  playWinSound,
  startSpinSound,
} from '../utils/sound';
import confetti from 'canvas-confetti';
import { LegalBar } from '../components/sections/LegalBar';
import { Footer } from '../components/sections/Footer';
import { WhirlpoolHeroWasher } from '../components/machine/WhirlpoolHeroWasher';
import { WaterPuddleUnderPodium } from '../components/machine/WaterPuddleUnderPodium';
import { CrispPrizeBall } from '../components/machine/CrispPrizeBall';
import WhirlpoolDigitalControlScreen from '../components/machine/WhirlpoolDigitalControlScreen';

export type GirarPhase = 'idle' | 'spinning' | 'opening' | 'awarding' | 'revealed';

// Assets
import tituloImg from '../assets/titulo.png';
import texturaFondoImg from '../assets/textura-fondo.png';
import podioImg from '../assets/Podio.png';
import coin3000 from '../assets/3000 Bs. 2.png';
import coin2000 from '../assets/2000Bs.png';
import coin1000 from '../assets/1000Bs.png';
import coin500 from '../assets/500Bs.png';
import coin250 from '../assets/250Bs.png';
import coin100 from '../assets/100Bs.png';

// Helper map to pick coin image according to amount
const getCoinImage = (amt?: number | string) => {
  if (!amt) return undefined;
  const str = String(amt);
  if (str.includes('3000') || str.includes('3.000')) return coin3000;
  if (str.includes('2000') || str.includes('2.000')) return coin2000;
  if (str.includes('1000') || str.includes('1.000')) return coin1000;
  if (str.includes('500')) return coin500;
  if (str.includes('250')) return coin250;
  return coin100;
};

// Helper to format coupon expiration dates cleanly
const formatExpirationDate = (dateStr?: string) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

// Helper for offline demo spin testing without API
const getDemoCodeData = (customCode?: string): VerificarCodigoResult => ({
  codigo: customCode || 'DEMO-SPIN-2026',
  controlCode: customCode || 'DEMO-SPIN-2026',
  tipo: customCode?.startsWith('DIS') ? 'dismac' : 'otro_distribuidor',
  valido: true,
  nombreCliente: 'Usuario Demo',
  tienda: 'Whirlpool Special Days Demo',
  intentosDisponibles: 10,
  proximoPremio: null,
  premiosCanjeados: [],
  lastFormId: 'demo-form-uuid-9999',
});

export const GirarPage: React.FC = () => {
  // Always reset scroll to the top when navigating to this page
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Sound mute state
  const [muted, setMuted] = useState(getSoundMuted());

  // Input & validation state
  const [codigoInput, setCodigoInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeCodeData, setActiveCodeData] = useState<VerificarCodigoResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Finite state machine: idle -> spinning -> opening -> awarding -> revealed
  const [machinePhase, setMachinePhase] = useState<GirarPhase>('idle');
  const [currentPrize, setCurrentPrize] = useState<PremioCanjeado | null>(null);
  const [waterDrainPhase, setWaterDrainPhase] = useState<'none' | 'flushing' | 'draining' | 'drained'>('none');

  // Cinematic Aerial Camera Tilt: Triggers smoothly when door finishes opening and prize emerges
  const isDoorOpenTest = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('testDoor') === 'open';
  const isDemoSpin = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === 'spin';
  const isAerial = isDoorOpenTest || machinePhase === 'awarding' || machinePhase === 'revealed';

  // Demo Spin Mode: Auto-initialize mock code so testing the animation requires zero setup or backend
  useEffect(() => {
    if (isDemoSpin && !activeCodeData) {
      setActiveCodeData(getDemoCodeData());
    }
  }, [isDemoSpin, activeCodeData]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setSoundMuted(next);
  };

  // Clipboard copy state & handler with feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCode = (text?: string, id?: string) => {
    if (!text) return;
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      const targetId = id || text;
      setCopiedId(targetId);
      setTimeout(() => {
        setCopiedId((prev) => (prev === targetId ? null : prev));
      }, 2000);
    } catch {
      // ignore clipboard error
    }
  };

  // Prevent double click on query submit
  const handleConsultarCodigo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isChecking || machinePhase !== 'idle') return;

    const trimmed = codigoInput.trim().toUpperCase();
    if (!trimmed) {
      setErrorMessage('Ingresa tu código de control o código único.');
      return;
    }

    playClickSound();
    setIsChecking(true);
    setErrorMessage('');

    if (isDemoSpin) {
      setTimeout(() => {
        setActiveCodeData(getDemoCodeData(trimmed));
        setIsChecking(false);
        setIsModalOpen(false);
      }, 250);
      return;
    }

    try {
      const res = await httpService.girar.verificarCodigo(trimmed);

      if (res.success && res.data) {
        setActiveCodeData(res.data);
        setErrorMessage('');
      } else {
        setActiveCodeData(null);
        setErrorMessage(res.message || 'El código no se encuentra en nuestros registros.');
      }
    } catch {
      setActiveCodeData(null);
      setErrorMessage('Error al consultar el código. Inténtalo nuevamente.');
    } finally {
      setIsChecking(false);
    }
  };

  // Spin sequence orchestrator on the real Whirlpool washer
  const handleStartSpin = async () => {
    // Prevent double clicking / multiple triggers
    if (machinePhase !== 'idle' || isChecking) return;

    // If user hasn't entered a code yet, open the modal to get a code (unless in demo mode)
    if (!activeCodeData && !isDemoSpin) {
      playClickSound();
      setIsModalOpen(true);
      return;
    }

    if (!isDemoSpin && activeCodeData && activeCodeData.intentosDisponibles <= 0) {
      setErrorMessage('Este código no tiene más intentos disponibles.');
      return;
    }

    if (!isDemoSpin && activeCodeData && !activeCodeData.lastFormId) {
      setErrorMessage('No se encontró el identificador del formulario para este intento. Por favor consulta tu código nuevamente.');
      return;
    }

    playClickSound();
    setErrorMessage('');
    setCurrentPrize(null);

    // 1. INICIAR EL CENTRIFUGADO DE FORMA INMEDIATA (0ms de retraso, tambor gira al instante)
    setMachinePhase('spinning');
    setWaterDrainPhase('none');
    document.getElementById('washer-stage')?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const stopSpinAudio = startSpinSound();

    let spinResult: any;

    if (isDemoSpin) {
      // 2. MODO DEMO: Simular giro y animación completa sin interactuar con la API
      await new Promise((resolve) => setTimeout(resolve, 2400));
      stopSpinAudio();

      const demoPrizes = ['Bs. 3.000', 'Bs. 2.000', 'Bs. 1.000', 'Bs. 500', 'Bs. 250', 'Bs. 100'];
      const randomPrize = demoPrizes[Math.floor(Math.random() * demoPrizes.length)];
      const currentAttempts = activeCodeData?.intentosDisponibles ?? 10;

      spinResult = {
        process: true,
        success: true,
        statusCode: 200,
        message: 'Giro demo completado con éxito',
        data: {
          premio: {
            id: `demo-prize-${Date.now()}`,
            intentoNumero: (activeCodeData?.premiosCanjeados?.length || 0) + 1,
            premio: randomPrize,
            tipoPremio: 'vale_dismac',
            tipo: 'dismac',
            fecha: new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
            ticketId: `DISMAC-${Math.floor(100000 + Math.random() * 900000)}`,
            code: `DISMAC-${Math.floor(100000 + Math.random() * 900000)}`,
            couponCode: `DISMAC-${Math.floor(100000 + Math.random() * 900000)}`,
            expirationDate: '2026-12-31 23:59:59',
            estado: 'used',
          } as PremioCanjeado,
          intentosRestantes: Math.max(1, currentAttempts - 1),
        },
      };
    } else {
      // 2. Ejecutar la petición al backend en paralelo mientras el tambor ya está girando a alta velocidad
      const intentoNumero = (activeCodeData?.premiosCanjeados?.length || 0) + 1;
      const spinPromise = httpService.girar.completarGiro(
        activeCodeData!.codigo,
        intentoNumero,
        activeCodeData!.lastFormId!,
        activeCodeData!.controlCode,
        activeCodeData!.intentosDisponibles
      );

      // Garantizar al menos 2400ms de centrifugado para una experiencia fluida y realista
      const spinDelayPromise = new Promise((resolve) => setTimeout(resolve, 2400));

      try {
        const [res] = await Promise.all([spinPromise, spinDelayPromise]);
        spinResult = res;
      } catch (err: any) {
        spinResult = {
          process: false,
          success: false,
          statusCode: 500,
          message: err?.message || 'Error de conexión al procesar el giro.',
          errors: [err?.message || 'Error de conexión.'],
        };
      } finally {
        stopSpinAudio();
      }
    }

    // 3. Evaluar respuesta del backend:
    // Si falla o no devuelve premio: detener el giro de inmediato, volver a 'idle' y mostrar el error real
    if (!spinResult || !spinResult.success || !spinResult.data || !spinResult.data.premio) {
      setMachinePhase('idle');
      setWaterDrainPhase('none');
      setCurrentPrize(null);

      const backendMsg =
        spinResult?.message ||
        (spinResult?.errors && spinResult.errors.length > 0 ? spinResult.errors[0] : 'No se pudo completar el giro.');
      setErrorMessage(backendMsg);

      if (backendMsg.toLowerCase().includes('utilizado') || backendMsg.toLowerCase().includes('used')) {
        const codeToVerify = activeCodeData?.controlCode || activeCodeData?.codigo;
        if (codeToVerify) {
          try {
            const fresh = await httpService.girar.verificarCodigo(codeToVerify);
            if (fresh.success && fresh.data) {
              setActiveCodeData(fresh.data);
            }
          } catch {
            // ignore
          }
        }
      }
      return;
    }

    // 4. Si el backend respondió exitosamente con el premio asignado:
    const spinData = spinResult.data;
    const wonPrize = spinData.premio;
    setCurrentPrize(wonPrize);

    // Actualizar activeCodeData con la información sincronizada del backend
    if (spinData.updatedCodeData) {
      setActiveCodeData(spinData.updatedCodeData);
    } else {
      setActiveCodeData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          intentosDisponibles: spinData.intentosRestantes,
          premiosCanjeados: [wonPrize, ...(prev.premiosCanjeados || [])],
        };
      });
    }

    // 5. Continuar la secuencia de apertura y desparrame de agua:
    // Fase 1: Se detiene el centrifugado, se abre la tapa lentamente y brota el agua hacia el podio
    setMachinePhase('opening');
    setWaterDrainPhase('flushing');
    playWaterSplashSound();

    // Fase 2: A los 1500ms: Con la puerta abriéndose de forma suave y realista, cambio de cámara hacia el charco y premio sobre el agua
    setTimeout(() => {
      setMachinePhase('awarding');
      playCapsuleEjectSound();
    }, 1500);

    // Fase 3: A los 2500ms: El tambor terminó de vaciarse por completo, el torrente cesa y el premio queda asentado en el charco
    setTimeout(() => {
      setWaterDrainPhase('draining');
    }, 2500);

    // Fase 4: A los 3300ms: Concluido, sonido de victoria y confeti
    setTimeout(() => {
      setWaterDrainPhase('drained');
      setMachinePhase('revealed');

      const isJackpot = wonPrize.premio.includes('3000') || wonPrize.premio.includes('3.000');
      playWinSound(isJackpot);

      confetti({
        particleCount: isJackpot ? 220 : 140,
        spread: 85,
        origin: { y: 0.65 },
        colors: ['#FDC32B', '#FFD95E', '#1C3B8B', '#D7263D', '#FFFFFF'],
      });

      setTimeout(() => {
        document.getElementById('prize-banner')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 700);
    }, 3300);
  };

  const handleResetForNextAttempt = () => {
    playClickSound();
    setMachinePhase('idle');
    setWaterDrainPhase('none');
    setCurrentPrize(null);
    if (isDemoSpin && (!activeCodeData || activeCodeData.intentosDisponibles <= 1)) {
      setActiveCodeData((prev) =>
        prev
          ? { ...prev, intentosDisponibles: 10 }
          : getDemoCodeData()
      );
    }
  };

  const handleAbrirNuevoCodigo = () => {
    playClickSound();
    if (isDemoSpin) {
      handleResetForNextAttempt();
      return;
    }
    setActiveCodeData(null);
    setCodigoInput('');
    setErrorMessage('');
    setCurrentPrize(null);
    setMachinePhase('idle');
    setWaterDrainPhase('none');
    setIsModalOpen(true);
  };

  const handleResetModalCodigo = () => {
    playClickSound();
    setActiveCodeData(null);
    setCodigoInput('');
    setErrorMessage('');
  };

  // Sunburst rays for background
  const rays = Array.from({ length: 26 });

  return (
    <div className="relative min-h-screen bg-[#FFFBF0] text-[#101010] flex flex-col justify-between select-none">
      {/* ================= FLOATING ACTION CONTROLS (NO EXTRA VERTICAL SPACE) ================= */}
      <Link
        to="/"
        onClick={() => {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }}
        aria-label="Volver"
        className="fixed sm:absolute top-3 sm:top-5 left-3 sm:left-6 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#101010]/85 hover:bg-[#FDC32B] text-white hover:text-[#101010] shadow-[0_6px_20px_rgba(0,0,0,0.25)] backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </Link>

      <button
        type="button"
        onClick={toggleMute}
        className="fixed sm:absolute top-3 sm:top-5 right-3 sm:right-6 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#101010]/85 hover:bg-[#222222] text-[#FDC32B] shadow-[0_6px_20px_rgba(0,0,0,0.25)] backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        title={muted ? 'Activar sonido' : 'Silenciar sonido'}
      >
        {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>

      {/* ================= HERO SECTION (FULL WIDTH WASHING MACHINE STAGE) ================= */}
      <main className="relative flex-1 hero-radial-bg overflow-hidden pt-2 sm:pt-4 pb-12 px-1 sm:px-3 lg:landscape:px-6">
        {/* Sunburst background rays */}
        <div className="absolute inset-0 pointer-events-none opacity-30 z-0">
          {rays.map((_, i) => (
            <span
              key={i}
              className="absolute left-1/2 top-[12%] w-[3px] h-[180vh] origin-top"
              style={{
                background: 'linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0) 55%)',
                transform: `rotate(${i * (360 / 26)}deg)`,
              }}
            />
          ))}
        </div>

        {/* Texture wallpaper */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 z-0 bg-[length:550px] sm:bg-[length:700px] bg-repeat"
          style={{ backgroundImage: `url(${texturaFondoImg})` }}
        />

        <div className="relative z-10 w-full max-w-full lg:landscape:max-w-[1180px] mx-auto flex flex-col items-center">
          {/* Title Banner */}
          <div className="mb-2 text-center px-3">
            <img
              src={tituloImg}
              alt="Whirlpool Special Days"
              className="w-[280px] sm:w-[440px] md:w-[520px] h-auto object-contain drop-shadow-md mx-auto"
            />
          </div>

          {/* Demo Mode Notice */}
          {isDemoSpin && (
            <div className="mb-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-[#101010] font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg border border-black/20 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <span>Modo Demo Activo • Prueba de Animación (Sin API)</span>
            </div>
          )}

          {/* ================= HERO WASHING MACHINE STAGE (FULL WIDTH EN MÓVILES, TABLETS Y TÓTEMS) ================= */}
          <div
            id="washer-stage"
            className="w-full relative mx-auto my-1 sm:my-2 flex flex-col items-center justify-center overflow-visible select-none"
          >
            <div
              className="relative flex flex-col items-center justify-center overflow-visible transition-all washer-stage-container"
              style={{
                transformOrigin: '50% 88%',
                transform: isAerial
                  ? 'translateY(-5%) scale(1.15)'
                  : 'translateY(0%) scale(1)',
                transition: 'transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              {/* 1. Background Spreading Water Puddle (beneath and around podium support, z-8) */}
              <WaterPuddleUnderPodium
                phase={isDoorOpenTest ? 'draining' : waterDrainPhase}
                isAerial={isAerial}
                layer="back"
              />

              {/* Podium Base Platform beneath washer (same official podium from /, z-10) */}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-[3.5%] w-[130%] aspect-[1892/207] z-10 pointer-events-none">
                <div className="absolute inset-x-6 -bottom-3 h-8 bg-black/70 blur-xl rounded-[50%]" />
                <img src={podioImg} alt="Podio Oficial" className="w-full h-full object-contain drop-shadow-2xl" />
              </div>

              {/* 2. Foreground Water Spill & Liquid Support Pedestal (in front of podium, cradling the prize ball, z-22) */}
              <WaterPuddleUnderPodium
                phase={isDoorOpenTest ? 'draining' : waterDrainPhase}
                isAerial={isAerial}
                layer="front"
              />

              {/* The Real Whirlpool Washing Machine with 3D Drum */}
              <div className="relative w-full aspect-[563/794] z-20">
                <WhirlpoolHeroWasher
                  isSpinning={machinePhase === 'spinning'}
                  isDoorOpen={isDoorOpenTest || machinePhase === 'opening' || machinePhase === 'awarding' || machinePhase === 'revealed'}
                  isCapOut={isDoorOpenTest || machinePhase === 'awarding' || machinePhase === 'revealed'}
                  drumState={
                    isDoorOpenTest
                      ? 'awarding'
                      : machinePhase === 'spinning'
                        ? 'washing'
                        : machinePhase === 'opening'
                          ? 'opening'
                          : machinePhase === 'awarding' || machinePhase === 'revealed'
                            ? 'awarding'
                            : 'idle'
                  }
                  winningCoinImg={isDoorOpenTest ? coin3000 : (currentPrize ? getCoinImage(currentPrize.premio) : undefined)}
                  prizeAmount={isDoorOpenTest ? 'Bs. 3.000' : currentPrize?.premio}
                  waterDrainPhase={isDoorOpenTest ? 'draining' : waterDrainPhase}
                  onControlScreenClick={() => {
                    if (isDemoSpin && machinePhase === 'idle') {
                      handleStartSpin();
                      return;
                    }
                    playClickSound();
                    setIsModalOpen(true);
                  }}
                  hasActiveCode={!!activeCodeData}
                  isIdle={!isDoorOpenTest && machinePhase === 'idle'}
                  showCodePrompt={true}
                  showTopCoin={false}
                />
              </div>
            </div>
          </div>

          {/* ================= ERROR / WARNING CALLOUT ================= */}
          {errorMessage && machinePhase === 'idle' && (
            <div className="mt-3 mb-2 w-full max-w-lg mx-auto p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-900 shadow-md flex items-start gap-3 text-sm font-semibold text-left animate-shake relative z-30">
              <AlertTriangle className="w-5 h-5 flex-none text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-extrabold text-amber-950 uppercase text-xs tracking-wider">Aviso:</p>
                <p className="text-amber-900 text-xs sm:text-sm mt-0.5 leading-snug">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage('')}
                className="text-amber-700 hover:text-amber-950 p-1 rounded-lg hover:bg-amber-100/60 transition-colors cursor-pointer"
                aria-label="Cerrar advertencia"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ================= ACTION CONTROLS BELOW WASHER ================= */}
          {activeCodeData && activeCodeData.intentosDisponibles > 0 && machinePhase === 'idle' && (
            <div className="mt-3 sm:mt-5 mb-2 flex flex-col items-center justify-center gap-3 relative z-30">
              {/* Badge nítido del código activo (organizado prolijamente fuera de la imagen de la lavadora) */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#11161F]/90 backdrop-blur-md border border-[#232F3E] text-xs font-mono shadow-md">
                <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] animate-pulse" />
                <span className="text-slate-400 font-sans text-[11px] font-semibold uppercase tracking-wider">
                  {isDemoSpin ? 'Modo de Prueba:' : 'Código ingresado:'}
                </span>
                <span className="font-bold text-[#00E5FF] tracking-wider text-xs sm:text-sm">{activeCodeData.controlCode || activeCodeData.codigo}</span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleStartSpin}
                  className="relative overflow-hidden bg-gradient-to-r from-[#FDC32B] via-[#FFE27A] to-[#FDC32B] hover:brightness-110 active:scale-95 text-[#101010] font-black text-base sm:text-xl uppercase tracking-wider px-8 sm:px-12 py-3.5 sm:py-4 rounded-2xl border-2 border-[#101010] shadow-[0_14px_36px_rgba(253,195,43,0.55)] transition-all cursor-pointer flex items-center gap-2.5 animate-bounce-subtle"
                >
                  <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-btn-shimmer pointer-events-none" />
                  <RotateCw className="w-5 h-5 sm:w-6 sm:h-6 animate-spin-slow" />
                  <span>{isDemoSpin ? '¡Girar Demo!' : '¡Girar Ahora!'}</span>
                  <span className="text-xs sm:text-sm font-mono bg-[#101010] text-[#FDC32B] px-2.5 py-0.5 rounded-full ml-1">
                    {activeCodeData.intentosDisponibles} {activeCodeData.intentosDisponibles === 1 ? 'giro' : 'giros'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setIsModalOpen(true);
                  }}
                  className="bg-white/95 hover:bg-white text-[#101010] font-bold text-xs sm:text-sm uppercase tracking-wider px-5 py-3.5 rounded-2xl border-2 border-[#101010]/20 hover:border-[#101010] shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Search className="w-4 h-4 text-[#6F6756]" />
                  <span>Cambiar código</span>
                </button>
              </div>
            </div>
          )}

          {activeCodeData && activeCodeData.intentosDisponibles <= 0 && machinePhase === 'idle' && (
            <div className="mt-3 sm:mt-5 mb-2 flex flex-wrap items-center justify-center gap-3 relative z-30">
              <button
                type="button"
                onClick={handleAbrirNuevoCodigo}
                className="relative overflow-hidden bg-gradient-to-r from-[#FDC32B] via-[#FFE27A] to-[#FDC32B] hover:brightness-110 active:scale-95 text-[#101010] font-black text-sm sm:text-base uppercase tracking-wider px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl border-2 border-[#101010] shadow-[0_12px_30px_rgba(253,195,43,0.5)] transition-all cursor-pointer flex items-center gap-2"
              >
                <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Ingresar otro código para girar</span>
              </button>
            </div>
          )}


          {/* ================= VICTORY BANNER & NEXT ACTION ================= */}
          {machinePhase === 'revealed' && currentPrize && (
            <div id="prize-banner" className="w-full max-w-[620px] bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#101010] shadow-[0_16px_40px_rgba(0,0,0,0.2)] text-center my-6 animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#FDC32B] via-[#FFE27A] to-[#FDC32B]" />

              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FFFBF0] border border-[#E6DDC6] flex items-center justify-center text-[#101010] shadow-sm mb-3">
                <Gift className="w-8 h-8 text-[#FDC32B]" />
              </div>

              <span className="text-xs font-mono uppercase tracking-widest text-[#6F6756] font-bold">
                ¡Felicidades Ganaste!
              </span>

              <h2 className="font-display text-3xl sm:text-5xl text-[#101010] font-black tracking-tight mt-2">
                ¡{currentPrize.premio}!
              </h2>

              {/* Cupón de canje Dismac O Transferencia para Mercado Informal */}
              {activeCodeData?.tipo === 'dismac' || currentPrize.tipo === 'dismac' || currentPrize.tipoPremio === 'vale_dismac' ? (
                (currentPrize.code || currentPrize.couponCode) && (
                  <div className="mt-5 p-4 bg-[#FFFBF0] border-2 border-[#101010] rounded-2xl max-w-sm mx-auto shadow-sm">
                    <div className="flex items-center justify-center gap-1.5 mb-1.5 text-xs font-black uppercase tracking-wider text-[#6F6756]">
                      <Ticket className="w-4 h-4 text-[#FDC32B]" />
                      <span>Tu Cupón Dismac para Canjear:</span>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <span className="font-mono text-lg sm:text-xl font-black text-[#101010] tracking-widest bg-white px-3.5 py-1.5 rounded-xl border border-[#101010] select-all shadow-inner">
                        {currentPrize.code || currentPrize.couponCode}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleCopyCode(currentPrize.code || currentPrize.couponCode, 'banner')}
                        className="px-3 py-2 bg-[#101010] hover:bg-[#252525] text-[#FDC32B] rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow active:scale-95 flex-none"
                      >
                        {copiedId === 'banner' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>

                    {currentPrize.expirationDate && (
                      <p className="text-[10px] text-[#8E887A] font-semibold mt-2">
                        Válido hasta: {formatExpirationDate(currentPrize.expirationDate)}
                      </p>
                    )}
                  </div>
                )
              ) : (
                <div className="mt-5 p-4 bg-[#F6FDF9] border-2 border-emerald-600 rounded-2xl max-w-md mx-auto shadow-sm text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1 text-xs font-black uppercase tracking-wider text-emerald-800">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>Modalidad: Transferencia Bancaria</span>
                  </div>
                  <p className="text-[11px] text-[#6F6756] mt-1 leading-snug">
                    No requiere cupón. Nuestro equipo coordinará la transferencia a tu número de celular registrado.
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {activeCodeData && activeCodeData.intentosDisponibles > 0 ? (
                  <button
                    type="button"
                    onClick={handleResetForNextAttempt}
                    className="bg-[#101010] hover:bg-[#252525] text-[#FDC32B] font-extrabold text-sm uppercase tracking-wider px-6 py-3.5 rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span>
                      Girar de Nuevo ({activeCodeData.intentosDisponibles}{' '}
                      {activeCodeData.intentosDisponibles === 1 ? 'intento restante' : 'intentos restantes'})
                    </span>
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <div className="text-xs font-bold text-[#101010] bg-[#FFD95E] px-4 py-2.5 rounded-xl border border-[#101010]">
                      Todos los intentos de este código han sido canjeados
                    </div>
                    <button
                      type="button"
                      onClick={handleAbrirNuevoCodigo}
                      className="bg-[#101010] hover:bg-[#252525] text-[#FDC32B] font-extrabold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2 border border-[#101010]"
                    >
                      <RotateCw className="w-4 h-4" />
                      <span>Girar con otro código</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= PREMIOS YA CANJEADOS (SOLO SI YA HA GANADO ALGÚN PREMIO) ================= */}
          {activeCodeData && activeCodeData.premiosCanjeados && activeCodeData.premiosCanjeados.length > 0 && (
            <div className="w-full max-w-[840px] mt-8 text-left transition-all duration-300">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#101010] mb-5">
                <div className="flex items-center gap-2.5">
                  <Award className="w-6 h-6 text-[#101010]" />
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#101010] tracking-tight">
                    Premios Ganados
                  </h3>
                </div>

                <span className="font-mono text-xs font-bold bg-white text-[#101010] border border-[#101010] px-3 py-1 rounded-full shadow-sm">
                  Código: {activeCodeData.controlCode || activeCodeData.codigo}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeCodeData.premiosCanjeados.map((premio) => {
                  const coupon = premio.code || premio.couponCode || premio.ticketId;
                  const isDismac = activeCodeData.tipo === 'dismac' || premio.tipo === 'dismac' || premio.tipoPremio === 'vale_dismac';
                  const isCopied = copiedId === (premio.id || coupon);

                  return (
                    <div
                      key={premio.id}
                      className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-[#101010] shadow-[0_6px_20px_rgba(42,36,24,0.08)] flex flex-col justify-between transition-transform hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-3.5 sm:gap-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 flex-none rounded-xl bg-[#FFFBF0] border border-[#E6DDC6] p-1 flex items-center justify-center shadow-inner">
                          <CrispPrizeBall
                            amount={premio.premio}
                            fallbackImg={getCoinImage(premio.premio)}
                            className="w-full h-full"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-display text-lg font-black text-[#101010] truncate">
                              {premio.premio}
                            </span>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex-none">
                              Canjeado
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-[#8E887A] flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {premio.fecha}
                            </span>
                            {premio.expirationDate && (
                              <span>• Vence: {formatExpirationDate(premio.expirationDate)}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Cupón de canje Dismac O Modalidad Transferencia */}
                      {isDismac && coupon ? (
                        <div className="mt-3 pt-3 border-t border-[#E6DDC6]/70 flex items-center justify-between gap-2 bg-[#FFFBF0] rounded-xl px-3 py-2 border border-[#E6DDC6]">
                          <div className="flex items-center gap-2 min-w-0">
                            <Ticket className="w-4 h-4 text-[#FDC32B] flex-none" />
                            <div className="flex flex-col text-left min-w-0">
                              <span className="text-[9px] uppercase font-bold tracking-wider text-[#6F6756]">
                                Cupón de canje Dismac
                              </span>
                              <span className="font-mono text-sm font-black text-[#101010] tracking-wider truncate select-all">
                                {coupon}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopyCode(coupon, premio.id || coupon)}
                            className="px-2.5 py-1 bg-white hover:bg-[#FDC32B] text-[#101010] border border-[#101010]/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer flex-none shadow-sm active:scale-95"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copiar</span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="mt-3 pt-3 border-t border-[#E6DDC6]/70 flex items-center justify-between gap-2 bg-[#F6FDF9] rounded-xl px-3 py-2 border border-emerald-200">
                          <div className="flex items-center gap-2 min-w-0">
                            <CreditCard className="w-4 h-4 text-emerald-600 flex-none" />
                            <div className="flex flex-col text-left min-w-0">
                              <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-700">
                                Modalidad de entrega
                              </span>
                              <span className="text-xs font-bold text-[#101010] truncate">
                                Transferencia bancaria
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono font-bold bg-[#101010] text-[#FDC32B] px-2 py-0.5 rounded-md flex-none">
                            Mercado informal
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ================= CODE VERIFICATION POPUP MODAL (PANTALLA DIGITAL DE LAVADORA WHIRLPOOL) ================= */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in select-none overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-[720px] my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <WhirlpoolDigitalControlScreen
              codigoInput={codigoInput}
              onChangeCodigo={(val) => {
                setCodigoInput(val);
                setErrorMessage('');
              }}
              onSubmit={handleConsultarCodigo}
              isChecking={isChecking}
              errorMessage={errorMessage}
              onClose={() => setIsModalOpen(false)}
            />

            {/* Aviso informativo complementario */}
            {!activeCodeData && (
              <div className="mt-3 bg-[#1F2418]/90 border border-[#FDC32B]/50 rounded-xl p-3 flex items-start gap-2.5 text-xs text-[#E5D7A3] text-left leading-relaxed shadow-lg backdrop-blur-sm">
                <AlertTriangle className="w-4 h-4 text-[#FDC32B] flex-none mt-0.5" />
                <div>
                  <span className="font-extrabold text-[#FDC32B]">Importante:</span> Si compraste en <strong>Dismac</strong>, ingresa el <strong>código de control</strong> de tu factura. Si compraste en el <strong>mercado informal</strong>, ingresa tu <strong>código único</strong>.
                </div>
              </div>
            )}

            {/* Si el código está validado, mostrar su estado y botón de girar */}
            {activeCodeData && (
              <div className="mt-3 bg-[#14181F] rounded-2xl border-2 border-[#384252] p-4 text-left shadow-2xl">
                {activeCodeData.intentosDisponibles > 0 ? (
                  <div className="space-y-3 bg-[#1A1F29] p-3.5 rounded-xl border border-[#2B3544]">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-black text-[#00E5FF] tracking-wider">
                            {activeCodeData.controlCode || activeCodeData.codigo}
                          </span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/50">
                            Código Válido
                          </span>
                        </div>
                        <p className="text-xs text-[#9AA5B5] mt-0.5">
                          {activeCodeData.tipo === 'dismac'
                            ? 'Compra en tienda Dismac'
                            : 'Compra en distribuidor de mercado'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold bg-[#0A0D11] text-[#FDC32B] border border-[#FDC32B]/40 px-3 py-1.5 rounded-lg shadow-inner">
                          {`${activeCodeData.intentosDisponibles} ${activeCodeData.intentosDisponibles === 1 ? 'giro disponible' : 'giros disponibles'}`}
                        </span>

                        {machinePhase === 'idle' && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsModalOpen(false);
                              handleStartSpin();
                            }}
                            className="relative overflow-hidden bg-gradient-to-r from-[#FDC32B] via-[#FFE27A] to-[#FDC32B] hover:brightness-110 active:scale-95 text-[#101010] font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg border border-[#FDC32B] shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            <span>¡Girar Ahora!</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Si ya canjeó giros previos pero le quedan giros disponibles */}
                    {activeCodeData.premiosCanjeados && activeCodeData.premiosCanjeados.length > 0 && (
                      <div className="pt-2 border-t border-[#2B3544]">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-[#FDC32B]" />
                          <span>Premios ganados con este código:</span>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {activeCodeData.premiosCanjeados.map((premio) => {
                            const coupon = premio.code || premio.couponCode || premio.ticketId;
                            const isDismac = activeCodeData.tipo === 'dismac' || premio.tipo === 'dismac' || premio.tipoPremio === 'vale_dismac';
                            const isCopied = copiedId === (premio.id || coupon);

                            return (
                              <div
                                key={premio.id}
                                className="bg-[#0D1014] border border-[#2B313A] rounded-xl p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <img
                                    src={getCoinImage(premio.premio)}
                                    alt={premio.premio}
                                    className="w-8 h-8 sm:w-9 sm:h-9 object-contain flex-none drop-shadow"
                                  />
                                  <div className="min-w-0">
                                    <div className="font-display font-black text-xs sm:text-sm text-white truncate">
                                      {premio.premio}
                                    </div>
                                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-2.5 h-2.5 text-slate-500" />
                                        {premio.fecha}
                                      </span>
                                      {premio.expirationDate && (
                                        <span className="text-slate-400">
                                          • Vence: {formatExpirationDate(premio.expirationDate)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
                                  {/* CÓDIGO DE CUPÓN PARA DISMAC O MODALIDAD TRANSFERENCIA */}
                                  {isDismac && coupon ? (
                                    <div className="flex items-center gap-2 bg-[#141820] border border-[#00E5FF]/40 rounded-lg px-2.5 py-1">
                                      <div className="flex flex-col text-left">
                                        <span className="text-[8.5px] uppercase font-bold tracking-wider text-[#00E5FF]/80">
                                          Cupón Dismac
                                        </span>
                                        <span className="font-mono text-xs sm:text-sm font-black text-[#00E5FF] tracking-wider select-all">
                                          {coupon}
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleCopyCode(coupon, premio.id || coupon)}
                                        title="Copiar cupón Dismac"
                                        className="p-1 hover:bg-[#00E5FF]/20 text-slate-300 hover:text-[#00E5FF] rounded transition-colors cursor-pointer"
                                      >
                                        {isCopied ? (
                                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        ) : (
                                          <Copy className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5 bg-[#142017] border border-emerald-500/40 rounded-lg px-2.5 py-1">
                                      <CreditCard className="w-3.5 h-3.5 text-emerald-400 flex-none" />
                                      <div className="flex flex-col text-left">
                                        <span className="text-[8px] uppercase font-bold tracking-wider text-emerald-400">
                                          Modalidad
                                        </span>
                                        <span className="text-[11px] font-bold text-slate-200 whitespace-nowrap">
                                          Transferencia bancaria
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  <span className="text-[9.5px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/50 flex-none">
                                    Canjeado
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 bg-[#1A1F29] p-3.5 rounded-xl border border-[#2B3544]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-none" />
                          <span className="font-mono text-sm font-black text-[#00E5FF]">
                            {activeCodeData.controlCode || activeCodeData.codigo}
                          </span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/50">
                            Válido
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#FDC32B] mt-1">
                          Ya utilizaste todos los giros de este código
                        </p>
                      </div>

                      <span className="text-[11px] font-mono font-bold bg-[#0A0D11] text-[#FDC32B] border border-[#FDC32B]/40 px-3 py-1.5 rounded-lg flex-none">
                        0 giros restantes
                      </span>
                    </div>

                    {/* Lista compacta de premios ganados con este código */}
                    {activeCodeData.premiosCanjeados && activeCodeData.premiosCanjeados.length > 0 && (
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-[#FDC32B]" />
                          <span>Premios ganados con este código:</span>
                        </div>
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {activeCodeData.premiosCanjeados.map((premio) => {
                            const coupon = premio.code || premio.couponCode || premio.ticketId;
                            const isDismac = activeCodeData.tipo === 'dismac' || premio.tipo === 'dismac' || premio.tipoPremio === 'vale_dismac';
                            const isCopied = copiedId === (premio.id || coupon);

                            return (
                              <div
                                key={premio.id}
                                className="bg-[#0D1014] border border-[#2B313A] rounded-xl p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <img
                                    src={getCoinImage(premio.premio)}
                                    alt={premio.premio}
                                    className="w-8 h-8 sm:w-9 sm:h-9 object-contain flex-none drop-shadow"
                                  />
                                  <div className="min-w-0">
                                    <div className="font-display font-black text-xs sm:text-sm text-white truncate">
                                      {premio.premio}
                                    </div>
                                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-2.5 h-2.5 text-slate-500" />
                                        {premio.fecha}
                                      </span>
                                      {premio.expirationDate && (
                                        <span className="text-slate-400">
                                          • Vence: {formatExpirationDate(premio.expirationDate)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
                                  {/* CÓDIGO DE CUPÓN PARA DISMAC O MODALIDAD TRANSFERENCIA */}
                                  {isDismac && coupon ? (
                                    <div className="flex items-center gap-2 bg-[#141820] border border-[#00E5FF]/40 rounded-lg px-2.5 py-1">
                                      <div className="flex flex-col text-left">
                                        <span className="text-[8.5px] uppercase font-bold tracking-wider text-[#00E5FF]/80">
                                          Cupón Dismac
                                        </span>
                                        <span className="font-mono text-xs sm:text-sm font-black text-[#00E5FF] tracking-wider select-all">
                                          {coupon}
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleCopyCode(coupon, premio.id || coupon)}
                                        title="Copiar cupón Dismac"
                                        className="p-1 hover:bg-[#00E5FF]/20 text-slate-300 hover:text-[#00E5FF] rounded transition-colors cursor-pointer"
                                      >
                                        {isCopied ? (
                                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        ) : (
                                          <Copy className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5 bg-[#142017] border border-emerald-500/40 rounded-lg px-2.5 py-1">
                                      <CreditCard className="w-3.5 h-3.5 text-emerald-400 flex-none" />
                                      <div className="flex flex-col text-left">
                                        <span className="text-[8px] uppercase font-bold tracking-wider text-emerald-400">
                                          Modalidad
                                        </span>
                                        <span className="text-[11px] font-bold text-slate-200 whitespace-nowrap">
                                          Transferencia bancaria
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  <span className="text-[9.5px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/50 flex-none">
                                    Canjeado
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-[#2B313A]">
                      <button
                        type="button"
                        onClick={handleResetModalCodigo}
                        className="w-full sm:w-auto bg-[#2A303A] hover:bg-[#3D4554] active:scale-95 text-[#FDC32B] font-extrabold text-xs uppercase tracking-wider px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Introducir otro código</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="w-full sm:w-auto bg-[#1C2026] hover:bg-[#252A33] border border-[#3A4350] text-slate-300 font-bold text-xs uppercase px-4 py-2 rounded-lg cursor-pointer"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= REUSABLE INCLUDES: LEGAL BAR & FOOTER ================= */}
      <LegalBar />
      <Footer />
    </div>
  );
};
