import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import basesPdf from '../../assets/bases.pdf';

const CITIES_LIST = [
  { city: 'Santa Cruz', desc: 'Tiendas Dismac y punto de mercado en La Ramada / Isabel La Católica.' },
  { city: 'La Paz', desc: 'Tiendas Dismac y punto de mercado en Eloy Salmón.' },
  { city: 'El Alto', desc: 'Tiendas Dismac y punto de mercado en Villa Dolores.' },
  { city: 'Cochabamba', desc: 'Tiendas Dismac y puntos de mercado en Molino El Gallo y Quillacollo.' },
  { city: 'Sucre', desc: 'Tienda Dismac y punto de mercado en el Mercado Campesino.' },
  { city: 'Tarija', desc: 'Tienda Dismac y punto de mercado en el Mercado La Torre.' },
];

export const WhereToParticipate: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-[#FFFBF0] text-[#2A2418] select-none border-b border-[#E6DDC6]" id="donde-participar">
      <div className="w-full max-w-[1140px] mx-auto px-5 text-left">
        <div className="max-w-xl mb-12">
          <h2 className="font-display text-[clamp(28px,5.5vw,42px)] font-bold tracking-tight text-[#101010]">
            ¿Dónde participas?
          </h2>
          <p className="mt-3 text-[#6F6756] text-base leading-relaxed">
            La promoción es válida en Santa Cruz, La Paz, El Alto, Cochabamba, Sucre y Tarija.
          </p>
        </div>

        {/* Cities Grid with Refined Fluid Aesthetics */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {CITIES_LIST.map((item, i) => (
            <div
              key={i}
              className="bg-white hover:bg-[#FFFCF7] border-2 border-[#101010] hover:border-[#FDC32B] shadow-[0_8px_24px_rgba(42,36,24,0.06)] hover:shadow-[0_16px_36px_rgba(253,195,43,0.18)] rounded-3xl p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1.5"
            >
              <div className="flex items-center gap-3.5 mb-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#FFFBF0] border border-[#E6DDC6] flex items-center justify-center text-[#101010] shadow-sm">
                  <MapPin className="w-5 h-5 text-[#FDC32B]" />
                </div>
                <h3 className="font-display text-lg font-bold text-[#101010] tracking-wide">
                  {item.city}
                </h3>
              </div>
              <p className="text-[#6F6756] text-sm leading-relaxed pl-1 font-normal">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-[#E6DDC6] flex items-center gap-2.5 text-[#6F6756] text-sm">
          <Navigation className="w-4 h-4 text-[#FDC32B] flex-none" />
          <span>
            El detalle completo de direcciones y horarios está en las{' '}
            <a
              href={basesPdf}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#101010] font-bold underline hover:text-[#D97706] transition-colors"
            >
              bases y condiciones
            </a>.
          </span>
        </div>
      </div>
    </section>
  );
};
