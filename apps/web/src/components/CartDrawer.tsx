import React from 'react';
import { CartItem } from '@kemplang/types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  whatsappNumber?: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  whatsappNumber = '628123456789'
}) => {
  if (!isOpen) return null;

  // Calculate total price
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // WhatsApp checkout message generator
  const handleWhatsAppCheckout = () => {
    const phoneNumber = whatsappNumber;
    let message = 'Halo Kemplang Aleng, saya ingin memesan Kemplang:\n\n';

    cartItems.forEach((item) => {
      message += `- *${item.product.name}* (${item.product.weight}g) | ${item.quantity} pcs x Rp ${item.product.price.toLocaleString('id-ID')} = Rp ${(item.product.price * item.quantity).toLocaleString('id-ID')}\n`;
    });

    message += `\n*Subtotal:* Rp ${subtotal.toLocaleString('id-ID')}\n`;
    message += 'Mohon info ketersediaan stok dan Info Pembayaran nya. Terima kasih!';

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Dark Overlay Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-on-background/50 dark:bg-on-background/70 backdrop-blur-sm transition-opacity duration-300"
      ></div>

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface dark:bg-inverse-surface border-l border-outline-variant/30 flex flex-col shadow-2xl animate-slideOver">
          {/* Header */}
          <div className="px-6 py-6 bg-surface-container-low dark:bg-surface-dim border-b border-outline-variant/20 flex justify-between items-center">
            <h2 className="text-headline-md font-headline-md text-on-surface dark:text-on-primary-container font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[28px] text-primary dark:text-secondary-container">shopping_bag</span>
              Keranjang Belanja
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-on-surface-variant dark:text-outline-variant hover:bg-surface-variant/50 dark:hover:bg-outline/20 transition-colors"
              aria-label="Close cart"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 py-6 overflow-y-auto px-6 space-y-6 scrollbar-thin">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-4 py-2 border-b border-outline-variant/10"
                >
                  {/* Item Image */}
                  <img
                    src={item.product.image}
                    alt={item.product.altText}
                    className="w-20 h-20 object-cover rounded-xl border border-outline-variant/20 bg-surface-container"
                  />

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="font-label-md text-on-surface dark:text-on-primary-container text-base leading-tight">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-on-surface-variant dark:text-outline-variant mt-1">
                      {item.product.weight}g • Rp {item.product.price.toLocaleString('id-ID')}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center border border-outline-variant dark:border-outline/50 rounded-lg text-on-surface-variant dark:text-outline-variant hover:bg-surface-variant/50 active:scale-90 transition-all"
                        aria-label="Decrease quantity"
                      >
                        <span className="material-symbols-outlined text-base">remove</span>
                      </button>
                      <span className="font-label-md text-on-surface dark:text-on-primary-container text-sm w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center border border-outline-variant dark:border-outline/50 rounded-lg text-on-surface-variant dark:text-outline-variant hover:bg-surface-variant/50 active:scale-90 transition-all"
                        aria-label="Increase quantity"
                      >
                        <span className="material-symbols-outlined text-base">add</span>
                      </button>
                    </div>
                  </div>

                  {/* Actions (Delete) */}
                  <div className="flex flex-col items-end justify-between h-full py-1">
                    <span className="font-label-md text-primary dark:text-secondary-fixed-dim text-sm font-bold">
                      Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}
                    </span>
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="mt-3 text-error hover:text-red-700 p-1 rounded-full hover:bg-error-container/30 transition-colors"
                      aria-label="Remove item"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 flex flex-col items-center">
                <span className="material-symbols-outlined text-[80px] text-outline-variant/50 mb-4 select-none">
                  shopping_cart_off
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-primary-container mb-2">
                  Keranjang Kosong
                </h3>
                <p className="text-on-surface-variant dark:text-outline-variant text-body-md max-w-xs mb-8">
                  Anda belum menambahkan kemplang ke keranjang belanja Anda.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    const el = document.getElementById('katalog');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-primary text-on-primary dark:bg-primary-container dark:text-on-primary-container px-6 py-3 rounded-xl font-label-md hover:shadow-md transition-all active:scale-95"
                >
                  Belanja Sekarang
                </button>
              </div>
            )}
          </div>

          {/* Footer containing pricing and CTA checkout */}
          {cartItems.length > 0 && (
            <div className="px-6 py-6 bg-surface-container-low dark:bg-surface-dim border-t border-outline-variant/20 space-y-4">
              <div className="flex justify-between items-center text-on-surface dark:text-on-primary-container">
                <span className="text-body-lg font-medium">Subtotal</span>
                <span className="text-headline-md font-headline-md text-primary dark:text-secondary-fixed-dim font-bold">
                  Rp {subtotal.toLocaleString('id-ID')}
                </span>
              </div>
              <p className="text-[12px] text-on-surface-variant dark:text-outline-variant leading-normal">
                Harga ini belum termasuk biaya pengiriman dan akan dikonfirmasi lebih lanjut via chat. Pesanan Anda akan diteruskan untuk checkout via WhatsApp.
              </p>
              <button
                onClick={handleWhatsAppCheckout}
                className="w-full bg-[#25D366] text-white py-4 rounded-xl font-label-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {/* SVG WhatsApp Logo */}
                <svg fill="currentColor" height="20" viewBox="0 0 16 16" width="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93a7.898 7.898 0 0 0-2.327-5.607zM7.994 14.52a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"></path>
                </svg>
                Pesan via WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
