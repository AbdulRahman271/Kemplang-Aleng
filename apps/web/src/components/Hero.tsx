import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-background dark:bg-on-background transition-colors duration-300">
      {/* Background Image and Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          className="w-full h-full object-cover select-none"
          alt="Authentic Palembang kemplang crackers arranged on a traditional bamboo tray in warm golden light"
          src="/hero.png"
        />
        {/* Responsive gradient overlay supporting dark mode */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent dark:from-on-background dark:via-on-background/50 dark:to-transparent transition-all duration-300"></div>
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 w-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="max-w-2xl text-left">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-fixed dark:bg-primary-container text-on-primary-fixed-variant dark:text-on-primary-container font-label-md mb-6 shadow-sm">
            Pilihan Kemplang Terbaik
          </span>
          <h1 className="font-headline-xl text-[40px] md:text-[64px] md:leading-[72px] text-on-surface dark:text-on-primary-container mb-6 leading-tight font-bold tracking-tight">
            Kemplang Asli <span className="text-primary dark:text-secondary-fixed-dim">Palembang</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-outline-variant mb-10 max-w-lg">
            Kelezatan Kemplang dalam Setiap Gigitan. Dibuat dari ikan Tenggiri,Putak,Gabus segar dengan resep yang berdiri sejak 2004 dan tentu sudah Halal.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#katalog"
              className="bg-primary text-on-primary dark:bg-primary-container dark:text-on-primary-container px-8 py-4 rounded-xl font-label-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2"
            >
              Lihat Katalog <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </a>
            <a
              href="#tentang"
              className="border-2 border-primary text-primary hover:bg-primary/5 dark:border-secondary-fixed-dim dark:text-secondary-fixed-dim dark:hover:bg-secondary-fixed-dim/5 px-8 py-4 rounded-xl font-label-md hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95"
            >
              Tentang Kami
            </a>
          </div>
        </div>
      </div>

      {/* Decorative Batik Element */}
      <div className="absolute right-0 bottom-0 w-1/3 h-1/2 batik-overlay pointer-events-none hidden lg:block"></div>
    </section>
  );
};
