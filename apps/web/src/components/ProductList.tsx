import React, { useState, useEffect } from 'react';
import { Product, Category, CategoryFilter, SortOption } from '@kemplang/types';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailModal';
import { getProducts, getCategories } from '../utils/api';

interface ProductListProps {
  onAddToCart: (product: Product) => void;
  searchQuery: string;
}

export const ProductList: React.FC<ProductListProps> = ({ onAddToCart, searchQuery }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products and categories on mount or filter/sort changes
  useEffect(() => {
    const fetchCatalog = async () => {
      setIsLoading(true);
      try {
        const catParam = activeCategory === 'all' ? undefined : activeCategory;
        const [prods, cats] = await Promise.all([
          getProducts(catParam, sortBy),
          getCategories()
        ]);
        setProductsList(prods);
        setCategoriesList(cats);
      } catch (err) {
        console.error('Failed to fetch catalog:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCatalog();
  }, [activeCategory, sortBy]);

  // Categories list starting with 'Semua' (all)
  const categoriesMap = [
    { key: 'all', label: 'Semua' },
    ...categoriesList.map(cat => ({ key: cat.id, label: cat.name }))
  ];

  // Search filter on the client side
  const filteredProducts = productsList.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });


  return (
    <section id="katalog" className="py-24 bg-surface-container-low dark:bg-surface-dim transition-colors duration-300 relative scroll-mt-16">
      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-12">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-on-primary-container mb-2">
              Produk Unggulan
            </h2>
            <p className="text-on-surface-variant dark:text-outline-variant font-body-md">
              Kelezatan terlaris yang selalu dicari pelanggan kami.
            </p>
          </div>

          {/* Sort selection drop down */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort-products" className="text-label-md text-on-surface-variant dark:text-outline-variant whitespace-nowrap">
              Urutkan:
            </label>
            <select
              id="sort-products"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/50 rounded-xl text-label-md text-on-surface dark:text-on-primary-container focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option value="default">Rekomendasi</option>
              <option value="price-low">Harga: Rendah ke Tinggi</option>
              <option value="price-high">Harga: Tinggi ke Rendah</option>
            </select>
          </div>
        </div>

        {/* Category Filters Tabs */}
        <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          {categoriesMap.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-6 py-2.5 rounded-full font-label-md transition-all active:scale-95 whitespace-nowrap ${
                activeCategory === cat.key
                  ? 'bg-primary text-on-primary dark:bg-primary-container dark:text-on-primary-container shadow-md'
                  : 'bg-surface-container-lowest text-on-surface-variant dark:bg-inverse-surface dark:text-outline-variant border border-outline-variant/30 hover:bg-surface-container/50 dark:hover:bg-outline/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="animate-spin h-10 w-10 text-primary mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-on-surface-variant dark:text-outline-variant text-body-md animate-pulse">Memuat produk...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onViewDetails={(prod) => setSelectedProduct(prod)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-container-lowest dark:bg-inverse-surface rounded-2xl signature-shadow border border-outline-variant/10">
            <span className="material-symbols-outlined text-[64px] text-outline-variant mb-4 select-none">
              search_off
            </span>
            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-primary-container mb-2">
              Produk Tidak Ditemukan
            </h3>
            <p className="text-on-surface-variant dark:text-outline-variant text-body-md max-w-md mx-auto">
              Maaf, kami tidak menemukan kemplang yang cocok dengan pencarian &quot;{searchQuery}&quot; di kategori ini.
            </p>
          </div>
        )}
      </div>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={onAddToCart}
        />
      )}
    </section>
  );
};
