const fs = require('fs');
const https = require('https');
const path = require('path');

// Replace with your actual Pixabay API key
const PIXABAY_API_KEY = '51575401-bb623edd55d98049d535f54dd';

// Keywords for clothing (1000 items)
const clothingKeywords = [
  // Traditional Indian Wear
  'saree', 'lehenga', 'churidar', 'salwar kameez', 'kurti', 'anarkali', 'sharara', 'gharara', 'dupatta',
  'dhoti', 'kurta', 'sherwani', 'nehru jacket', 'bandhgala', 'pathani suit', 'lungi', 'mundu',
  'choli', 'blouse', 'petticoat', 'palazzo', 'straight pants', 'churidar pants', 'patiyala',
  
  // Modern Clothing
  'dress', 'gown', 'skirt', 'top', 'blouse', 'shirt', 't-shirt', 'jeans', 'trousers', 'shorts',
  'jacket', 'blazer', 'coat', 'sweater', 'cardigan', 'hoodie', 'tracksuit', 'jumpsuit',
  'formal wear', 'casual wear', 'party dress', 'evening gown', 'cocktail dress',
  
  // Fabrics and Styles
  'silk', 'cotton', 'linen', 'chiffon', 'georgette', 'crepe', 'satin', 'velvet', 'brocade',
  'handloom', 'khadi', 'block print', 'embroidered', 'sequined', 'beaded', 'mirror work',
  
  // Seasonal Wear
  'winter wear', 'summer dress', 'monsoon wear', 'festival wear', 'wedding dress', 'bridal wear',
  'casual shirt', 'formal shirt', 'polo shirt', 'tank top', 'crop top', 'tunic',
  
  // Accessories and Undergarments
  'scarf', 'stole', 'shawl', 'dupatta', 'veil', 'headwrap', 'turban',
  'innerwear', 'undergarments', 'bra', 'panties', 'camisole', 'slip',
  
  // Additional clothing types
  'ethnic wear', 'indo western', 'fusion wear', 'contemporary', 'vintage',
  'boho', 'minimalist', 'elegant', 'stylish', 'trendy', 'designer',
  'handcrafted', 'artisan', 'traditional', 'modern', 'classic'
];

// Keywords for gifts (500 items)
const giftKeywords = [
  // Personalized gifts
  'personalized mug', 'custom photo frame', 'engraved keychain', 'monogrammed wallet',
  'custom jewelry', 'personalized notebook', 'photo album', 'memory book',
  
  // Home decor gifts
  'decorative vase', 'wall art', 'candle holder', 'picture frame', 'mirror',
  'cushion cover', 'throw pillow', 'table runner', 'wall clock', 'lamp',
  
  // Jewelry gifts
  'necklace', 'bracelet', 'earrings', 'ring', 'pendant', 'charm', 'brooch',
  'cufflinks', 'watch', 'jewelry box', 'ring holder',
  
  // Tech gifts
  'wireless earbuds', 'bluetooth speaker', 'phone case', 'power bank',
  'tablet stand', 'laptop bag', 'phone holder', 'charging cable',
  
  // Kitchen gifts
  'coffee mug', 'tea set', 'cutting board', 'spice rack', 'wine opener',
  'kitchen utensils', 'serving tray', 'storage jar', 'recipe book',
  
  // Baby gifts
  'baby blanket', 'baby shoes', 'baby clothes', 'baby toy', 'baby album',
  'baby bottle', 'pacifier', 'baby carrier', 'baby pillow',
  
  // Beauty gifts
  'skincare set', 'makeup kit', 'perfume', 'bath bomb', 'soap set',
  'essential oils', 'face mask', 'lip balm', 'hand cream',
  
  // Books and stationery
  'notebook', 'diary', 'pen set', 'bookmark', 'calendar', 'planner',
  'greeting card', 'gift card', 'book', 'magazine',
  
  // Toys and games
  'teddy bear', 'soft toy', 'puzzle', 'board game', 'playing cards',
  'action figure', 'doll', 'toy car', 'building blocks',
  
  // Craft items
  'handmade soap', 'craft kit', 'art supplies', 'painting set',
  'embroidery kit', 'knitting supplies', 'scrapbook', 'craft paper'
];

