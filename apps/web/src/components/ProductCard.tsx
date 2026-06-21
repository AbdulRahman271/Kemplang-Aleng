import React from 'react';
import { Product } from '@kemplang/types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onViewDetails }) => {
  // Determine badge styling based on badge text
  const getBadgeStyle = (badge: string) => {
    if (badge.toLowerCase() === 'terlaris') {
      return 'bg-secondary text-on-secondary';
    }
    if (badge.toLowerCase() === 'baru') {
      return 'bg-tertiary text-on-tertiary';
    }
    return 'bg-primary text-on-primary';
  };

  return (
    <div className="group bg-surface-container-lowest dark:bg-inverse-surface rounded-2xl overflow-hidden signature-shadow border border-outline-variant/10 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
      {/* Product Image and Badge */}
      <div 
        onClick={() => onViewDetails(product)}
        className="relative h-64 overflow-hidden bg-surface-container cursor-pointer"
      >
        <img
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 select-none"
          alt={product.altText}
          src={product.image}
          loading="lazy"
        />
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white gap-2">
          <span className="material-symbols-outlined text-[32px] translate-y-2 group-hover:translate-y-0 transition-transform duration-300">visibility</span>
          <span className="text-label-sm font-medium tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">Lihat Detail</span>
        </div>
        {product.badge && (
          <span className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-label-sm font-semibold tracking-wide shadow-sm ${getBadgeStyle(product.badge)}`}>
            {product.badge}
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-primary-container mb-1 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-on-surface-variant dark:text-outline-variant text-label-md mb-3 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">scale</span>
            {product.weight} gram
          </p>
          <p className="text-on-surface-variant dark:text-outline-variant text-sm line-clamp-2 mb-4">
            {product.description}
          </p>
        </div>

        <div className="flex justify-between items-center mt-auto pt-2 border-t border-outline-variant/10">
          <span className="text-primary dark:text-secondary-fixed-dim font-bold text-headline-md">
            Rp {product.price.toLocaleString('id-ID')}
          </span>
          <button
            onClick={() => onAddToCart(product)}
            className="bg-primary-fixed-dim dark:bg-primary-container text-on-primary-fixed-variant dark:text-on-primary-container p-2 rounded-lg hover:bg-primary-container hover:text-on-primary-container dark:hover:bg-secondary-fixed-dim dark:hover:text-on-secondary-fixed active:scale-95 transition-all duration-200"
            aria-label={`Add ${product.name} to cart`}
          >
            <span className="material-symbols-outlined text-[24px]">add_shopping_cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
