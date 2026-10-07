import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  RotateCw,
  Gift,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Volume2,
  VolumeX,
  Clock,
  Award,
  X,
  Sparkles,
} from 'lucide-react';
import { httpService, VerificarCodigoResult, ProximoPremio } from '../services/httpService';
import {
  playClickSound,
  setSoundMuted,
  getSoundMuted,
  startSpinSound,
  playDoorOpenSound,
  playCapsuleEjectSound,
  playWinSound,
} from '../utils/sound';
import confetti from 'canvas-confetti';
import { LegalBar } from '../components/sections/LegalBar';
import { Footer } from '../components/sections/Footer';
import { WhirlpoolHeroWasher } from '../components/machine/WhirlpoolHeroWasher';

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
const getCoinImage = (amt: number | string) => {
  const str = String(amt);
  if (str.includes('3000') || str.includes('3.000')) return coin3000;
  if (str.includes('2000') || str.includes('2.000')) return coin2000;
  if (str.includes('1000') || str.includes('1.000')) return coin1000;
  if (str.includes('500')) return coin500;
  if (str.includes('250')) return coin250;
  return coin100;
};

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
  const [currentPrize, setCurrentPrize] = useState<ProximoPremio | null>(null);
  const [readoutText, setReadoutText] = useState('Listo para girar');

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setSoundMuted(next);
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
  const handleStartSpin = () => {
    // Prevent double clicking / multiple triggers
    if (machinePhase !== 'idle' || isChecking) return;

    // If user hasn't entered a code yet, open the modal to get a code
    if (!activeCodeData) {
      playClickSound();
      setIsModalOpen(true);
      return;
    }

    if (activeCodeData.intentosDisponibles <= 0) {
      setErrorMessage('Este código no tiene más intentos disponibles.');
      return;
    }

    const predeterminedPrize = activeCodeData.proximoPremio;
    if (!predeterminedPrize) {
      setErrorMessage('No hay más intentos disponibles para este código.');
      return;
    }

    playClickSound();
    setCurrentPrize(predeterminedPrize);
    setErrorMessage('');

    // Disparar sincronización con la API inmediatamente al iniciar el giro para que complete durante la animación
    handleSpinFinished(predeterminedPrize);

    // Audio FX
    const stopSpinAudio = startSpinSound();

    // 1. Spinning Phase: Centrifugado turbo en el tambor (agua y esferas girando)
    setMachinePhase('spinning');
    setReadoutText('Centrifugando…');

    // Scroll smoothly to washer
    document.getElementById('washer-stage')?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // 2. Cycle completes after 2600ms
    setTimeout(() => {
      stopSpinAudio();
      setReadoutText('Ciclo completo');
    }, 2600);

    // 3. Door opens (tapa se abre con perspectiva 3D) at 3000ms
    setTimeout(() => {
      playDoorOpenSound();
      setMachinePhase('opening');
      setReadoutText('Abriendo compuerta…');
    }, 3000);

    // 4. Water cascade & prize emerges at 4000ms
    setTimeout(() => {
      playCapsuleEjectSound();
      playWinSound(predeterminedPrize.isJackpot);

      confetti({
        particleCount: predeterminedPrize.isJackpot ? 200 : 130,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#FDC32B', '#FFD95E', '#1C3B8B', '#D7263D', '#FFFFFF'],
      });

      setMachinePhase('awarding');
      setReadoutText(`¡Ganaste ${predeterminedPrize.premio}!`);
    }, 4000);

    // 5. Revealed banner state at 5200ms
    setTimeout(() => {
      setMachinePhase('revealed');
      document.getElementById('prize-banner')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 5200);
  };

  // Called to persist the result in the API
  const handleSpinFinished = async (prizeToRecord = currentPrize) => {
    if (!activeCodeData || !prizeToRecord) return;

    // Actualización optimista inmediata para eliminar parpadeo y que nunca muestre el número previo
    const currentAttempts = activeCodeData.intentosDisponibles;
    const remainingOptimistic = Math.max(0, currentAttempts - 1);
    setActiveCodeData((prev) => (prev ? { ...prev, intentosDisponibles: remainingOptimistic } : null));

    try {
      const updateRes = await httpService.girar.completarGiro(
        activeCodeData.controlCode || activeCodeData.codigo,
        prizeToRecord.intentoNumero,
        activeCodeData.lastFormId,
        activeCodeData.controlCode,
        currentAttempts
      );

      if (updateRes.success && updateRes.data) {
        const resData = updateRes.data;
        if (resData.updatedCodeData) {
          // Re-sincronización en vivo con el backend (actualiza nuevo last_form, intentos y premios)
          setActiveCodeData(resData.updatedCodeData);
        } else {
          // Fallback manual si no hubo sincronización
          setActiveCodeData((prev) => {
            if (!prev) return null;
            const updatedCanjeados = [resData.premio, ...prev.premiosCanjeados];
            return {
              ...prev,
              intentosDisponibles: resData.intentosRestantes,
              proximoPremio: resData.intentosRestantes > 0 ? prev.proximoPremio : null,
              premiosCanjeados: updatedCanjeados,
            };
          });
        }
      }
    } catch (err) {
      console.error('Error al actualizar estado en la API:', err);
    }
  };

  const handleResetForNextAttempt = () => {
    playClickSound();
    setMachinePhase('idle');
    setReadoutText('Listo para girar');
    setCurrentPrize(null);
  };

  const handleAbrirNuevoCodigo = () => {
    playClickSound();
    setActiveCodeData(null);
    setCodigoInput('');
    setErrorMessage('');
    setCurrentPrize(null);
    setMachinePhase('idle');
    setReadoutText('Listo para girar');
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
      <main className="relative flex-1 hero-radial-bg overflow-hidden pt-3 sm:pt-5 pb-12 px-3 sm:px-6">
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

        <div className="relative z-10 max-w-[1180px] mx-auto flex flex-col items-center">
          {/* Title Banner */}
          <div className="mb-2 text-center">
            <img
              src={tituloImg}
              alt="Whirlpool Special Days"
              className="w-[280px] sm:w-[440px] md:w-[520px] h-auto object-contain drop-shadow-md mx-auto"
            />
          </div>

          {/* ================= HERO WASHING MACHINE STAGE (IDENTICAL TO /, HERO SCALE) ================= */}
          <div
            id="washer-stage"
            className="w-full relative mx-auto my-1 sm:my-3 flex flex-col items-center justify-center overflow-visible select-none"
          >
            <div
              className="relative transition-transform duration-1000 ease-out flex flex-col items-center justify-center overflow-visible"
              style={{
                width: 'min(98vw, calc(86vh * 563 / 794), 840px)',
                maxWidth: '100%',
              }}
            >
              {/* Podium Base Platform beneath washer (same official podium from /) */}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-[3.5%] w-[130%] aspect-[1892/207] z-0 pointer-events-none">
                <div className="absolute inset-x-6 -bottom-3 h-8 bg-black/70 blur-xl rounded-[50%]" />
                <img src={podioImg} alt="Podio Oficial" className="w-full h-full object-contain drop-shadow-2xl" />
              </div>

              {/* The Real Whirlpool Washing Machine from / */}
              <div className="relative w-full aspect-[563/794] z-20">
                <WhirlpoolHeroWasher
                  isSpinning={machinePhase === 'spinning'}
                  isDoorOpen={machinePhase === 'opening' || machinePhase === 'awarding' || machinePhase === 'revealed'}
                  isCapOut={machinePhase === 'awarding' || machinePhase === 'revealed'}
                  drumState={
                    machinePhase === 'spinning'
                      ? 'washing'
                      : machinePhase === 'opening'
                        ? 'opening'
                        : machinePhase === 'awarding' || machinePhase === 'revealed'
                          ? 'awarding'
                          : 'idle'
                  }
                  winningCoinImg={getCoinImage(currentPrize?.premio || '3000')}
                  showTopCoin={false}
                />
              </div>
            </div>
          </div>

          {/* ================= ACTION CONTROLS BELOW WASHER ================= */}
          {activeCodeData && activeCodeData.intentosDisponibles > 0 && machinePhase === 'idle' && (
            <div className="mt-3 sm:mt-5 mb-2 flex flex-wrap items-center justify-center gap-3 relative z-30">
              <button
                type="button"
                onClick={handleStartSpin}
                className="relative overflow-hidden bg-gradient-to-r from-[#FDC32B] via-[#FFE27A] to-[#FDC32B] hover:brightness-110 active:scale-95 text-[#101010] font-black text-base sm:text-xl uppercase tracking-wider px-8 sm:px-12 py-3.5 sm:py-4 rounded-2xl border-2 border-[#101010] shadow-[0_14px_36px_rgba(253,195,43,0.55)] transition-all cursor-pointer flex items-center gap-2.5 animate-bounce-subtle"
              >
                <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-btn-shimmer pointer-events-none" />
                <RotateCw className="w-5 h-5 sm:w-6 sm:h-6 animate-spin-slow" />
                <span>¡Girar Ahora!</span>
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

          {!activeCodeData && machinePhase === 'idle' && (
            <div className="mt-3 sm:mt-5 mb-2 flex items-center justify-center relative z-30">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setIsModalOpen(true);
                }}
                className="relative overflow-hidden bg-[#101010] hover:bg-[#222222] active:scale-95 text-[#FDC32B] font-extrabold text-xs sm:text-sm uppercase tracking-wider px-6 sm:px-8 py-3 rounded-2xl border-2 border-[#FDC32B]/80 shadow-[0_8px_22px_rgba(0,0,0,0.25)] transition-all cursor-pointer flex items-center gap-2 group"
              >
                <Sparkles className="w-4 h-4 text-[#FDC32B] group-hover:rotate-12 transition-transform" />
                <span>Ingresa tu código para girar</span>
                <span className="text-[10px] font-mono font-bold bg-[#FDC32B] text-[#101010] px-2 py-0.5 rounded-full ml-1">
                  Dismac / Mercados
                </span>
              </button>
            </div>
          )}

          {machinePhase !== 'idle' && (
            <div className="mt-3 sm:mt-5 mb-2 flex items-center justify-center relative z-30 animate-pulse">
              <div className="bg-[#101010]/90 text-[#00E5FF] font-mono text-xs sm:text-sm font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl border border-[#00E5FF]/40 shadow-[0_0_20px_rgba(0,229,255,0.3)] flex items-center gap-2.5">
                <RotateCw className="w-4 h-4 animate-spin text-[#FDC32B]" />
                <span>{readoutText}</span>
              </div>
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
                {activeCodeData.premiosCanjeados.map((premio) => (
                  <div
                    key={premio.id}
                    className="bg-white rounded-2xl p-5 border-2 border-[#101010] shadow-[0_6px_20px_rgba(42,36,24,0.08)] flex items-center gap-4 transition-transform hover:-translate-y-0.5"
                  >
                    <div className="w-16 h-16 flex-none rounded-xl bg-[#FFFBF0] border border-[#E6DDC6] p-1 flex items-center justify-center shadow-inner">
                      <img
                        src={getCoinImage(premio.premio)}
                        alt={premio.premio}
                        className="w-full h-full object-contain drop-shadow"
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

                      <div className="flex items-center gap-3 text-[11px] text-[#8E887A] mt-2 pt-1.5 border-t border-[#E6DDC6]/60">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {premio.fecha}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ================= CODE VERIFICATION POPUP MODAL ================= */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fade-in select-none"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-[620px] bg-white rounded-3xl p-5 sm:p-8 border-2 border-[#101010] shadow-[0_24px_60px_rgba(0,0,0,0.5)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top gold accent line */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#FDC32B] via-[#FFE27A] to-[#FDC32B]" />

            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              aria-label="Cerrar ventana"
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#101010]/10 hover:bg-[#101010] hover:text-white flex items-center justify-center transition-all cursor-pointer text-[#101010]"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="mb-4 text-left">
              <label className="text-base sm:text-lg font-black tracking-wide text-[#101010] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FDC32B] inline-block shadow-sm" />
                Ingresa tu código
              </label>
              <p className="text-xs text-[#6F6756] mt-0.5">
                Valida tu compra para activar tus giros en la lavadora
              </p>
            </div>

            {/* Warning Callout */}
            <div className="mb-4 bg-[#FFF9EA] border border-[#FDC32B] rounded-2xl p-3 sm:p-3.5 flex items-start gap-2.5 text-xs sm:text-[13px] text-[#554C3A] text-left leading-relaxed shadow-xs">
              <AlertTriangle className="w-4 h-4 text-[#D97706] flex-none mt-0.5" />
              <div>
                <span className="font-extrabold text-[#9A6200]">Importante:</span> Si compraste en <strong>Dismac</strong>, ingresa el <strong>código de control</strong> de tu factura. Si compraste en el <strong>mercado informal</strong>, ingresa tu <strong>código único</strong>.
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleConsultarCodigo} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={codigoInput}
                    onChange={(e) => {
                      setCodigoInput(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder=""
                    disabled={isChecking || machinePhase !== 'idle'}
                    autoFocus
                    className="w-full bg-[#FFFDF7] border-2 border-[#101010]/20 focus:border-[#101010] focus:ring-4 focus:ring-[#FDC32B]/30 rounded-2xl px-4 py-3.5 sm:py-4 text-[#101010] font-mono text-base sm:text-lg font-bold tracking-wider outline-none transition-all placeholder:text-[#A89F8D] placeholder:tracking-normal placeholder:font-sans placeholder:text-sm shadow-inner"
                  />
                  {activeCodeData && (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isChecking || machinePhase !== 'idle'}
                  className="bg-[#101010] hover:bg-[#222222] active:scale-95 disabled:opacity-60 text-[#FDC32B] hover:text-white font-extrabold text-sm uppercase tracking-wider px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-[#101010]"
                >
                  <Search className="w-4 h-4" />
                  <span>{isChecking ? 'Verificando…' : 'Consultar'}</span>
                </button>
              </div>

              {/* Error Alert inside modal */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 text-left animate-shake">
                  <AlertCircle className="w-4 h-4 flex-none text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Quick Test Shortcuts 
              <div className="pt-2 border-t border-[#E6DDC6]/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#6F6756]">
                <span className="font-semibold">Pruebas rápidas:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={handleFillDemoDismac}
                    className="px-2.5 py-1 rounded-lg bg-[#FFFBF0] hover:bg-[#FDC32B] border border-[#E6DDC6] text-[#101010] font-bold transition-colors cursor-pointer"
                  >
                    Demo Dismac (2 giros)
                  </button>
                  <button
                    type="button"
                    onClick={handleFillDemoMercado}
                    className="px-2.5 py-1 rounded-lg bg-[#FFFBF0] hover:bg-[#FDC32B] border border-[#E6DDC6] text-[#101010] font-bold transition-colors cursor-pointer"
                  >
                    Demo Mercado (1 giro)
                  </button>
                  <button
                    type="button"
                    onClick={handleFillDemoInvalido}
                    className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold transition-colors cursor-pointer"
                  >
                    Código Inválido
                  </button>
                </div>
              </div>
              */}
            </form>

            {/* If code verified: show status & action inside modal */}
            {activeCodeData && (
              <div className="mt-5 pt-4 border-t-2 border-[#101010]/10 text-left">
                {activeCodeData.intentosDisponibles > 0 ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm sm:text-base font-black text-[#101010]">
                          {activeCodeData.controlCode || activeCodeData.codigo}
                        </span>
                        <span className="text-[10.5px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Válido
                        </span>
                      </div>
                      <p className="text-xs text-[#6F6756] mt-0.5">
                        {activeCodeData.tipo === 'dismac'
                          ? 'Compra en tienda Dismac'
                          : 'Compra en distribuidor de mercado'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="font-display text-sm font-bold bg-[#FFD95E] text-[#101010] px-3.5 py-1.5 rounded-xl border border-[#101010] shadow-sm">
                        {`${activeCodeData.intentosDisponibles} ${activeCodeData.intentosDisponibles === 1 ? 'giro disponible' : 'giros disponibles'}`}
                      </span>

                      {machinePhase === 'idle' && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsModalOpen(false);
                            handleStartSpin();
                          }}
                          className="relative overflow-hidden bg-gradient-to-r from-[#FDC32B] via-[#FFE27A] to-[#FDC32B] hover:brightness-105 active:scale-95 text-[#101010] font-black text-sm uppercase tracking-wider px-5 py-2.5 rounded-xl border-2 border-[#101010] shadow-md transition-all cursor-pointer"
                        >
                          <span className="relative z-10 flex items-center gap-1.5">
                            <RotateCw className="w-4 h-4" />
                            ¡Girar Ahora!
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-[#FFF9EA] border border-[#FDC32B] rounded-2xl p-3 sm:p-3.5 flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-none" />
                          <span className="font-mono text-sm font-black text-[#101010]">
                            {activeCodeData.controlCode || activeCodeData.codigo}
                          </span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Válido
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#8C6D15] mt-1">
                          Ya utilizaste todos los giros de este código
                        </p>
                      </div>

                      <span className="text-[11px] font-bold bg-[#101010] text-[#FDC32B] px-3 py-1.5 rounded-xl flex-none">
                        0 giros restantes
                      </span>
                    </div>

                    {/* Lista compacta de premios ganados con este código */}
                    {activeCodeData.premiosCanjeados && activeCodeData.premiosCanjeados.length > 0 && (
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#6F6756] mb-2 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-[#101010]" />
                          <span>Premios ganados con este código:</span>
                        </div>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {activeCodeData.premiosCanjeados.map((premio) => (
                            <div
                              key={premio.id}
                              className="bg-[#FFFBF0] border border-[#E6DDC6] rounded-xl p-2 sm:p-2.5 flex items-center justify-between gap-3 shadow-2xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={getCoinImage(premio.premio)}
                                  alt={premio.premio}
                                  className="w-7 h-7 sm:w-8 sm:h-8 object-contain flex-none drop-shadow"
                                />
                                <div className="truncate">
                                  <div className="font-display font-black text-xs sm:text-sm text-[#101010] truncate">
                                    {premio.premio}
                                  </div>
                                  <div className="text-[10px] text-[#8E887A] flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5" />
                                    {premio.fecha}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[9.5px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex-none">
                                Canjeado
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-[#101010]/10">
                      <button
                        type="button"
                        onClick={handleResetModalCodigo}
                        className="w-full sm:w-auto bg-[#101010] hover:bg-[#252525] active:scale-95 text-[#FDC32B] font-extrabold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Introducir otro código</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="w-full sm:w-auto bg-white hover:bg-zinc-100 border border-[#101010]/20 text-[#101010] font-bold text-xs uppercase px-4 py-2.5 rounded-xl cursor-pointer"
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
