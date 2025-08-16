const fs = require('fs');
const path = require('path');

const API_KEY = '51575401-bb623edd55d98049d535f54dd';
const BASE_URL = 'https://pixabay.com/api/';

const giftCategories = [
  'gift', 'present', 'birthday', 'anniversary', 'celebration',
  'jewelry', 'necklace', 'bracelet', 'ring', 'earrings',
  'flowers', 'bouquet', 'rose', 'tulip', 'sunflower',
  'chocolate', 'candy', 'sweets', 'cake', 'dessert',
  'toy', 'teddy bear', 'doll', 'puzzle', 'game',
  'book', 'notebook', 'diary', 'pen', 'art',
  'candle', 'perfume', 'cosmetics', 'skincare', 'beauty',
  'mug', 'cup', 'tea', 'coffee', 'kitchen',
  'watch', 'clock', 'time', 'accessory', 'fashion',
  'baby', 'infant', 'child', 'kids', 'family'
];

async function fetchGiftImages() {
  const gifts = [];
  const usedUrls = new Set();
  const usedPhotographers = new Set();
  
  console.log('Fetching gift images from Pixabay...');
  
  for (let i = 0; i < giftCategories.length && gifts.length < 500; i++) {
    const category = giftCategories[i];
    console.log(`Fetching images for category: ${category}`);
    
    try {
      const response = await fetch(`${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(category)}&image_type=photo&category=all&min_width=400&min_height=300&per_page=200&safesearch=true`);
      const data = await response.json();
      
      if (data.hits) {
        for (const hit of data.hits) {
          if (gifts.length >= 500) break;
          
          // Skip if we've used this URL or photographer before
          if (usedUrls.has(hit.webformatURL) || usedPhotographers.has(hit.user)) {
            continue;
          }
          
          usedUrls.add(hit.webformatURL);
          usedPhotographers.add(hit.user);
          
          const giftName = generateGiftName(category, hit.tags);
          const price = Math.floor(Math.random() * 5000) + 500; // ₹500 to ₹5500
          const rating = (4 + Math.random()).toFixed(1);
          const reviews = Math.floor(Math.random() * 200) + 10;
          const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 5 : 0;
          
          gifts.push({
            id: gifts.length + 1,
            name: giftName,
            price: price,
            image: hit.webformatURL,
            category: getCategoryForGift(category),
            description: `Beautiful ${giftName.toLowerCase()} perfect for gifting`,
            rating: rating,
            reviews: reviews,
            discount: discount,
            inStock: Math.random() > 0.1, // 90% in stock
            colors: getRandomColors(),
            source: 'pixabay',
            attribution: `Photo by ${hit.user} on Pixabay`,
            photographer: hit.user,
            pixabay_id: hit.id
          });
        }
      }
      
      // Small delay to respect API limits
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error(`Error fetching images for ${category}:`, error);
    }
  }
  
  // Fill remaining slots with placeholder gifts if needed
  while (gifts.length < 500) {
    const randomCategory = giftCategories[Math.floor(Math.random() * giftCategories.length)];
    const giftName = generateGiftName(randomCategory, randomCategory);
    const price = Math.floor(Math.random() * 5000) + 500;
    
    gifts.push({
      id: gifts.length + 1,
      name: giftName,
      price: price,
      image: `https://via.placeholder.com/400x300/10b981/ffffff?text=${encodeURIComponent(giftName)}`,
      category: getCategoryForGift(randomCategory),
      description: `Beautiful ${giftName.toLowerCase()} perfect for gifting`,
      rating: (4 + Math.random()).toFixed(1),
      reviews: Math.floor(Math.random() * 200) + 10,
      discount: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 5 : 0,
      inStock: Math.random() > 0.1,
      colors: getRandomColors(),
      source: 'placeholder',
      attribution: 'Placeholder image'
    });
  }
  
  console.log(`Generated ${gifts.length} gift items`);
  console.log(`Real Pixabay images: ${gifts.filter(g => g.source === 'pixabay').length}`);
  console.log(`Placeholder images: ${gifts.filter(g => g.source === 'placeholder').length}`);
  console.log(`Unique photographers: ${usedPhotographers.size}`);
  
  return gifts;
}

