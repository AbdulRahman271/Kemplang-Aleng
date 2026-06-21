import React, { useEffect } from 'react';
import { Product } from '@kemplang/types';

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  // Listen for Escape key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Lock background scrolling
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Helper for category badge name translation
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'roasted':
        return 'Panggang';
      case 'fried':
        return 'Goreng';
      case 'curly':
        return 'Keriting';
      case 'spicy':
        return 'Pedas';
      default:
        return category;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-surface-container-lowest dark:bg-inverse-surface rounded-3xl shadow-2xl z-10 flex flex-col md:flex-row transform scale-100 transition-all duration-300 border border-outline-variant/10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] md:max-h-[500px] md:h-[480px] overflow-y-auto md:overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-surface-container/80 dark:bg-outline/20 text-on-surface-variant dark:text-outline-variant hover:bg-primary-container hover:text-on-primary-container dark:hover:bg-primary-container dark:hover:text-on-primary-container active:scale-95 transition-all duration-200"
          aria-label="Tutup detail produk"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Product Image Column */}
        <div className="relative w-full md:w-1/2 h-64 md:h-full bg-surface-container shrink-0">
          <img
            src={product.image}
            alt={product.altText}
            className="absolute inset-0 w-full h-full object-cover select-none"
          />
          {product.badge && (
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-label-sm font-semibold tracking-wide shadow-sm bg-secondary text-on-secondary">
              {product.badge}
            </span>
          )}
        </div>

        {/* Product Information Column */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between md:h-full md:overflow-y-auto">
          <div>
            {/* Category */}
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary-fixed-dim/30 dark:bg-primary-container/40 text-primary dark:text-secondary-fixed-dim mb-3">
              Kemplang {getCategoryLabel(product.category)}
            </span>

            {/* Title */}
            <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-on-primary-container mb-2">
              {product.name}
            </h2>

            {/* Weight and status info */}
            <div className="flex items-center gap-4 text-on-surface-variant dark:text-outline-variant text-label-md mb-4">
              <p className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">scale</span>
                {product.weight} gram
              </p>
              <span className="text-outline-variant">•</span>
              <p className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">task_alt</span>
                Stok Tersedia
              </p>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-outline-variant/10 my-4" />

            {/* Description */}
            <p className="text-on-surface-variant dark:text-outline-variant text-body-md leading-relaxed mb-6">
              {product.description}
            </p>
          </div>

          <div>
            {/* Divider */}
            <div className="w-full h-px bg-outline-variant/10 my-4" />

            {/* Price and Add to Cart Section */}
            <div className="flex items-center justify-between gap-4 mt-auto">
              <div className="flex flex-col">
                <span className="text-xs text-on-surface-variant dark:text-outline-variant">Harga</span>
                <span className="text-primary dark:text-secondary-fixed-dim font-bold text-headline-md">
                  Rp {product.price.toLocaleString('id-ID')}
                </span>
              </div>

              <button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="flex items-center gap-2 bg-primary text-on-primary dark:bg-primary-container dark:text-on-primary-container px-6 py-3 rounded-xl hover:bg-primary-container hover:text-on-primary-container dark:hover:bg-secondary-fixed-dim dark:hover:text-on-secondary-fixed active:scale-95 transition-all duration-200 font-label-md shadow-md"
              >
                <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                Beli
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
