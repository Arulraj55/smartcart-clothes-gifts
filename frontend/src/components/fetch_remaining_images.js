const fs = require('fs');
const https = require('https');
const path = require('path');

// Your Pixabay API key
const PIXABAY_API_KEY = '51575401-bb623edd55d98049d535f54dd';

// First, let's save the current 367 working images to frontend
function saveCurrentImages() {
  try {
    const clothingData = JSON.parse(fs.readFileSync('../data/clothing-catalog.json', 'utf8'));
    const workingImages = clothingData.images.filter(img => img.source === 'pixabay');
    
    const backup = {
      metadata: {
        total_images: workingImages.length,
        backup_date: new Date().toISOString(),
        description: 'Backup of 367 working Pixabay images before fetching more'
      },
      images: workingImages
    };
    
    fs.writeFileSync('backup_367_working_images.json', JSON.stringify(backup, null, 2));
    console.log(`✅ Saved ${workingImages.length} working images to backup_367_working_images.json`);
    
    return workingImages;
  } catch (error) {
    console.error('Error saving current images:', error.message);
    return [];
  }
}

// Expanded and more diverse keywords for better success rate
const expandedClothingKeywords = [
  // Basic clothing items with high success rate
  'dress', 'shirt', 'jeans', 'skirt', 'jacket', 'sweater', 'pants', 'blouse', 'coat', 'shorts',
  'suit', 'blazer', 'cardigan', 'hoodie', 'vest', 'scarf', 'tie', 'belt', 'hat', 'cap',
  
  // Fashion and style terms
  'fashion', 'style', 'outfit', 'clothing', 'apparel', 'garment', 'attire', 'wear', 'fabric', 'textile',
  'designer', 'boutique', 'wardrobe', 'trendy', 'elegant', 'casual', 'formal', 'vintage', 'modern', 'chic',
  
  // Colors + clothing
  'black dress', 'white shirt', 'blue jeans', 'red jacket', 'green sweater', 'yellow skirt', 'pink blouse',
  'purple coat', 'brown pants', 'gray suit', 'navy blazer', 'orange top', 'beige cardigan', 'cream dress',
  
  // Materials + clothing
  'cotton shirt', 'silk dress', 'wool sweater', 'denim jacket', 'leather jacket', 'linen pants', 'satin blouse',
  'velvet dress', 'cashmere sweater', 'polyester shirt', 'chiffon dress', 'corduroy pants', 'fleece jacket',
  
  // Seasonal clothing
  'summer dress', 'winter coat', 'spring jacket', 'autumn sweater', 'beach wear', 'swimwear', 'activewear',
  'sportswear', 'workwear', 'evening dress', 'party dress', 'cocktail dress', 'wedding dress', 'prom dress',
  
  // Style variations
  'slim fit', 'loose fit', 'oversized', 'cropped', 'long sleeve', 'short sleeve', 'sleeveless', 'button up',
  'zip up', 'pullover', 'wrap dress', 'shift dress', 'maxi dress', 'mini dress', 'midi dress', 'a-line',
  
  // International fashion
  'kimono', 'sari', 'kaftan', 'poncho', 'tunic', 'toga', 'kilt', 'sarong', 'shawl', 'wrap',
  
  // Accessories that might return clothing
  'fashion accessory', 'style accessory', 'clothing accessory', 'wardrobe essential', 'fashion piece',
  
  // Additional specific terms
  'uniform', 'costume', 'gown', 'robe', 'jumpsuit', 'romper', 'overall', 'leggings', 'tights', 'stockings',
  'underwear', 'lingerie', 'bra', 'panties', 'boxers', 'briefs', 'undershirt', 'camisole', 'slip', 'nightgown',
  
  // Professional wear
  'business suit', 'office wear', 'professional attire', 'work clothes', 'corporate wear', 'uniform shirt',
  
  // Seasonal and weather-specific
  'raincoat', 'windbreaker', 'puffer jacket', 'trench coat', 'peacoat', 'bomber jacket', 'denim jacket',
  'leather coat', 'fur coat', 'down jacket', 'fleece vest', 'thermal wear', 'base layer',
  
  // Youth and age-specific
  'teen fashion', 'youth clothing', 'kids wear', 'children clothing', 'baby clothes', 'toddler wear',
  'maternity wear', 'plus size', 'petite size', 'tall size',
  
  // Occasion-specific
  'party wear', 'club wear', 'festival clothing', 'concert outfit', 'travel wear', 'vacation outfit',
  'gym clothes', 'yoga wear', 'running gear', 'cycling outfit', 'hiking clothes', 'outdoor wear',
  
  // Pattern and design
  'striped shirt', 'polka dot dress', 'floral dress', 'plaid shirt', 'checkered shirt', 'geometric pattern',
  'paisley scarf', 'tribal print', 'animal print', 'leopard print', 'zebra print', 'snake print'
];

