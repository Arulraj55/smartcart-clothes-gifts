import React, { useState, useMemo, useEffect } from 'react';
import ModernProductCard from './product/ModernProductCard';
import PageHero from './layout/PageHero';
import { useAuth } from '../contexts/AuthContext';
import clothingCatalog from '../data/clothing-catalog.json';

const ClothesPage = ({ 
  onAddToCart, 
  isAuthenticated, 
  onAuthRequired, 
  onViewProduct, 
  initialCategory = 'All', 
  wishlistIds = [], 
  onToggleWishlist 
}) => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'All');
  const [sortBy, setSortBy] = useState('rating');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeller, setSelectedSeller] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [priceRange, setPriceRange] = useState(10000);

  const wishlistSet = useMemo(() => new Set((wishlistIds || []).map(id => String(id))), [wishlistIds]);
  const itemsPerPage = 40;

  useEffect(() => {
    setSelectedCategory(initialCategory || 'All');
    setCurrentPage(1);
  }, [initialCategory]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set((clothingCatalog || []).map(item => item.category).filter(Boolean)));
    unique.sort((a, b) => a.localeCompare(b));
    return ['All', ...unique];
  }, []);

  const sellers = useMemo(() => {
    const unique = Array.from(new Set((clothingCatalog || []).map(item => item.seller).filter(Boolean)));
    unique.sort();
    return ['All', ...unique.slice(0, 15)];
  }, []);

  const colors = useMemo(() => {
    const unique = Array.from(new Set((clothingCatalog || []).map(item => item.color).filter(Boolean)));
    unique.sort();
    return ['All', ...unique.slice(0, 15)];
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = clothingCatalog.filter(product => Boolean(product.image));

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (selectedSeller !== 'All') {
      filtered = filtered.filter(product => product.seller === selectedSeller);
    }

    if (selectedColor !== 'All') {
      filtered = filtered.filter(product => product.color === selectedColor);
    }

    if (priceRange < 10000) {
      filtered = filtered.filter(product => product.discounted_price <= priceRange);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        (product.name && product.name.toLowerCase().includes(term)) ||
        (product.category && product.category.toLowerCase().includes(term)) ||
        (product.seller && product.seller.toLowerCase().includes(term)) ||
        (product.description && product.description.toLowerCase().includes(term))
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.discounted_price - b.discounted_price;
        case 'price-high':
          return b.discounted_price - a.discounted_price;
        case 'rating':
          return parseFloat(b.rating) - parseFloat(a.rating);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [selectedCategory, selectedSeller, selectedColor, priceRange, sortBy, searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [currentPage, selectedCategory, sortBy, searchTerm]);

  return (
    <div style={{ width: '100vw', position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw' }}>
      <PageHero
        title="Fashion Clothes Collection"
        subtitle="Explore all 18 fashion clothing categories. Tops, sarees, denim, lehengas, kurtas, jackets & dresses."
        heroTag="CLOTHES catalog"
        tags={['Statement Silks', 'Ethnic Wear', 'Monochrome & Denim']}
        backgroundPattern="dots"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls & Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-8 space-y-4">
          
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Search by apparel name, seller, color, or category..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
              />
              <span className="absolute left-3 top-3 text-gray-400">🔍</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {filteredProducts.length} Clothes Found
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>

          {/* Categories Selector Tabs */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Fashion Category Selection (18 Categories)
            </label>
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-pink-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-pink-50 hover:text-pink-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-gray-100">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Filter by Seller
              </label>
              <select
                value={selectedSeller}
                onChange={(e) => { setSelectedSeller(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700"
              >
                {sellers.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Filter by Color
              </label>
              <select
                value={selectedColor}
                onChange={(e) => { setSelectedColor(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700"
              >
                {colors.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Max Price: ₹{priceRange}
              </label>
              <input
                type="range"
                min="300"
                max="10000"
                step="100"
                value={priceRange}
                onChange={(e) => { setPriceRange(Number(e.target.value)); setCurrentPage(1); }}
                className="w-full accent-pink-600"
              />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {currentProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <span className="text-4xl">👗</span>
            <h3 className="text-lg font-bold text-gray-900 mt-2">No Clothes Found</h3>
            <p className="text-sm text-gray-500 mt-1">Try broadening your search or resetting your filters.</p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchTerm(''); setSelectedSeller('All'); setSelectedColor('All'); setPriceRange(10000); }}
              className="mt-4 px-4 py-2 bg-pink-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-pink-700 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {currentProducts.map((product) => (
              <ModernProductCard
                key={product.id || product._id}
                product={product}
                onAddToCart={onAddToCart}
                onViewProduct={onViewProduct}
                isWishlisted={wishlistSet.has(String(product.id || product._id))}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-xs font-bold text-gray-600 px-3">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClothesPage;
