import React from 'react';
import categoryImagesData from '../../data/category-images.json';
import clothingCatalog from '../../data/clothing-catalog.json';
import footwearCatalog from '../../data/footwear-catalog.json';

const FASHION_CATEGORIES = [
  "Tops & Tunics",
  "Shirts & Blouses",
  "Jeans",
  "Kurtas & Kurtis",
  "Trousers & Pants",
  "Jackets & Coats",
  "Sarees",
  "Lehengas",
  "Dupattas & Stoles",
  "Sweaters & Sweatshirts",
  "Dresses & Gowns",
  "T-Shirts",
  "Shrugs",
  "Co-ord Sets",
  "Skirts",
  "Jumpsuits & Playsuits",
  "Shorts",
  "Innerwear & Sleepwear"
];

const FOOTWEAR_CATEGORIES = [
  "Sandals",
  "Sneakers",
  "Casual Shoes",
  "Slippers",
  "Boots",
  "Flats",
  "Loafers",
  "Cleats & Sports Shoes",
  "Heels",
  "Dress & Oxford Shoes",
  "Rain & Snow Boots",
  "Western & Cowboy Boots",
  "Canvas & Skate Shoes",
  "Clogs"
];

export default function CategoryGrid({ onSelectCategory }) {
  const getFashionImage = (cat) => {
    if (categoryImagesData?.clothes?.[cat]) return categoryImagesData.clothes[cat];
    const match = clothingCatalog.find(p => p.category === cat && p.image);
    return match ? match.image : 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80';
  };

  const getFootwearImage = (cat) => {
    if (categoryImagesData?.footwear?.[cat]) return categoryImagesData.footwear[cat];
    const match = footwearCatalog.find(p => p.category === cat && p.image);
    return match ? match.image : 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80';
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Fashion Categories Section (Strictly 4 per row) */}
      <div>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b border-gray-200 pb-4">
          <div>
            <span className="text-pink-600 font-bold text-xs uppercase tracking-widest bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
              Fashion Apparel
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
              Explore All 18 Clothes Categories
            </h2>
          </div>
          <p className="text-sm text-gray-500 mt-2 md:mt-0 font-medium">
            Sarees, kurtas, denim, dresses, tops & ethnic sets
          </p>
        </div>

        {/* Grid strictly 4 columns per row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {FASHION_CATEGORIES.map((category) => {
            const imgSrc = getFashionImage(category);
            return (
              <div
                key={category}
                onClick={() => onSelectCategory && onSelectCategory('clothes', category)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gray-100 border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-64"
              >
                <div className="w-full h-full overflow-hidden bg-gray-200 relative">
                  <img
                    src={imgSrc}
                    alt={category}
                    className="h-full w-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />
                  <div className="absolute top-3 right-3 bg-pink-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md">
                    Fashion
                  </div>
                </div>
                <div className="absolute bottom-0 inset-x-0 p-4 text-center">
                  <h3 className="text-sm sm:text-base font-extrabold text-white tracking-wide group-hover:text-pink-300 transition-colors drop-shadow-md">
                    {category}
                  </h3>
                  <span className="inline-block mt-1 text-xs text-pink-200 font-bold opacity-90 group-hover:opacity-100 transition-opacity">
                    Shop Category →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footwear Categories Section (Strictly 4 per row) */}
      <div>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b border-gray-200 pb-4">
          <div>
            <span className="text-blue-600 font-bold text-xs uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Footwear Collection
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
              Explore All 14 Footwear Categories
            </h2>
          </div>
          <p className="text-sm text-gray-500 mt-2 md:mt-0 font-medium">
            Sneakers, sandals, loafers, boots, formal shoes & sports cleats
          </p>
        </div>

        {/* Grid strictly 4 columns per row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {FOOTWEAR_CATEGORIES.map((category) => {
            const imgSrc = getFootwearImage(category);
            return (
              <div
                key={category}
                onClick={() => onSelectCategory && onSelectCategory('footwear', category)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gray-100 border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-64"
              >
                <div className="w-full h-full overflow-hidden bg-gray-200 relative">
                  <img
                    src={imgSrc}
                    alt={category}
                    className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />
                  <div className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md">
                    Shoes
                  </div>
                </div>
                <div className="absolute bottom-0 inset-x-0 p-4 text-center">
                  <h3 className="text-sm sm:text-base font-extrabold text-white tracking-wide group-hover:text-blue-300 transition-colors drop-shadow-md">
                    {category}
                  </h3>
                  <span className="inline-block mt-1 text-xs text-blue-200 font-bold opacity-90 group-hover:opacity-100 transition-opacity">
                    Shop Category →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