const expandedGiftKeywords = [
  // Personal gifts
  'gift', 'present', 'birthday gift', 'anniversary gift', 'wedding gift', 'graduation gift', 'holiday gift',
  'christmas gift', 'valentine gift', 'mother day gift', 'father day gift', 'baby shower gift',
  
  // Jewelry and accessories
  'jewelry', 'necklace', 'bracelet', 'earrings', 'ring', 'pendant', 'chain', 'watch', 'cufflinks',
  'brooch', 'tiara', 'crown', 'hair accessory', 'hair clip', 'headband', 'hair tie',
  
  // Home and decor
  'home decor', 'wall art', 'painting', 'sculpture', 'vase', 'candle', 'candle holder', 'lamp',
  'picture frame', 'photo frame', 'mirror', 'clock', 'pillow', 'cushion', 'throw', 'blanket',
  
  // Kitchen and dining
  'kitchenware', 'dinnerware', 'tableware', 'plate', 'bowl', 'cup', 'mug', 'glass', 'wine glass',
  'champagne glass', 'tea set', 'coffee set', 'cutlery', 'knife', 'fork', 'spoon', 'serving tray',
  
  // Books and stationery
  'book', 'notebook', 'diary', 'journal', 'planner', 'calendar', 'pen', 'pencil', 'marker',
  'bookmark', 'paperweight', 'desk organizer', 'file folder', 'envelope', 'greeting card',
  
  // Tech gifts
  'gadget', 'electronics', 'headphones', 'speaker', 'phone case', 'tablet', 'laptop', 'camera',
  'smart watch', 'fitness tracker', 'power bank', 'charger', 'USB cable', 'keyboard', 'mouse',
  
  // Toys and games
  'toy', 'game', 'puzzle', 'board game', 'card game', 'doll', 'action figure', 'stuffed animal',
  'teddy bear', 'plush toy', 'building blocks', 'lego', 'remote control car', 'drone', 'robot',
  
  // Beauty and wellness
  'perfume', 'cologne', 'skincare', 'makeup', 'cosmetics', 'lipstick', 'nail polish', 'face mask',
  'bath bomb', 'soap', 'shampoo', 'lotion', 'cream', 'essential oil', 'aromatherapy', 'massage oil',
  
  // Sports and fitness
  'sports equipment', 'fitness gear', 'exercise equipment', 'yoga mat', 'dumbbells', 'resistance band',
  'water bottle', 'gym bag', 'sports bag', 'tennis racket', 'golf club', 'basketball', 'football',
  
  // Art and craft
  'art supplies', 'paint', 'brush', 'canvas', 'sketchbook', 'colored pencils', 'markers', 'crayons',
  'craft kit', 'sewing kit', 'knitting yarn', 'embroidery', 'origami paper', 'scrapbook', 'stickers',
  
  // Food and beverages
  'gourmet food', 'chocolate', 'candy', 'sweets', 'cake', 'cookies', 'wine', 'champagne', 'tea',
  'coffee', 'spices', 'honey', 'jam', 'nuts', 'dried fruit', 'gift basket', 'hamper',
  
  // Garden and plants
  'plant', 'flower', 'succulent', 'bonsai', 'garden tools', 'watering can', 'flower pot', 'planter',
  'seeds', 'bulbs', 'fertilizer', 'garden decoration', 'wind chime', 'bird feeder', 'garden gnome',
  
  // Travel accessories
  'luggage', 'suitcase', 'travel bag', 'backpack', 'passport holder', 'luggage tag', 'travel pillow',
  'travel organizer', 'packing cubes', 'travel adapter', 'travel mug', 'thermos', 'cooler bag',
  
  // Personalized items
  'custom mug', 'personalized frame', 'engraved gift', 'monogrammed item', 'custom jewelry',
  'photo gift', 'custom calendar', 'personalized book', 'custom artwork', 'engraved watch',
  
  // Collectibles
  'collectible', 'figurine', 'statue', 'coin', 'stamp', 'antique', 'vintage item', 'memorabilia',
  'souvenir', 'keepsake', 'trophy', 'award', 'medal', 'certificate', 'plaque'
];

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

