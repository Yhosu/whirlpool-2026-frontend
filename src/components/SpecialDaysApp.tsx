import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Hero } from './hero/Hero';
import { Picker } from './picker/Picker';
import { HowToParticipate } from './sections/HowToParticipate';
import { WhereToParticipate } from './sections/WhereToParticipate';
import { UsBrandBand } from './sections/UsBrandBand';
import { XpertTechnologies } from './sections/XpertTechnologies';
import { Faq } from './sections/Faq';
import { LegalBar } from './sections/LegalBar';
import { Footer } from './sections/Footer';
import { MachineState, ChannelType, PrizeResultData } from '../types';
import { drawPrize } from '../utils/lottery';
import {
  startSpinSound,
  playDoorOpenSound,
  playCapsuleEjectSound,
  playWinSound,
} from '../utils/sound';

export const SpecialDaysApp: React.FC = () => {
  // Machine States
  const [machineState, setMachineState] = useState<MachineState>('idle');
  const [readoutText, setReadoutText] = useState<string>('Listo para girar');
  const [led1, setLed1] = useState<boolean>(false);
  const [led2, setLed2] = useState<boolean>(false);
  const [led3, setLed3] = useState<boolean>(true);

  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [result, setResult] = useState<PrizeResultData | null>(null);

  // Auto-trigger demo spin if ?demo=spin is in URL
  React.useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === 'spin') {
      const timer = setTimeout(() => {
        handleSpinSubmit('dismac', 'DEMO-SPIN-2026');
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleReset = () => {
    setMachineState('idle');
    setReadoutText('Listo para girar');
    setLed1(false);
    setLed2(false);
    setLed3(true);
    setResult(null);
    setIsBusy(false);
  };

  const handleSpinSubmit = (channel: ChannelType, code: string) => {
    if (isBusy) return;
    setIsBusy(true);
    setResult(null);
    setMachineState('idle');

    const prize = drawPrize();

    // Sound FX
    const stopAudio = startSpinSound();

    // 1. Initial Spin Phase
    setReadoutText('Centrifugando…');
    setLed1(true);
    setLed2(false);
    setLed3(false);
    setMachineState('washing');

    // Scroll to machine in the hero
    document.getElementById('machine-wrapper')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    // 2. Cycle complete after 2300ms
    setTimeout(() => {
      stopAudio();
      setLed1(true);
      setLed2(true);
      setLed3(false);
      setReadoutText('Ciclo completo');
      setMachineState('cycle_done');
    }, 2300);

    // 3. Door opens after 2800ms
    setTimeout(() => {
      playDoorOpenSound();
      setReadoutText('Abriendo');
      setMachineState('opening');
    }, 2800);

    // 4. Capsule pops out & prize awarded after 3700ms
    setTimeout(() => {
      playCapsuleEjectSound();
      playWinSound(prize.isJackpot);

      // Confetti celebration
      confetti({
        particleCount: prize.isJackpot ? 180 : 100,
        spread: 70,
        origin: { y: 0.55 },
        colors: ['#FDC32B', '#FFD95E', '#1C3B8B', '#D7263D', '#FFFFFF'],
      });

      setLed1(true);
      setLed2(true);
      setLed3(true);
      setReadoutText(`Ganaste ${prize.amt}`);
      setMachineState('awarding');

      const esVale = channel === 'dismac';
      const prizeResult: PrizeResultData = {
        kind: esVale ? 'Ganaste un vale de compra' : 'Ganaste en efectivo',
        amt: prize.amt,
        how: esVale
          ? 'Tu vale se emite al instante y lo usás en cualquier tienda Dismac o en dismac.com.bo.'
          : 'Te transferimos el monto a una cuenta a tu nombre, una vez verificados tus datos.',
        code: code,
        where: esVale ? 'Vale de compra Dismac' : 'Transferencia bancaria',
        due: esVale ? '90 días para canjearlo' : 'Según verificación de datos',
        isJackpot: prize.isJackpot,
      };

      setResult(prizeResult);
      setIsBusy(false);

      // Scroll down to the result ticket
      setTimeout(() => {
        document.getElementById('result')?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 350);
    }, 3700);
  };

  return (
    <div className="min-h-screen bg-[#FFFBF0] text-[#2A2418] font-sans antialiased selection:bg-[#FDC32B] selection:text-[#101010]">
      {/* 1. HERO SECTION (contains Logo, Lockup, Claim, Washing Machine, Flow, Dates, Tech) */}
      <Hero
        machineState={machineState}
        readoutText={readoutText}
        led1={led1}
        led2={led2}
        led3={led3}
      />

      {/* 2. PICKER SECTION (Channel Selector, Forms, and Result Ticket) */}
      <Picker
        onSpinSubmit={handleSpinSubmit}
        isBusy={isBusy}
        result={result}
        onReset={handleReset}
      />

      {/* 3. CÓMO PARTICIPAR (4 Steps) */}
      <HowToParticipate />

      {/* 4. DÓNDE PARTICIPÁS (6 Cities) */}
      <WhereToParticipate />

      {/* 5. MARCA AMERICANA BAND (Shield and Copy) */}
      <UsBrandBand />

      {/* 6. TECNOLOGÍAS XPERT (Lavado & Refrigeración) */}
      <XpertTechnologies />

      {/* 7. PREGUNTAS FRECUENTES (9 Items with Prize Pills) */}
      <Faq />

      {/* 8. BASES Y CONDICIONES (Yellow Bar) */}
      <LegalBar />

      {/* 9. FOOTER */}
      <Footer />
    </div>
  );
};
