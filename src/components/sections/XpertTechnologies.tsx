import React from 'react';
import { Waves, Refrigerator } from 'lucide-react';

interface XpertItem {
  badgeTitle: string;
  badgeName: string;
  title: string;
  desc: string;
  fine?: string;
}

const LAVADO_ITEMS: XpertItem[] = [
  {
    badgeTitle: 'XPERT',
    badgeName: 'SYSTEM',
    title: 'El mejor sistema de lavado',
    desc: 'Remueve las manchas más difíciles mejor que otros.',
    fine: '** Lavadoras con agitador',
  },
  {
    badgeTitle: 'XPERT',
    badgeName: 'SYSTEM',
    title: 'El sistema de lavado más eficiente',
    desc: '3X mayor cuidado de tus prendas y +70% de ahorro de agua en cada carga.',
    fine: '** Lavadoras con agitador tipo Impeller',
  },
  {
    badgeTitle: 'XPERT',
    badgeName: 'INVERTER',
    title: 'La mejor combinación de 3 tecnologías que brindan mayor ahorro energético',
    desc: 'Motor direct drive + menos vibración + menos ruido.',
  },
  {
    badgeTitle: 'XPERT',
    badgeName: 'DUAL WASH',
    title: 'Únicos en la industria con canasta adicional extraíble',
    desc: 'Lava al mismo tiempo blancos y color sin mezclar.',
  },
  {
    badgeTitle: 'XPERT',
    badgeName: 'ECO',
    title: 'Ahorro superior',
    desc: 'Ahorra hasta 45% de agua y 30% de energía en cada carga.',
  },
  {
    badgeTitle: 'XPERT',
    badgeName: 'WASH & DRY',
    title: 'Lava y seca en un mismo lugar',
    desc: 'El balance perfecto entre limpieza y cuidado de la ropa.',
  },
  {
    badgeTitle: 'XPERT',
    badgeName: 'DUAL AGITATOR',
    title: 'Únicos en la industria con agitador 2 en 1',
    desc: 'Dale a tu ropa la mayor limpieza y cuidado con el agitador 2 en 1 removible, que se ajusta a las necesidades de cada carga.',
  },
];

const REFRIGERACION_ITEMS: XpertItem[] = [
  {
    badgeTitle: 'XPERT',
    badgeName: 'ENERGY SAVER',
    title: '#1 en ahorro',
    desc: 'Compresor de alta eficiencia + aislamiento superior + distribución estratégica del aire.',
  },
  {
    badgeTitle: 'XPERT',
    badgeName: 'INVERTER',
    title: 'Tecnologías para un desempeño superior',
    desc: 'Consumo eficiente de energía + espacio convertible + mayor preservación.',
  },
  {
    badgeTitle: 'XPERT',
    badgeName: 'FRESH',
    title: 'Preservación',
    desc: 'Alimentos frescos hasta por 15 días, con mayor preservación de los alimentos.',
  },
  {
    badgeTitle: 'XPERT',
    badgeName: 'SPACES',
    title: 'Mejor manejo de espacios',
    desc: 'Compartimentos especiales para cada tipo de alimentos.',
  },
  {
    badgeTitle: 'XPERT',
    badgeName: 'FLEX',
    title: 'Espacios flexibles que se adaptan a tus necesidades',
    desc: 'Mayor espacio para almacenar frutas y verduras. Puertas reversibles.',
  },
  {
    badgeTitle: 'XPERT',
    badgeName: 'PURE',
    title: 'Ambiente libre de bacterias',
    desc: 'Elimina hasta el 99.9% de las bacterias.',
    fine: '* Según pruebas de laboratorio del fabricante',
  },
];

const XpertCard: React.FC<{ item: XpertItem }> = ({ item }) => (
  <div className="bg-[#151515] hover:bg-[#1a1a1a] rounded-2xl p-5 sm:p-6 border border-[#262626] hover:border-[#FDC32B]/50 transition-all duration-200 flex flex-col justify-between text-left shadow-sm hover:shadow-[0_8px_22px_rgba(0,0,0,0.35)] hover:-translate-y-0.5">
    <div>
      {/* Precision Dual-Tone Xpert Badge */}
      <div className="mb-3.5 inline-flex items-center rounded-md border border-[#FDC32B] overflow-hidden select-none shadow-sm">
        <span className="px-2.5 py-0.5 bg-[#101010] text-[#FDC32B] font-mono text-[11px] font-bold tracking-wider">
          {item.badgeTitle}
        </span>
        <span className="px-2.5 py-0.5 bg-[#FDC32B] text-[#101010] font-sans text-[11px] font-bold tracking-wide">
          {item.badgeName}
        </span>
      </div>

      <h4 className="text-[#FDC32B] text-[15.5px] font-semibold leading-snug">
        {item.title}
      </h4>
      <p className="text-[#CFC9BA] text-[13.5px] mt-2 leading-relaxed font-normal">
        {item.desc}
      </p>
    </div>

    {item.fine && (
      <p className="text-[#7E786B] text-[11.5px] mt-3.5 pt-2 border-t border-[#222222] italic font-normal">
        {item.fine}
      </p>
    )}
  </div>
);

export const XpertTechnologies: React.FC = () => {
  return (
    <section className="bg-[#101010] text-white pt-16 pb-20 select-none border-t border-b border-[#262626]" id="tecnologias">
      <div className="w-full max-w-[1060px] mx-auto px-5 text-left">
        <h2 className="font-display text-[clamp(26px,6.2vw,40px)] text-white max-w-[20ch] tracking-[0.01em]">
          Tecnología que se disfruta
        </h2>
        <p className="mt-[13px] text-[#B5AF9F] max-w-[56ch] text-[15.5px]">
          La línea XPERT reúne las tecnologías propias de Whirlpool. Cada modelo incorpora las que corresponden a su categoría.
        </p>

        {/* LAVADO GROUP */}
        <div className="mt-12">
          <div className="flex items-center gap-3.5 pb-3 border-b-2 border-[#FDC32B] mb-6">
            <Waves className="w-7 h-7 text-[#FDC32B] flex-none" />
            <h3 className="font-display text-[#FDC32B] text-[clamp(20px,4.8vw,26px)] tracking-[0.16em]">
              LAVADO
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LAVADO_ITEMS.map((item, idx) => (
              <XpertCard key={idx} item={item} />
            ))}
          </div>
        </div>

        {/* REFRIGERACIÓN GROUP */}
        <div className="mt-14">
          <div className="flex items-center gap-3.5 pb-3 border-b-2 border-[#FDC32B] mb-6">
            <Refrigerator className="w-7 h-7 text-[#FDC32B] flex-none" />
            <h3 className="font-display text-[#FDC32B] text-[clamp(20px,4.8vw,26px)] tracking-[0.16em]">
              REFRIGERACIÓN
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REFRIGERACION_ITEMS.map((item, idx) => (
              <XpertCard key={idx} item={item} />
            ))}
          </div>
        </div>

        <p className="text-[#7E786B] text-[12.5px] mt-10 max-w-[62ch]">
          Las tecnologías disponibles varían según el modelo. Consulta la ficha técnica del producto que te interesa en dismac.com.bo o con el vendedor de tienda.
        </p>
      </div>
    </section>
  );
};
