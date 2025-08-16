// Simple products data for App.js compatibility
// Featured products for homepage display

// Clothes data - sample items for homepage
export const clothesData = [
  {
    id: 1,
    name: "Traditional Silk Saree",
    image: "https://dummyimage.com/400x300/667eea/ffffff.png&text=Silk+Saree",
    price: 2500,
    originalPrice: 3500,
    discount: 28,
    category: "traditional_women",
    type: "clothing",
    brand: "Ethnic Elegance",
    gender: "Women",
    fabric: "Silk",
    rating: 4.5,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Red", "Gold", "Blue"]
  },
  {
    id: 2,
    name: "Designer Lehenga",
    image: "https://dummyimage.com/400x300/667eea/ffffff.png&text=Lehenga",
    price: 4500,
    originalPrice: 6000,
    discount: 25,
    category: "traditional_women",
    type: "clothing",
    brand: "Royal Collection",
    gender: "Women",
    fabric: "Net",
    rating: 4.7,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Pink", "Red", "Purple"]
  },
  {
    id: 3,
    name: "Embroidered Kurta",
    image: "https://dummyimage.com/400x300/667eea/ffffff.png&text=Kurta",
    price: 1200,
    originalPrice: 1600,
    discount: 25,
    category: "traditional_men",
    type: "clothing",
    brand: "Heritage Wear",
    gender: "Men",
    fabric: "Cotton",
    rating: 4.3,
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["White", "Cream", "Blue"]
  },
  {
    id: 4,
    name: "Cotton Palazzo",
    image: "https://dummyimage.com/400x300/667eea/ffffff.png&text=Palazzo",
    price: 800,
    originalPrice: 1200,
    discount: 33,
    category: "modern_women",
    type: "clothing",
    brand: "Comfort Zone",
    gender: "Women",
    fabric: "Cotton",
    rating: 4.2,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Navy", "White"]
  },
  {
    id: 5,
    name: "Denim Jacket",
    image: "https://dummyimage.com/400x300/667eea/ffffff.png&text=Denim+Jacket",
    price: 1500,
    originalPrice: 2000,
    discount: 25,
    category: "modern_men",
    type: "clothing",
    brand: "Urban Style",
    gender: "Men",
    fabric: "Denim",
    rating: 4.4,
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Blue", "Black", "Grey"]
  }
];

// Gifts data - sample items for homepage
export const giftsData = [
  {
    id: 10,
    name: "Handcrafted Jewelry Box",
    image: "https://dummyimage.com/400x300/10b981/ffffff.png&text=Jewelry+Box",
    price: 1200,
    originalPrice: 1800,
    discount: 33,
    category: "accessories",
    type: "gift",
    brand: "Artisan Crafts",
    ageGroup: "Adults",
    material: "Wood",
    rating: 4.6,
    colors: ["Brown", "Natural"]
  },
  {
    id: 11,
    name: "Premium Tea Set",
    image: "https://dummyimage.com/400x300/10b981/ffffff.png&text=Tea+Set",
    price: 2200,
    originalPrice: 3000,
    discount: 27,
    category: "home_decor",
    type: "gift",
    brand: "Elite Living",
    ageGroup: "Adults",
    material: "Ceramic",
    rating: 4.8,
    colors: ["White", "Blue"]
  },
  {
    id: 12,
    name: "Artisan Candle Collection",
    image: "https://dummyimage.com/400x300/10b981/ffffff.png&text=Candles",
    price: 800,
    originalPrice: 1200,
    discount: 33,
    category: "home_decor",
    type: "gift",
    brand: "Peaceful Moments",
    ageGroup: "All Ages",
    material: "Wax",
    rating: 4.4,
    colors: ["Multicolor"]
  },
  {
    id: 13,
    name: "Silk Scarf",
    image: "https://dummyimage.com/400x300/10b981/ffffff.png&text=Silk+Scarf",
    price: 1500,
    originalPrice: 2000,
    discount: 25,
    category: "accessories",
    type: "gift",
    brand: "Luxury Touch",
    ageGroup: "Adults",
    material: "Silk",
    rating: 4.5,
    colors: ["Red", "Blue", "Gold"]
  },
  {
    id: 14,
    name: "Ceramic Vase",
    image: "https://dummyimage.com/400x300/10b981/ffffff.png&text=Ceramic+Vase",
    price: 600,
    originalPrice: 900,
    discount: 33,
    category: "home_decor",
    type: "gift",
    brand: "Home Elegance",
    ageGroup: "All Ages",
    material: "Ceramic",
    rating: 4.3,
    colors: ["White", "Blue", "Green"]
  }
];

// Load all products function
export const loadAllProducts = async () => {
  try {
    // Import the catalog data
    const clothingCatalog = await import('./clothing-catalog.json');
    const giftsCatalog = await import('./gifts-catalog-with-images.json');
    
    const clothingItems = clothingCatalog.default?.images || [];
    const giftItems = giftsCatalog.default?.images || [];
    
    // Ensure all items have a type property
    const processedClothingItems = clothingItems.map(item => ({
      ...item,
      type: item.type || 'clothing'
    }));
    
    const processedGiftItems = giftItems.map(item => ({
      ...item,
      type: item.type || 'gift'
    }));
    
    return [...processedClothingItems, ...processedGiftItems];
  } catch (error) {
    console.warn('Failed to load product catalogs, using featured data:', error);
    return [...clothesData, ...giftsData];
  }
};

// Search products
export const searchProducts = (products, searchTerm) => {
  if (!searchTerm) return products;
  
  return products.filter(product => 
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.keyword?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

// Filter products
export const filterProducts = (products, filters) => {
  return products.filter(product => {
    // Category filter
    if (filters.category && product.category !== filters.category) {
      return false;
    }
    
    // Price filter
    if (filters.minPrice && product.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice && product.price > filters.maxPrice) {
      return false;
    }
    
    // Discount filter
    if (filters.minDiscount && product.discount < filters.minDiscount) {
      return false;
    }
    
    return true;
  });
};

// Sort products
export const sortProducts = (products, sortBy) => {
  const sorted = [...products];
  
  switch (sortBy) {
    case 'price_low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price_high':
      return sorted.sort((a, b) => b.price - a.price);
    case 'rating':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'discount':
      return sorted.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    case 'name':
      return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    default:
      return products;
  }
};

// Get product by ID
export const getProductById = async (id) => {
  // First check featured data
  const featuredProduct = [...clothesData, ...giftsData].find(p => p.id === id);
  if (featuredProduct) return featuredProduct;
  
  // If not found, load all data and search
  try {
    const allProducts = await loadAllProducts();
    return allProducts.find(p => p.id === id);
  } catch (error) {
    console.warn('Failed to find product:', error);
    return null;
  }
};

// Get related products
export const getRelatedProducts = (product, count = 4) => {
  const related = [...clothesData, ...giftsData]
    .filter(p => 
      p.id !== product.id && 
      (p.category === product.category || p.type === product.type)
    )
    .slice(0, count);
    
  return related;
};

// Default export for backward compatibility
export default {
  clothesData,
  giftsData,
  loadAllProducts,
  searchProducts,
  filterProducts,
  sortProducts,
  getProductById,
  getRelatedProducts
};
