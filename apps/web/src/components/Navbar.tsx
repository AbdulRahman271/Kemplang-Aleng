import React, { useState, useEffect } from 'react';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  searchQuery,
  onSearchChange,
  isDarkMode,
  onToggleDarkMode
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full bg-surface/95 dark:bg-inverse-surface/95 border-b border-outline-variant/30 backdrop-blur-md shadow-sm z-50 transition-all duration-300 ${
        isScrolled ? 'py-2' : 'py-4'
      }`}
    >
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-1 max-w-container-max mx-auto">
        {/* Brand */}
        <a href="#" className="font-headline-md text-headline-md font-bold text-primary dark:text-secondary-container tracking-tight">
          Kemplang Aleng Palembang
        </a>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex gap-8 items-center">
          <a
            className="text-primary dark:text-secondary-container font-bold border-b-2 border-primary dark:border-secondary-container pb-1 font-label-md transition-colors"
            href="#"
          >
            Beranda
          </a>
          <a
            className="text-on-surface-variant dark:text-outline-variant font-medium hover:text-primary dark:hover:text-secondary-container transition-colors font-label-md"
            href="#katalog"
          >
            Katalog
          </a>
          <a
            className="text-on-surface-variant dark:text-outline-variant font-medium hover:text-primary dark:hover:text-secondary-container transition-colors font-label-md"
            href="#tentang"
          >
            Tentang
          </a>
          <a
            className="text-on-surface-variant dark:text-outline-variant font-medium hover:text-primary dark:hover:text-secondary-container transition-colors font-label-md"
            href="#kontak"
          >
            Kontak
          </a>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          {/* Search Input (Desktop) */}
          <div className="relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-outline-variant">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 bg-surface-container-low dark:bg-inverse-surface border border-outline-variant dark:border-outline/50 rounded-full text-label-md focus:outline-none focus:border-secondary dark:focus:border-secondary-container text-on-surface dark:text-on-primary-container transition-all w-40 focus:w-56 md:w-48 md:focus:w-64"
              placeholder="Cari kemplang..."
            />
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-full hover:bg-surface-variant/50 dark:hover:bg-outline/20 text-on-surface dark:text-on-primary-container active:scale-95 transition-transform"
            aria-label="Toggle theme"
          >
            <span className="material-symbols-outlined text-[24px]">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Shopping Cart Button */}
          <button
            onClick={onOpenCart}
            className="scale-105 active:scale-95 transition-transform text-primary dark:text-secondary-container relative p-1"
            aria-label="Open cart"
          >
            <span className="material-symbols-outlined text-[28px]">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary dark:bg-secondary-container text-on-secondary dark:text-on-secondary-fixed text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-on-surface dark:text-on-primary-container rounded-full hover:bg-surface-variant/50 dark:hover:bg-outline/20"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-surface dark:bg-inverse-surface border-t border-outline-variant/30 px-margin-mobile py-4 flex flex-col gap-4 shadow-lg animate-fadeIn">
          {/* Search Input (Mobile Only) */}
          <div className="relative w-full sm:hidden">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-outline-variant">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low dark:bg-surface-dim border border-outline-variant dark:border-outline/50 rounded-full text-label-md focus:outline-none focus:border-secondary text-on-surface dark:text-on-primary-container"
              placeholder="Cari kemplang..."
            />
          </div>

          {/* Navigation Links */}
          <a
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-primary dark:text-secondary-container font-bold font-label-md py-1 border-b border-outline-variant/10"
            href="#"
          >
            Beranda
          </a>
          <a
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-on-surface-variant dark:text-outline-variant font-medium font-label-md py-1 border-b border-outline-variant/10"
            href="#katalog"
          >
            Katalog
          </a>
          <a
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-on-surface-variant dark:text-outline-variant font-medium font-label-md py-1 border-b border-outline-variant/10"
            href="#tentang"
          >
            Tentang
          </a>
          <a
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-on-surface-variant dark:text-outline-variant font-medium font-label-md py-1"
            href="#kontak"
          >
            Kontak
          </a>
        </div>
      )}
    </nav>
  );
};
