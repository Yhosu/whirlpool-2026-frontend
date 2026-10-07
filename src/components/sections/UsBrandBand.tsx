import React from 'react';
import marcaAmericanaImg from '../../assets/Marca americana.png';

export const UsBrandBand: React.FC = () => {
  return (
    <section className="bg-[#101010] py-16 md:py-20 text-center select-none text-white border-t border-b border-[#262626]">
      <div className="w-full max-w-[1060px] mx-auto px-5">
        {/* Marca Americana Official Badge */}
        <div className="flex justify-center mb-6">
          <img
            src={marcaAmericanaImg}
            alt="Marca Americana"
            className="w-28 md:w-32 h-auto drop-shadow-xl select-none"
          />
        </div>

        <h2 className="font-display text-[#FDC32B] text-[clamp(28px,6vw,44px)] font-black tracking-[0.03em] uppercase">
          UNA MARCA AMERICANA
        </h2>
        <p className="text-[#CFC9BA] max-w-[56ch] mx-auto mt-4 text-base sm:text-lg leading-relaxed font-normal">
          Whirlpool desarrolla sus propias tecnologías y las lleva a cada producto. Esto es lo que encontrás adentro de un Whirlpool.
        </p>
      </div>
    </section>
  );
};