// Expand keywords to reach exact counts
function expandKeywords(baseKeywords, targetCount) {
  const expanded = [...baseKeywords];
  const adjectives = ['beautiful', 'elegant', 'stylish', 'modern', 'classic', 'vintage', 'designer', 'premium', 'luxury', 'handmade'];
  const colors = ['red', 'blue', 'green', 'black', 'white', 'pink', 'purple', 'yellow', 'orange', 'brown'];
  
  while (expanded.length < targetCount) {
    const baseKeyword = baseKeywords[expanded.length % baseKeywords.length];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    if (expanded.length % 3 === 0) {
      expanded.push(`${adjective} ${baseKeyword}`);
    } else if (expanded.length % 3 === 1) {
      expanded.push(`${color} ${baseKeyword}`);
    } else {
      expanded.push(`${adjective} ${color} ${baseKeyword}`);
    }
  }
  
  return expanded.slice(0, targetCount);
}

// Get exactly 1000 clothing keywords and 500 gift keywords
const finalClothingKeywords = expandKeywords(clothingKeywords, 1000);
const finalGiftKeywords = expandKeywords(giftKeywords, 500);

console.log(`Generated ${finalClothingKeywords.length} clothing keywords`);
console.log(`Generated ${finalGiftKeywords.length} gift keywords`);

// Function to make HTTP request
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(10000, () => {
      request.abort();
      reject(new Error('Request timeout'));
    });
  });
}

// Function to fetch image from Pixabay
async function fetchImageFromPixabay(keyword, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const encodedKeyword = encodeURIComponent(keyword);
      const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodedKeyword}&image_type=photo&orientation=all&category=fashion&min_width=400&min_height=300&per_page=3&safesearch=true`;
      
      console.log(`Fetching "${keyword}" (attempt ${attempt}/${maxRetries})`);
      
      const response = await makeRequest(url);
      
      if (response.hits && response.hits.length > 0) {
        const image = response.hits[0]; // Take the first result
        return {
          keyword: keyword,
          name: keyword,
          image_url: image.webformatURL,
          source: 'pixabay',
          attribution: {
            photographer: image.user,
            photographer_url: `https://pixabay.com/users/${image.user}-${image.user_id}/`,
            photo_url: image.pageURL
          },
          pixabay_id: image.id,
          tags: image.tags
        };
      } else {
        console.log(`No images found for "${keyword}" on attempt ${attempt}`);
        if (attempt === maxRetries) {
          // Return a placeholder entry
          return {
            keyword: keyword,
            name: keyword,
            image_url: `https://dummyimage.com/400x300/667eea/ffffff.png&text=${encodeURIComponent(keyword)}`,
            source: 'placeholder',
            attribution: {
              photographer: 'Placeholder',
              photographer_url: '#',
              photo_url: '#'
            }
          };
        }
      }
    } catch (error) {
      console.log(`Error fetching "${keyword}" on attempt ${attempt}: ${error.message}`);
      if (attempt === maxRetries) {
        // Return a placeholder entry
        return {
          keyword: keyword,
          name: keyword,
          image_url: `https://dummyimage.com/400x300/667eea/ffffff.png&text=${encodeURIComponent(keyword)}`,
          source: 'placeholder',
          attribution: {
            photographer: 'Placeholder',
            photographer_url: '#',
            photo_url: '#'
          }
        };
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// Function to process images in batches
async function fetchImagesInBatches(keywords, batchSize = 10) {
  const results = [];
  const total = keywords.length;
  
  for (let i = 0; i < total; i += batchSize) {
    const batch = keywords.slice(i, i + batchSize);
    console.log(`\nProcessing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(total / batchSize)} (${i + 1}-${Math.min(i + batchSize, total)} of ${total})`);
    
    const batchPromises = batch.map(keyword => fetchImageFromPixabay(keyword));
    const batchResults = await Promise.all(batchPromises);
    
    results.push(...batchResults);
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < total) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`Completed ${results.length}/${total} images`);
  }
  
  return results;
}

