import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-container-highest dark:bg-inverse-surface rounded-t-3xl overflow-hidden mt-12 transition-colors duration-300 border-t border-outline-variant/20 scroll-mt-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-mobile md:px-margin-desktop py-16 max-w-container-max mx-auto">
        {/* Brand Column */}
        <div className="col-span-1 md:col-span-2">
          <div className="font-headline-md text-headline-md font-bold text-on-surface dark:text-on-primary-container mb-4">
            Kemplang Aleng Palembang
          </div>
          <p className="text-on-surface-variant dark:text-outline-variant font-body-md max-w-sm mb-6 leading-relaxed">
            Membawa cita rasa otentik Bumi Sriwijaya ke meja makan Anda. Kami berkomitmen menjaga kualitas camilan tradisional Indonesia.
          </p>
          <div className="flex gap-4">
            <a
              className="w-10 h-10 rounded-full bg-surface-container dark:bg-on-background/10 text-on-surface-variant dark:text-outline-variant flex items-center justify-center hover:bg-primary dark:hover:bg-primary-container hover:text-on-primary dark:hover:text-on-primary-container transition-all"
              href="#"
              aria-label="Facebook"
            >
              <span className="material-symbols-outlined text-lg">face_nod</span>
            </a>
            <a
              className="w-10 h-10 rounded-full bg-surface-container dark:bg-on-background/10 text-on-surface-variant dark:text-outline-variant flex items-center justify-center hover:bg-primary dark:hover:bg-primary-container hover:text-on-primary dark:hover:text-on-primary-container transition-all"
              href="#"
              aria-label="Share"
            >
              <span className="material-symbols-outlined text-lg">share</span>
            </a>
          </div>
        </div>

        {/* Navigation Column */}
        <div>
          <h4 className="font-label-md text-primary dark:text-secondary-fixed-dim mb-6 uppercase tracking-wider text-xs">
            Menu Navigasi
          </h4>
          <ul className="space-y-4">
            <li>
              <a
                className="text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-secondary-container transition-colors hover:translate-x-1 inline-block transform duration-200"
                href="#"
              >
                Beranda
              </a>
            </li>
            <li>
              <a
                className="text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-secondary-container transition-colors hover:translate-x-1 inline-block transform duration-200"
                href="#katalog"
              >
                Katalog
              </a>
            </li>
            <li>
              <a
                className="text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-secondary-container transition-colors hover:translate-x-1 inline-block transform duration-200"
                href="#tentang"
              >
                Tentang
              </a>
            </li>
            <li>
              <a
                className="text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-secondary-container transition-colors hover:translate-x-1 inline-block transform duration-200"
                href="#kontak"
              >
                Kontak
              </a>
            </li>
          </ul>
        </div>

        {/* Help Column */}
        <div>
          <h4 className="font-label-md text-primary dark:text-secondary-fixed-dim mb-6 uppercase tracking-wider text-xs">
            Bantuan
          </h4>
          <ul className="space-y-4">
            <li>
              <a
                className="text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-secondary-container transition-colors hover:translate-x-1 inline-block transform duration-200"
                href="#"
              >
                Kebijakan Privasi
              </a>
            </li>
            <li>
              <a
                className="text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-secondary-container transition-colors hover:translate-x-1 inline-block transform duration-200"
                href="#"
              >
                Syarat & Ketentuan
              </a>
            </li>
            <li>
              <a
                className="text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-secondary-container transition-colors hover:translate-x-1 inline-block transform duration-200"
                href="#"
              >
                Lacak Pesanan
              </a>
            </li>
            <li>
              <a
                className="text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-secondary-container transition-colors hover:translate-x-1 inline-block transform duration-200"
                href="#"
              >
                FAQ
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Footer */}
      <div className="border-t border-outline-variant/30 py-6 text-center bg-surface-container-highest dark:bg-inverse-surface transition-colors duration-300">
        <p className="font-label-sm text-label-sm text-on-surface-variant dark:text-outline-variant">
          © {new Date().getFullYear()} Kemplang Aleng Palembang.
        </p>
      </div>
    </footer>
  );
};
