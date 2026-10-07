import React, { useState } from 'react';
import {
  ChevronDown,
  Trophy,
  ShoppingBag,
  RotateCw,
  Receipt,
  Store,
  Gift,
  Clock,
  CreditCard,
  ShieldAlert,
} from 'lucide-react';

interface FaqItem {
  id: number;
  question: string;
  icon: React.ComponentType<{ className?: string }>;
  answer: React.ReactNode;
}

const PRIZES = ['Bs. 100', 'Bs. 250', 'Bs. 500', 'Bs. 1.000', 'Bs. 2.000', 'Bs. 3.000'];

export const Faq: React.FC = () => {
  // Allow toggling accordions, first one open by default
  const [openItems, setOpenItems] = useState<number[]>([1]);

  const toggleItem = (id: number) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const FAQ_DATA: FaqItem[] = [
    {
      id: 1,
      question: '¿Qué puedo ganar?',
      icon: Trophy,
      answer: (
        <div className="space-y-3">
          <p className="text-[#6F6756] text-[15px] sm:text-[15.5px] leading-relaxed">
            Premios de Bs. 100, Bs. 250, Bs. 500, Bs. 1.000, Bs. 2.000 y Bs. 3.000. Todas las cápsulas tienen premio y la modalidad de premiación es por azar.
          </p>
          <ul className="flex flex-wrap gap-2 sm:gap-2.5 list-none my-3.5 p-0">
            {PRIZES.map((amt) => (
              <li
                key={amt}
                className="bg-[#FDC32B] hover:bg-[#FFD95E] border-2 border-[#101010] rounded-full py-1.5 px-4 shadow-sm hover:scale-105 transition-transform"
              >
                <b className="font-display text-[15px] text-[#101010] tracking-[0.02em]">
                  {amt}
                </b>
              </li>
            ))}
          </ul>
          <p className="text-[#6F6756] text-[15px] sm:text-[15.5px] leading-relaxed">
            Si compraste en Dismac o en dismac.com.bo, lo recibes como vale de compra con 90 días de vigencia. Si compraste en otro distribuidor, lo recibes en efectivo por transferencia a una cuenta a tu nombre.
          </p>
        </div>
      ),
    },
    {
      id: 2,
      question: '¿Qué productos participan?',
      icon: ShoppingBag,
      answer: (
        <p className="text-[#6F6756] text-[15px] sm:text-[15.5px] leading-relaxed">
          Cualquier producto Whirlpool comprado entre el 12 de octubre y el 15 de noviembre de 2026 en los puntos de venta participantes.
        </p>
      ),
    },
    {
      id: 3,
      question: '¿Cuántas veces puedo participar?',
      icon: RotateCw,
      answer: (
        <p className="text-[#6F6756] text-[15px] sm:text-[15.5px] leading-relaxed">
          Una vez por cada producto Whirlpool que compres. Si compras dos productos, participas dos veces.
        </p>
      ),
    },
    {
      id: 4,
      question: '¿Dónde encuentro el código de control de mi factura?',
      icon: Receipt,
      answer: (
        <p className="text-[#6F6756] text-[15px] sm:text-[15.5px] leading-relaxed">
          Está al pie de tu factura, junto al número de autorización. Si compraste en dismac.com.bo, figura en la factura que recibiste por correo.
        </p>
      ),
    },
    {
      id: 5,
      question: 'Compré en un punto de mercado. ¿Cómo participo?',
      icon: Store,
      answer: (
        <p className="text-[#6F6756] text-[15px] sm:text-[15.5px] leading-relaxed">
          Acércate al promotor de la marca en el punto con tu nota de venta y tu cédula de identidad. Él registra tu compra y, una vez verificada, te envía el enlace para hacer girar la lavadora digital.
        </p>
      ),
    },
    {
      id: 6,
      question: '¿Cómo recibo mi premio?',
      icon: Gift,
      answer: (
        <p className="text-[#6F6756] text-[15px] sm:text-[15.5px] leading-relaxed">
          Si compraste en Dismac o en dismac.com.bo, recibes un vale de compra con entrega inmediata. Si compraste en un punto de mercado, recibes el premio en efectivo por transferencia a una cuenta a tu nombre, una vez verificados tus datos.
        </p>
      ),
    },
    {
      id: 7,
      question: '¿Hasta cuándo puedo usar mi vale?',
      icon: Clock,
      answer: (
        <p className="text-[#6F6756] text-[15px] sm:text-[15.5px] leading-relaxed">
          Los vales de compra Dismac tienen una validez de 90 días desde su emisión.
        </p>
      ),
    },
    {
      id: 8,
      question: '¿Qué necesito llevar?',
      icon: CreditCard,
      answer: (
        <p className="text-[#6F6756] text-[15px] sm:text-[15.5px] leading-relaxed">
          Tu cédula de identidad y tu factura o nota de venta. La factura debe estar a tu nombre.
        </p>
      ),
    },
    {
      id: 9,
      question: '¿Quiénes están excluidos de participar?',
      icon: ShieldAlert,
      answer: (
        <p className="text-[#6F6756] text-[15px] sm:text-[15.5px] leading-relaxed">
          No participan el personal de Dismac, los vendedores y distribuidores de la marca, ni las personas jurídicas. Tampoco participan las ventas corporativas. Solo participan personas naturales con la factura consignada a su nombre.
        </p>
      ),
    },
  ];

  return (
    <section className="py-[60px] md:py-[85px] bg-white text-[#2A2418] select-none" id="faq">
      <div className="w-full max-w-[1060px] mx-auto px-5 text-left">
        <h2 className="font-display text-[clamp(26px,6.2vw,40px)] tracking-[0.01em] text-[#2A2418] mb-8">
          Preguntas frecuentes
        </h2>

        {/* Fluid, Organic Accordion Panels */}
        <div className="space-y-3.5">
          {FAQ_DATA.map((item) => {
            const isOpen = openItems.includes(item.id);
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                className={`transition-all duration-300 rounded-2xl border ${isOpen
                  ? 'bg-[#FFFDF7] border-[#FDC32B] shadow-[0_6px_22px_rgba(253,195,43,0.12)]'
                  : 'bg-white hover:bg-[#FFFCF6] border-[#E6DDC6] hover:border-[#FDC32B]/60'
                  } overflow-hidden`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3.5 sm:gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-none ${isOpen
                        ? 'bg-[#FDC32B] text-[#101010] shadow-sm'
                        : 'bg-[#FFFBF0] text-[#101010] border border-[#E6DDC6]'
                        }`}
                    >
                      <Icon className="w-5 h-5 flex-none" />
                    </div>

                    <span className="font-bold text-[16.5px] text-[#2A2418] group-hover:text-[#101010]">
                      {item.question}
                    </span>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 flex-none ${isOpen
                      ? 'bg-[#FDC32B] text-[#101010] rotate-180 shadow-sm'
                      : 'bg-[#FFFBF0] text-[#6F6756] rotate-0'
                      }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-4 border-t border-[#E6DDC6]/60 text-left">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