function generateGiftName(category, tags) {
  const giftPrefixes = ['Premium', 'Luxury', 'Beautiful', 'Elegant', 'Classic', 'Modern', 'Handcrafted', 'Designer', 'Exclusive', 'Special'];
  const giftSuffixes = ['Gift Set', 'Collection', 'Package', 'Bundle', 'Set', 'Kit', 'Box', 'Hamper'];
  
  const prefix = giftPrefixes[Math.floor(Math.random() * giftPrefixes.length)];
  const suffix = Math.random() > 0.5 ? giftSuffixes[Math.floor(Math.random() * giftSuffixes.length)] : '';
  
  let baseName = category.charAt(0).toUpperCase() + category.slice(1);
  
  // Extract meaningful words from tags
  if (tags) {
    const tagWords = tags.split(', ').filter(tag => 
      tag.length > 3 && 
      !['photo', 'image', 'picture', 'background'].includes(tag.toLowerCase())
    );
    if (tagWords.length > 0) {
      baseName = tagWords[0].charAt(0).toUpperCase() + tagWords[0].slice(1);
    }
  }
  
  return suffix ? `${prefix} ${baseName} ${suffix}` : `${prefix} ${baseName}`;
}

function getCategoryForGift(category) {
  const categoryMap = {
    'gift': 'General Gifts',
    'present': 'General Gifts',
    'birthday': 'Birthday Gifts',
    'anniversary': 'Anniversary Gifts',
    'celebration': 'Celebration Gifts',
    'jewelry': 'Jewelry & Accessories',
    'necklace': 'Jewelry & Accessories',
    'bracelet': 'Jewelry & Accessories',
    'ring': 'Jewelry & Accessories',
    'earrings': 'Jewelry & Accessories',
    'flowers': 'Flowers & Plants',
    'bouquet': 'Flowers & Plants',
    'rose': 'Flowers & Plants',
    'tulip': 'Flowers & Plants',
    'sunflower': 'Flowers & Plants',
    'chocolate': 'Food & Treats',
    'candy': 'Food & Treats',
    'sweets': 'Food & Treats',
    'cake': 'Food & Treats',
    'dessert': 'Food & Treats',
    'toy': 'Toys & Games',
    'teddy bear': 'Toys & Games',
    'doll': 'Toys & Games',
    'puzzle': 'Toys & Games',
    'game': 'Toys & Games',
    'book': 'Books & Stationery',
    'notebook': 'Books & Stationery',
    'diary': 'Books & Stationery',
    'pen': 'Books & Stationery',
    'art': 'Books & Stationery',
    'candle': 'Home & Decor',
    'perfume': 'Beauty & Personal Care',
    'cosmetics': 'Beauty & Personal Care',
    'skincare': 'Beauty & Personal Care',
    'beauty': 'Beauty & Personal Care',
    'mug': 'Kitchen & Dining',
    'cup': 'Kitchen & Dining',
    'tea': 'Kitchen & Dining',
    'coffee': 'Kitchen & Dining',
    'kitchen': 'Kitchen & Dining',
    'watch': 'Fashion & Accessories',
    'clock': 'Home & Decor',
    'time': 'Fashion & Accessories',
    'accessory': 'Fashion & Accessories',
    'fashion': 'Fashion & Accessories',
    'baby': 'Baby & Kids',
    'infant': 'Baby & Kids',
    'child': 'Baby & Kids',
    'kids': 'Baby & Kids',
    'family': 'Family Gifts'
  };
  
  return categoryMap[category] || 'General Gifts';
}

function getRandomColors() {
  const colors = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink', 'Orange', 'Black', 'White', 'Brown', 'Grey', 'Silver', 'Gold'];
  const numColors = Math.floor(Math.random() * 3) + 1; // 1-3 colors
  const selectedColors = [];
  
  for (let i = 0; i < numColors; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    if (!selectedColors.includes(color)) {
      selectedColors.push(color);
    }
  }
  
  return selectedColors.length > 0 ? selectedColors : ['Multi-Color'];
}

// Main execution
async function main() {
  try {
    const gifts = await fetchGiftImages();
    
    // Save to JSON file
    const outputPath = path.join(__dirname, '..', 'data', 'gifts-catalog.json');
    fs.writeFileSync(outputPath, JSON.stringify(gifts, null, 2));
    
    console.log(`Successfully saved ${gifts.length} gift items to ${outputPath}`);
    
  } catch (error) {
    console.error('Error generating gift catalog:', error);
  }
}

main();
