import React from 'react';
import { PartyPopper, MapPin } from 'lucide-react';

export const EventPartySection: React.FC = () => {
  const googleMapsUrl =
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent('Club de Pesca del Cerro, Grecia 3099, Cerro, Montevideo, Uruguay');

  return (
    <section id="evento" className="py-16 sm:py-20 px-4 bg-[#061D60] text-white relative overflow-hidden text-center">
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center relative z-10">
        {/* Animated celebration icon (rounded monolínea) */}
        <div className="inline-flex items-center justify-center text-white mb-4 select-none animate-crown">
          <PartyPopper className="w-9 h-9 sm:w-10 sm:h-10" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </div>

        {/* First text: FIESTA */}
        <h3
          className="text-2xl sm:text-3xl font-normal text-white tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-4"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
        >
          FIESTA
        </h3>

        {/* Details paragraph as specified in the image */}
        <div
          className="text-white/90 text-sm sm:text-base md:text-lg leading-relaxed space-y-1 font-light max-w-lg mx-auto px-2 break-words"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          <p className="font-normal text-white">Viernes 20 de noviembre</p>
          <p className="text-white/80">21:30 hs.</p>
          <p className="font-normal text-white pt-2">Club de Pesca del Cerro</p>
          <p className="text-white/80">Grecia 3099</p>
          <p className="text-white/70 text-xs sm:text-base pt-3 max-w-md mx-auto leading-relaxed">
            Clickeá en el boton de abajo y encontrá las indicaciones para llegar
          </p>
        </div>

        {/* Action Button: COMO LLEGAR */}
        <div className="mt-8 w-full flex items-center justify-center px-2">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full max-w-[260px] sm:max-w-none sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-white hover:bg-[#F3F5F9] text-[#061D60] hover:text-[#0833A2] font-semibold text-xs sm:text-sm tracking-wider uppercase rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer text-center"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            <MapPin className="w-4 h-4 text-[#0833A2] shrink-0" />
            <span>COMO LLEGAR</span>
          </a>
        </div>
      </div>
    </section>
  );
};