// Main function
async function main() {
  if (PIXABAY_API_KEY === 'YOUR_PIXABAY_API_KEY') {
    console.error('Please replace YOUR_PIXABAY_API_KEY with your actual Pixabay API key!');
    process.exit(1);
  }
  
  console.log('Starting image fetch process...');
  console.log(`Target: 1000 clothing images + 500 gift images = 1500 total images\n`);
  
  try {
    // Fetch clothing images
    console.log('=== FETCHING CLOTHING IMAGES ===');
    const clothingImages = await fetchImagesInBatches(finalClothingKeywords, 10);
    
    // Fetch gift images
    console.log('\n=== FETCHING GIFT IMAGES ===');
    const giftImages = await fetchImagesInBatches(finalGiftKeywords, 10);
    
    // Create clothing catalog
    const clothingCatalog = {
      metadata: {
        total_keywords: clothingImages.length,
        successful_images: clothingImages.filter(img => img.source === 'pixabay').length,
        placeholder_images: clothingImages.filter(img => img.source === 'placeholder').length,
        last_updated: new Date().toISOString(),
        api_source: 'pixabay'
      },
      images: clothingImages.map((img, index) => ({
        id: index + 1,
        category: getCategoryForClothing(img.keyword),
        ...img
      }))
    };
    
    // Update gift items in GiftsPage.js
    const giftItemNames = giftImages.map(img => img.keyword);
    
    // Save clothing catalog
    const clothingPath = path.join(__dirname, '..', 'data', 'clothing-catalog.json');
    fs.writeFileSync(clothingPath, JSON.stringify(clothingCatalog, null, 2));
    
    // Update GiftsPage.js with new gift items
    updateGiftsPage(giftItemNames);
    
    // Generate summary
    console.log('\n=== SUMMARY ===');
    console.log(`Total images fetched: ${clothingImages.length + giftImages.length}`);
    console.log(`Clothing images: ${clothingImages.length}`);
    console.log(`- From Pixabay: ${clothingImages.filter(img => img.source === 'pixabay').length}`);
    console.log(`- Placeholders: ${clothingImages.filter(img => img.source === 'placeholder').length}`);
    console.log(`Gift images: ${giftImages.length}`);
    console.log(`- From Pixabay: ${giftImages.filter(img => img.source === 'pixabay').length}`);
    console.log(`- Placeholders: ${giftImages.filter(img => img.source === 'placeholder').length}`);
    console.log('\nFiles updated:');
    console.log('- ../data/clothing-catalog.json');
    console.log('- GiftsPage.js');
    
  } catch (error) {
    console.error('Error in main process:', error);
  }
}

// Helper function to categorize clothing
function getCategoryForClothing(keyword) {
  const kw = keyword.toLowerCase();
  
  if (kw.includes('saree') || kw.includes('lehenga') || kw.includes('kurti') || kw.includes('salwar')) {
    return 'traditional_women';
  } else if (kw.includes('dhoti') || kw.includes('kurta') || kw.includes('sherwani')) {
    return 'traditional_men';
  } else if (kw.includes('dress') || kw.includes('gown') || kw.includes('skirt') || kw.includes('blouse')) {
    return 'modern_women';
  } else if (kw.includes('shirt') || kw.includes('blazer') || kw.includes('jacket')) {
    return 'modern_men';
  } else if (kw.includes('underwear') || kw.includes('bra') || kw.includes('innerwear')) {
    return 'innerwear';
  } else if (kw.includes('wedding') || kw.includes('bridal') || kw.includes('festival')) {
    return 'festival_ceremonial';
  } else if (kw.includes('winter') || kw.includes('summer') || kw.includes('rain')) {
    return 'seasonal_utility';
  } else if (kw.includes('silk') || kw.includes('cotton') || kw.includes('linen')) {
    return 'fabrics_styles_trends';
  } else if (kw.includes('ethnic') || kw.includes('fusion') || kw.includes('indo western')) {
    return 'bonus_fashion_fusion';
  } else {
    return 'unisex_gender_neutral';
  }
}

// Function to update GiftsPage.js
function updateGiftsPage(giftItemNames) {
  try {
    const giftsPagePath = path.join(__dirname, 'GiftsPage.js');
    let content = fs.readFileSync(giftsPagePath, 'utf8');
    
    // Create the new gift items array
    const formattedItems = giftItemNames.map(item => `  "${item}"`).join(',\n');
    const newGiftItemsArray = `const giftItems = [\n${formattedItems}\n];`;
    
    // Replace the existing giftItems array
    content = content.replace(/const giftItems = \[[\s\S]*?\];/, newGiftItemsArray);
    
    fs.writeFileSync(giftsPagePath, content);
    console.log('GiftsPage.js updated successfully!');
  } catch (error) {
    console.error('Error updating GiftsPage.js:', error);
  }
}

// Run the script
main();
