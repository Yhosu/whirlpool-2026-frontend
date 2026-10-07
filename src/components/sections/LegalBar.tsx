import React from 'react';
import basesPdf from '../../assets/bases.pdf';

export interface LegalBarProps {
  className?: string;
  transparentBg?: boolean;
}

export const LegalBar: React.FC<LegalBarProps> = ({
  className = '',
  transparentBg = false,
}) => {
  const bgClasses = transparentBg
    ? 'bg-transparent'
    : 'bg-gradient-to-r from-[#FDC32B] via-[#FFD95E] to-[#FDC32B] shadow-inner';

  return (
    <section className={`${bgClasses} py-12 text-center select-none ${className}`}>
      <div className="w-full max-w-[1060px] mx-auto px-5 text-center">
        <h3 className="font-display text-[clamp(22px,5vw,30px)] text-[#101010] font-black">
          Bases y condiciones
        </h3>
        <p className="mt-3 text-[#3B3219] text-[15px] max-w-[54ch] mx-auto leading-relaxed font-medium">
          Aquí está todo el detalle de la promoción: productos participantes, premios, direcciones de los puntos de venta, plazos y requisitos de entrega.
        </p>
        <div className="mt-6 flex justify-center">
          <a
            href={basesPdf}
            target="_blank"
            rel="noopener noreferrer"
            id="bases-link"
            className="relative overflow-hidden inline-flex items-center justify-center bg-[#101010] hover:bg-black text-[#FDC32B] hover:text-white rounded-2xl py-3.5 px-8 font-black text-sm uppercase tracking-wider shadow-[0_4px_16px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-btn-shimmer pointer-events-none" />
            <span className="relative z-10">Leer las bases y condiciones</span>
          </a>
        </div>
      </div>
    </section>
  );
};
