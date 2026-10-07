import React from 'react';
import { ShoppingBag, FileCheck2, RotateCw, Gift } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    icon: ShoppingBag,
    title: 'Compra cualquier producto Whirlpool',
    desc: 'En tiendas Dismac, en dismac.com.bo o en un punto de venta autorizado en mercados, entre el 12 de octubre y el 15 de noviembre de 2026.',
  },
  {
    step: '02',
    icon: FileCheck2,
    title: 'Registra tu compra',
    desc: 'Si compras en Dismac, ingresa el código de control de tu factura aquí mismo. Si compras en un punto de mercado, el promotor te registra y te envía el enlace.',
  },
  {
    step: '03',
    icon: RotateCw,
    title: 'Gira la lavadora digital',
    desc: 'Un giro por cada producto comprado. Todas las cápsulas tienen premio.',
  },
  {
    step: '04',
    icon: Gift,
    title: 'Recibe tu premio',
    desc: 'Vale de compra Dismac o premio en efectivo, según dónde compraste. Lleva siempre tu cédula de identidad y tu factura o nota de venta.',
  },
];

export const HowToParticipate: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-white text-[#2A2418] select-none border-t border-b border-[#E6DDC6]" id="como-participar">
      <div className="w-full max-w-[1140px] mx-auto px-5 text-left">
        <div className="max-w-xl mb-12">
          <h2 className="font-display text-[clamp(28px,5vw,42px)] tracking-tight text-[#101010] font-bold">
            ¿Cómo participar?
          </h2>
          <p className="text-[#6F6756] text-sm sm:text-base mt-2">
            Participar es rápido y sencillo. Sigue estos 4 sencillos pasos para ganar al instante.
          </p>
        </div>

        {/* 4-Card Step Grid with Fluid, Non-Rigid Aesthetics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="group relative bg-[#FFFBF0] hover:bg-[#FFFDF7] border-2 border-[#101010] hover:border-[#FDC32B] shadow-[0_10px_28px_rgba(42,36,24,0.06)] hover:shadow-[0_18px_38px_rgba(253,195,43,0.18)] rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-mono text-sm font-black text-[#101010] bg-[#FDC32B] px-3.5 py-1 rounded-full border border-[#101010] shadow-sm tracking-wider">
                      {item.step}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#E6DDC6] flex items-center justify-center text-[#101010] group-hover:bg-[#FDC32B] group-hover:scale-105 transition-all shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="font-display text-lg font-bold text-[#101010] leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-[#6F6756] text-xs sm:text-[13.5px] leading-relaxed mt-2.5 font-normal">
                    {item.desc}
                  </p>
                </div>

                <div className="w-8 h-1 bg-[#FDC32B] group-hover:w-full rounded-full mt-6 transition-all duration-300" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
