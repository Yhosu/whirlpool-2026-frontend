import React, { useState } from 'react';
import { WasherDrumCanvas } from './WasherDrumCanvas';
import { MachineState } from '../../../types';
import { X, Sparkles, Activity } from 'lucide-react';

interface WasherModalInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  machineState: MachineState;
}

export const WasherModalInspector: React.FC<WasherModalInspectorProps> = ({
  isOpen,
  onClose,
  machineState,
}) => {
  const [cycleTelemetry, setCycleTelemetry] = useState({
    name: 'Vaivén Suave & Remojo',
    rpm: 25,
    flowType: 'Flujo Ondulante Bidireccional',
    description: 'Movimiento oscilante para inmersión profunda de esferas',
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-[560px] bg-gradient-to-b from-[#1c2027] to-[#0f1216] border-2 border-[#FDC32B]/60 rounded-3xl p-5 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#10b981] animate-ping" />
            <h3 className="font-display text-white text-base sm:text-lg font-bold tracking-wider uppercase">
              Primer Plano 3D — Tambor & Fluidos
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3D Viewport: Fixed Frontal Close-Up */}
        <div className="relative w-full aspect-square max-w-[420px] mx-auto rounded-full p-2 bg-gradient-to-b from-[#2a303c] via-[#11141a] to-[#07090c] shadow-[0_15px_40px_rgba(0,0,0,0.9),inset_0_4px_16px_rgba(255,255,255,0.1)] border-4 border-[#333b47]">
          <WasherDrumCanvas
            machineState={machineState}
            className="w-full h-full"
            interactive={true}
            onCycleChange={(info) => setCycleTelemetry(info)}
          />
        </div>

        {/* 100% Automatic & Random Live Telemetry (No manual selection) */}
        <div className="mt-5 space-y-3">
          {/* Active Cycle Status Card */}
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 shadow-inner flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00a8e8] animate-pulse" />
                <span className="text-xs uppercase font-mono tracking-widest text-slate-300">
                  Modo 100% Automático & Random
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FDC32B]/20 text-[#FDC32B] border border-[#FDC32B]/40 flex items-center gap-1">
                <Activity className="w-3 h-3 animate-spin" />
                {Math.abs(cycleTelemetry.rpm)} RPM
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-2">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#38bdf8]" />
                  {cycleTelemetry.name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {cycleTelemetry.description}
                </p>
              </div>
            </div>

            <div className="text-[10px] text-[#38bdf8] bg-[#0284c7]/10 px-2.5 py-1 rounded-lg border border-[#0284c7]/20 flex items-center justify-between">
              <span>Dinámica de fluidos: {cycleTelemetry.flowType}</span>
              <span className="text-slate-400">Transición aleatoria activa</span>
            </div>
          </div>

          <p className="text-[11px] text-center text-slate-400">
            El tambor alterna automáticamente entre ciclos de vaivén, centrifugado vórtice y oleaje con agua y espuma real. Haz clic en el vidrio para generar ondas adicionales.
          </p>
        </div>
      </div>
    </div>
  );
};