// Function to fetch image from Pixabay with uniqueness check
async function fetchUniqueImageFromPixabay(keyword, existingUrls, existingPhotographers, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const encodedKeyword = encodeURIComponent(keyword);
      const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodedKeyword}&image_type=photo&orientation=all&min_width=400&min_height=300&per_page=20&safesearch=true`;
      
      console.log(`Fetching "${keyword}" (attempt ${attempt}/${maxRetries})`);
      
      const response = await makeRequest(url);
      
      if (response.hits && response.hits.length > 0) {
        // Try to find a unique image from the results
        for (const image of response.hits) {
          const imageUrl = image.webformatURL;
          const photographer = image.user;
          
          // Check if this URL and photographer combination is unique
          if (!existingUrls.has(imageUrl) && !existingPhotographers.has(photographer)) {
            existingUrls.add(imageUrl);
            existingPhotographers.add(photographer);
            
            return {
              keyword: keyword,
              name: keyword,
              image_url: imageUrl,
              source: 'pixabay',
              attribution: {
                photographer: photographer,
                photographer_url: `https://pixabay.com/users/${photographer}-${image.user_id}/`,
                photo_url: image.pageURL
              },
              pixabay_id: image.id,
              tags: image.tags
            };
          }
        }
        
        console.log(`No unique image found for "${keyword}" on attempt ${attempt}`);
      } else {
        console.log(`No images found for "${keyword}" on attempt ${attempt}`);
      }
      
    } catch (error) {
      console.log(`Error fetching "${keyword}" on attempt ${attempt}: ${error.message}`);
    }
    
    // Wait before retry
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return null; // No unique image found
}

// Function to get category for clothing
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

// Main function to fetch remaining images
async function fetchRemainingImages() {
  console.log('🚀 FETCHING REMAINING 1133 IMAGES WITH UNIQUE URLS AND PHOTOGRAPHERS');
  console.log('=================================================================\n');
  
  // Save current working images first
  const currentWorkingImages = saveCurrentImages();
  
  // Get existing URLs and photographers to avoid duplicates
  const existingUrls = new Set(currentWorkingImages.map(img => img.image_url));
  const existingPhotographers = new Set(currentWorkingImages.map(img => img.attribution.photographer));
  
  console.log(`Starting with ${existingUrls.size} existing URLs and ${existingPhotographers.size} existing photographers\n`);
  
  const newImages = [];
  const targetCount = 1133;
  
  // Combine clothing and gift keywords and shuffle for variety
  const allKeywords = [...expandedClothingKeywords, ...expandedGiftKeywords];
  
  // Shuffle keywords for better variety
  for (let i = allKeywords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allKeywords[i], allKeywords[j]] = [allKeywords[j], allKeywords[i]];
  }
  
  console.log(`Trying to fetch ${targetCount} new unique images from ${allKeywords.length} keywords...\n`);
  
  let processed = 0;
  
  for (const keyword of allKeywords) {
    if (newImages.length >= targetCount) break;
    
    const newImage = await fetchUniqueImageFromPixabay(keyword, existingUrls, existingPhotographers);
    
    if (newImage) {
      // Assign category
      newImage.category = getCategoryForClothing(keyword);
      newImage.id = currentWorkingImages.length + newImages.length + 1;
      
      newImages.push(newImage);
      console.log(`✅ Added unique image ${newImages.length}/${targetCount}: "${keyword}" by ${newImage.attribution.photographer}`);
    }
    
    processed++;
    
    if (processed % 50 === 0) {
      console.log(`\n📊 Progress: Processed ${processed} keywords, Found ${newImages.length} unique images`);
      console.log(`📊 Success rate: ${Math.round(newImages.length/processed*100)}%`);
      console.log(`📊 Remaining needed: ${targetCount - newImages.length}\n`);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`\n=== FINAL RESULTS ===`);
  console.log(`Target: ${targetCount} new images`);
  console.log(`Found: ${newImages.length} unique images`);
  console.log(`Success rate: ${Math.round(newImages.length/allKeywords.length*100)}%`);
  
  if (newImages.length > 0) {
    // Combine with existing working images
    const allWorkingImages = [...currentWorkingImages, ...newImages];
    
    // Create new catalog
    const newCatalog = {
      metadata: {
        total_keywords: allWorkingImages.length,
        successful_images: allWorkingImages.length,
        placeholder_images: 0,
        last_updated: new Date().toISOString(),
        api_source: 'pixabay',
        unique_urls: allWorkingImages.length,
        unique_photographers: new Set(allWorkingImages.map(img => img.attribution.photographer)).size
      },
      images: allWorkingImages
    };
    
    // Save new catalog
    fs.writeFileSync('../data/clothing-catalog.json', JSON.stringify(newCatalog, null, 2));
    console.log(`\n✅ Updated clothing catalog with ${allWorkingImages.length} total unique images`);
    
    // Save new images separately
    fs.writeFileSync('new_unique_images.json', JSON.stringify({
      metadata: {
        count: newImages.length,
        fetched_date: new Date().toISOString()
      },
      images: newImages
    }, null, 2));
    console.log(`✅ Saved ${newImages.length} new images to new_unique_images.json`);
    
    console.log(`\n🎉 FINAL TOTALS:`);
    console.log(`Total working images: ${allWorkingImages.length}`);
    console.log(`Unique URLs: ${newCatalog.metadata.unique_urls}`);
    console.log(`Unique photographers: ${newCatalog.metadata.unique_photographers}`);
    console.log(`All images are real Pixabay photos (no placeholders)`);
  } else {
    console.log('\n❌ No new unique images found. All keywords returned duplicate URLs/photographers.');
  }
}

// Run the script
fetchRemainingImages();
