import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChannelType, PrizeResultData } from '../../types';
import { playClickSound } from '../../utils/sound';
import { ArrowRight, ShoppingBag, Store, AlertCircle } from 'lucide-react';

interface PickerProps {
  onSpinSubmit: (channel: ChannelType, code: string) => void;
  isBusy: boolean;
  result: PrizeResultData | null;
  onReset: () => void;
}

export const Picker: React.FC<PickerProps> = ({
  onSpinSubmit,
  isBusy,
  result,
  onReset,
}) => {
  const [channel, setChannel] = useState<ChannelType | null>(null);

  // Dismac Form Fields
  const [codigoDismac, setCodigoDismac] = useState('');
  const [ciDismac, setCiDismac] = useState('');
  const [celDismac, setCelDismac] = useState('');
  const [errDismac, setErrDismac] = useState('');

  // Local Set for used codes
  const [usedCodes] = useState<Set<string>>(() => new Set());

  const handleBack = () => {
    playClickSound();
    setChannel(null);
    setErrDismac('');
    onReset();
  };

  // Dismac code formatting
  const handleCodigoDismacChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 14);
    setCodigoDismac(v);
    setErrDismac('');
  };

  // Numeric only for CI and Phone
  const handleNumericInput = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    maxLen: number
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, maxLen);
    setter(v);
  };

  // Auto-fill demo helpers
  const handleFillDemoDismac = () => {
    playClickSound();
    const randNum = Math.floor(10 + Math.random() * 89);
    setCodigoDismac(`DM-94-B1-${randNum}`);
    setCiDismac('7829104');
    setCelDismac('76543210');
    setErrDismac('');
  };

  // Dismac Submit
  const handleDismacSubmit = () => {
    if (isBusy) return;
    playClickSound();
    const c = codigoDismac.trim();
    if (c.length < 6) {
      setErrDismac('Revisa el código de control de tu factura.');
      return;
    }
    if (usedCodes.has(c)) {
      setErrDismac('Este código ya participó. Cada compra habilita un giro.');
      return;
    }
    if (ciDismac.length < 5) {
      setErrDismac('Ingresa tu número de cédula de identidad.');
      return;
    }
    if (celDismac.length < 7) {
      setErrDismac('Ingresa tu número de celular.');
      return;
    }

    usedCodes.add(c);
    setErrDismac('');
    onSpinSubmit('dismac', c);
  };

  return (
    <section className="bg-[#FFFBF0] text-[#2A2418] py-16 md:py-20 select-none border-t border-b border-[#E6DDC6]" id="participar">
      <div className="w-full max-w-[1060px] mx-auto px-5 text-center relative z-10">
        <h2 className="font-display text-[#101010] text-[clamp(26px,5.5vw,40px)] font-bold tracking-tight">
          ¿Ya compraste tu Whirlpool?
        </h2>
        <p className="text-[#6F6756] max-w-[56ch] mx-auto mt-3 text-sm sm:text-base leading-relaxed">
          Participa ahora y descubre tu premio al instante. Recuerda tener tu factura o nota de venta y tu cédula de identidad.
        </p>

        {/* ================= PATHS SELECTOR CARDS ================= */}
        {!channel && !result && (
          <div className="grid gap-7 mt-12 grid-cols-1 md:grid-cols-2 text-center" id="paths">
            {/* 1. DISMAC CARD -> Links to /girar */}
            <Link
              to="/girar"
              id="btn-dismac"
              onClick={() => {
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
              className="group bg-white hover:bg-[#FFFCF6] rounded-3xl p-8 sm:p-10 border-2 border-[#101010] hover:border-[#FDC32B] shadow-[0_10px_30px_rgba(42,36,24,0.06)] hover:shadow-[0_20px_45px_rgba(253,195,43,0.2)] transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between items-center text-center"
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFFBF0] to-[#FFF0C0] border border-[#E6DDC6] flex items-center justify-center text-[#101010] mb-5 group-hover:scale-110 group-hover:bg-[#FDC32B] transition-all shadow-sm">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="font-display text-[clamp(22px,4.5vw,28px)] text-[#101010] font-bold leading-tight text-center">
                  Compraste en Dismac
                </h3>
                <p className="text-[#6F6756] text-sm sm:text-base mt-3 leading-relaxed text-center max-w-xs">
                  En cualquier tienda Dismac o en dismac.com.bo.
                </p>
              </div>

              <div className="mt-8 flex justify-center w-full">
                <span className="relative overflow-hidden inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#FDC32B] via-[#FFE27A] to-[#FDC32B] text-[#101010] font-black rounded-2xl py-3.5 px-8 text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_6px_20px_rgba(253,195,43,0.35)] group-hover:shadow-[0_10px_28px_rgba(253,195,43,0.55)] group-hover:scale-105 active:scale-95">
                  <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-btn-shimmer pointer-events-none" />
                  <span className="relative z-10 font-black">Clic aquí</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1.5 transition-transform" />
                </span>
              </div>
            </Link>

            {/* 2. OTRO DISTRIBUIDOR CARD -> Links to /registro-distribuidor */}
            <Link
              to="/registro-distribuidor"
              id="btn-mercado"
              onClick={() => {
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
              className="group bg-white hover:bg-[#FFFCF6] rounded-3xl p-8 sm:p-10 border-2 border-[#101010] hover:border-[#FDC32B] shadow-[0_10px_30px_rgba(42,36,24,0.06)] hover:shadow-[0_20px_45px_rgba(253,195,43,0.2)] transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between items-center text-center"
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFFBF0] to-[#FFF0C0] border border-[#E6DDC6] flex items-center justify-center text-[#101010] mb-5 group-hover:scale-110 group-hover:bg-[#FDC32B] transition-all shadow-sm">
                  <Store className="w-7 h-7" />
                </div>
                <h3 className="font-display text-[clamp(22px,4.5vw,28px)] text-[#101010] font-bold leading-tight text-center">
                  Compraste en otro distribuidor
                </h3>
                <p className="text-[#6F6756] text-sm sm:text-base mt-3 leading-relaxed text-center max-w-xs">
                  En un punto de venta autorizado en mercados.
                </p>
              </div>

              <div className="mt-8 flex justify-center w-full">
                <span className="relative overflow-hidden inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#FDC32B] via-[#FFE27A] to-[#FDC32B] text-[#101010] font-black rounded-2xl py-3.5 px-8 text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_6px_20px_rgba(253,195,43,0.35)] group-hover:shadow-[0_10px_28px_rgba(253,195,43,0.55)] group-hover:scale-105 active:scale-95">
                  <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-btn-shimmer pointer-events-none" />
                  <span className="relative z-10 font-black">Clic aquí</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1.5 transition-transform" />
                </span>
              </div>
            </Link>
          </div>
        )}


        {/* INLINE FORM DISMAC (When testing spin directly on the hero machine) */}
        {channel === 'dismac' && !result && (
          <div className="mt-8" id="form-dismac">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-[490px] mx-auto text-left shadow-xl border-2 border-[#101010]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6DDC6] mb-5">
                <h3 className="font-display text-xl text-[#101010] font-bold">
                  Clientes Dismac
                </h3>
                <button
                  type="button"
                  onClick={handleFillDemoDismac}
                  className="text-xs text-[#6F6756] hover:text-[#101010] font-semibold underline cursor-pointer"
                >
                  Demo Dismac
                </button>
              </div>

              {errDismac && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-none" />
                  <span>{errDismac}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2A2418] uppercase tracking-wider mb-1.5">
                    Código de Control de Factura *
                  </label>
                  <input
                    type="text"
                    value={codigoDismac}
                    onChange={handleCodigoDismacChange}
                    placeholder=""
                    className="w-full bg-[#FFFBF0] border border-[#E6DDC6] focus:border-[#101010] rounded-xl px-4 py-3 text-[#101010] font-mono text-base outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#2A2418] uppercase tracking-wider mb-1.5">
                      Cédula (CI) *
                    </label>
                    <input
                      type="text"
                      value={ciDismac}
                      onChange={handleNumericInput(setCiDismac, 10)}
                      placeholder="7829104"
                      className="w-full bg-[#FFFBF0] border border-[#E6DDC6] focus:border-[#101010] rounded-xl px-3.5 py-2.5 text-[#101010] text-sm outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2A2418] uppercase tracking-wider mb-1.5">
                      Celular *
                    </label>
                    <input
                      type="tel"
                      value={celDismac}
                      onChange={handleNumericInput(setCelDismac, 8)}
                      placeholder="76543210"
                      className="w-full bg-[#FFFBF0] border border-[#E6DDC6] focus:border-[#101010] rounded-xl px-3.5 py-2.5 text-[#101010] text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 bg-[#F0EBE0] hover:bg-[#E5DFD4] text-[#101010] font-bold py-3 px-4 rounded-xl text-sm transition-colors"
                  >
                    Volver
                  </button>
                  <button
                    type="button"
                    onClick={handleDismacSubmit}
                    disabled={isBusy}
                    className="flex-2 bg-[#FDC32B] hover:bg-[#ffcf40] text-[#101010] font-black py-3 px-6 rounded-xl text-sm uppercase tracking-wider transition-all shadow-md active:scale-95"
                  >
                    {isBusy ? 'Girando...' : 'Hacer Girar la Lavadora →'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
