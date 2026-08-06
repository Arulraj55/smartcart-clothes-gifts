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
  // Helper to resolve a representative image for category
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
      
      {/* Fashion Categories Section */}
      <div>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b border-gray-200 pb-4">
          <div>
            <span className="text-pink-600 font-bold text-xs uppercase tracking-widest bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
              Fashion Collection
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
              Explore All 18 Clothes Categories
            </h2>
          </div>
          <p className="text-sm text-gray-500 mt-2 md:mt-0 font-medium">
            Curated outfits, ethnic wear, tops, denim & tailored apparel
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {FASHION_CATEGORIES.map((category) => {
            const imgSrc = getFashionImage(category);
            return (
              <div
                key={category}
                onClick={() => onSelectCategory && onSelectCategory('clothes', category)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gray-100 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="aspect-square w-full overflow-hidden bg-gray-200 relative">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute top-2 right-2 bg-pink-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    Fashion
                  </div>
                </div>
                <div className="absolute bottom-0 inset-x-0 p-3 text-center">
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide group-hover:text-pink-300 transition-colors drop-shadow-md">
                    {category}
                  </h3>
                  <span className="inline-block mt-1 text-[10px] text-pink-200 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Shop Now →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footwear Categories Section */}
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {FOOTWEAR_CATEGORIES.map((category) => {
            const imgSrc = getFootwearImage(category);
            return (
              <div
                key={category}
                onClick={() => onSelectCategory && onSelectCategory('footwear', category)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gray-100 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="aspect-square w-full overflow-hidden bg-gray-200 relative">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    Shoes
                  </div>
                </div>
                <div className="absolute bottom-0 inset-x-0 p-3 text-center">
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide group-hover:text-blue-300 transition-colors drop-shadow-md">
                    {category}
                  </h3>
                  <span className="inline-block mt-1 text-[10px] text-blue-200 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore →
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
