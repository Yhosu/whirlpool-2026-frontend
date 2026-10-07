import React from 'react';
import whirlpoolLogo from '../../assets/whirlpool-footer-logo.png';
import basesPdf from '../../assets/bases.pdf';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#101010] text-[#8E887A] py-12 pb-16 text-[13px] text-center border-t border-[#222222]">
      <div className="w-full max-w-[860px] mx-auto px-5 flex flex-col items-center text-center">
        {/* Official Whirlpool Logo */}
        <div className="flex justify-center mb-5">
          <img
            src={whirlpoolLogo}
            alt="Whirlpool"
            className="h-10 sm:h-12 w-auto object-contain select-none hover:scale-105 transition-transform"
          />
        </div>

        <p className="max-w-[72ch] leading-[1.7] mx-auto text-center text-[#9E988A]">
          Promoción empresarial “Whirlpool Special Days”, válida del 12 de octubre al 15 de noviembre de 2026 en Santa Cruz, La Paz, El Alto, Cochabamba, Sucre y Tarija.
          Modalidad de premiación por azar. Participan personas naturales con factura a su nombre; no participan personas jurídicas ni ventas corporativas.
          Vales de compra Dismac con 90 días de vigencia. Premios en efectivo mediante transferencia a cuenta del titular.
          Consulta las{' '}
          <a
            href={basesPdf}
            target="_blank"
            rel="noopener noreferrer"
            id="bases-link-2"
            className="text-[#FDC32B] underline hover:text-[#FFD95E] font-medium transition-colors"
          >
            bases y condiciones completas
          </a>. Whirlpool es una marca registrada distribuida en Bolivia por Dismac.
        </p>
      </div>
    </footer>
  );
};
