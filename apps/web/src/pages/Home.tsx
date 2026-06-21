import React, { useState, useEffect } from 'react';
import { CartItem, Product } from '@kemplang/types';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { ProductList } from '../components/ProductList';
import { WhyUs } from '../components/WhyUs';
import { Testimonials } from '../components/Testimonials';
import { Footer } from '../components/Footer';
import { Contact } from '../components/Contact';
import { CartDrawer } from '../components/CartDrawer';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { getSettings } from '../utils/api';

export const Home: React.FC = () => {
  // Cart state initialized from localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('kemplang_cart');
    return saved ? JSON.parse(saved) : [
      {
        product: {
          id: 'prod-1',
          name: 'Kemplang Panggang Super',
          description: 'Kemplang panggang premium dengan aroma bakar khas arang tradisional dan rasa ikan belida yang gurih melimpah.',
          price: 45000,
          weight: 250,
          category: 'roasted',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEfn9B5DrPIDJqfxBbbGiDSVRQ7PI5xMVrzn4o4b32OKNTkRlpcxxgwkMK7PCDXe-HKVqoKA3ScwRekehCW69YadaYewA1pQKhGKmWDHXtzbdfgcsklI7-qjJiCu3eMntWN6UYSPbeqAB4Ibt3AD-015G5oByW-rdRQn78RpsqCBVeQK1leerecGbuJYQmC9DU70fcIQoqWSLdkAykPzwOEzsc3jqiRzJdx5KYpq4fPNno0XzxAtMiPKTkQkwK5GyOBIiTP-k_9TxA',
          badge: 'Terlaris',
          altText: 'Kemplang Panggang Super'
        },
        quantity: 2
      }
    ];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [whatsappNumber, setWhatsappNumber] = useState('628123456789');

  // Load WhatsApp settings
  useEffect(() => {
    const fetchWhatsAppSetting = async () => {
      try {
        const settings = await getSettings();
        if (settings.contact_whatsapp) {
          let cleaned = settings.contact_whatsapp.replace(/[^0-9]/g, '');
          if (cleaned.startsWith('0')) {
            cleaned = '62' + cleaned.slice(1);
          }
          if (cleaned) {
            setWhatsappNumber(cleaned);
          }
        }
      } catch (err) {
        console.error('Failed to load WhatsApp number setting:', err);
      }
    };
    fetchWhatsAppSetting();
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('kemplang_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Synchronize theme with class on documentElement
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Cart actions
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="bg-background text-on-surface dark:bg-on-background dark:text-on-primary-container transition-colors duration-300 flex flex-col min-h-screen">
      {/* Navigation */}
      <Navbar
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Sections */}
      <main className="flex-grow">
        <Hero />
        <ProductList onAddToCart={handleAddToCart} searchQuery={searchQuery} />
        <WhyUs />
        <Testimonials />
        <Contact />
      </main>

      {/* Footer */}
      <Footer />

      {/* Shopping Cart Drawer Slide-over */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        whatsappNumber={whatsappNumber}
      />

      {/* Floating WhatsApp Button */}
      <WhatsAppButton phoneNumber={whatsappNumber} />
    </div>
  );
};
export default Home;
