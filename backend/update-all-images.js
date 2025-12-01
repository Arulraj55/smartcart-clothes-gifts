/**
 * Update All Product Images with Content-Related Pixabay Images
 * This script fetches relevant images for each product based on its name
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const PIXABAY_API_KEY = '51575401-bb623edd55d98049d535f54dd';

// Rate limiting: Pixabay allows 100 requests per minute
const DELAY_MS = 650; // ~90 requests per minute to be safe

// Search term mappings for better image matches
const clothingSearchTerms = {
  'saree': 'indian saree woman',
  'kurta': 'indian kurta traditional',
  'kurti': 'indian kurti woman',
  'lehenga': 'indian lehenga bridal',
  'salwar': 'salwar kameez indian',
  'anarkali': 'anarkali dress indian',
  'churidar': 'churidar suit indian',
  'palazzo': 'palazzo pants fashion',
  'sherwani': 'sherwani indian groom',
  'dhoti': 'dhoti traditional indian',
  'blazer': 'blazer formal men',
  'jacket': 'jacket fashion',
  'coat': 'coat fashion winter',
  'jeans': 'jeans denim fashion',
  'trousers': 'trousers formal pants',
  'shirt': 'shirt fashion',
  't-shirt': 'tshirt casual fashion',
  'tshirt': 'tshirt casual fashion',
  'top': 'women top fashion',
  'blouse': 'blouse women fashion',
  'dress': 'dress women fashion',
  'gown': 'gown evening dress',
  'skirt': 'skirt women fashion',
  'shorts': 'shorts casual fashion',
  'sweater': 'sweater knit fashion',
  'cardigan': 'cardigan sweater fashion',
  'hoodie': 'hoodie casual fashion',
  'sweatshirt': 'sweatshirt casual',
  'ethnic': 'indian ethnic wear',
  'traditional': 'traditional indian clothing',
  'western': 'western wear fashion',
  'formal': 'formal wear business',
  'casual': 'casual wear fashion',
  'party': 'party wear dress',
  'bridal': 'bridal wear indian',
  'wedding': 'wedding dress indian',
  'dupatta': 'dupatta indian scarf',
  'stole': 'stole scarf fashion',
  'shawl': 'shawl wrap fashion',
  'nehru jacket': 'nehru jacket indian',
  'indo-western': 'indo western fusion',
  'fusion': 'fusion wear fashion',
  'maxi': 'maxi dress long',
  'midi': 'midi dress fashion',
  'mini': 'mini dress fashion',
  'a-line': 'a-line dress fashion',
  'asymmetric': 'asymmetric dress fashion',
  'backless': 'backless dress fashion',
  'bodycon': 'bodycon dress fitted',
  'wrap': 'wrap dress fashion',
  'tunic': 'tunic top fashion',
  'peplum': 'peplum top fashion',
  'crop top': 'crop top fashion',
  'tank top': 'tank top fashion',
  'camisole': 'camisole top fashion',
  'jumpsuit': 'jumpsuit women fashion',
  'romper': 'romper playsuit fashion',
  'co-ord': 'co-ord set matching',
  'suit': 'suit formal business',
  'waistcoat': 'waistcoat vest formal',
  'overcoat': 'overcoat winter fashion',
  'trench': 'trench coat fashion',
  'denim': 'denim jacket jeans',
  'leather': 'leather jacket fashion',
  'bomber': 'bomber jacket fashion',
  'puffer': 'puffer jacket winter',
  'windbreaker': 'windbreaker jacket',
  'raincoat': 'raincoat waterproof',
  'poncho': 'poncho fashion wrap',
  'cape': 'cape fashion wrap',
  'kimono': 'kimono robe fashion',
  'kaftan': 'kaftan dress loose',
  'abaya': 'abaya modest fashion',
  'hijab': 'hijab modest fashion',
  'pajama': 'pajama sleepwear',
  'nightwear': 'nightwear sleepwear',
  'loungewear': 'loungewear comfortable',
  'sportswear': 'sportswear athletic',
  'activewear': 'activewear fitness',
  'swimwear': 'swimwear beach',
  'lingerie': 'lingerie fashion',
  'innerwear': 'innerwear undergarments',
};

const giftSearchTerms = {
  'mug': 'coffee mug ceramic',
  'cup': 'cup ceramic gift',
  'photo frame': 'photo frame decorative',
  'frame': 'picture frame gift',
  'candle': 'candle decorative scented',
  'vase': 'vase decorative flowers',
  'cushion': 'cushion pillow decorative',
  'pillow': 'pillow decorative gift',
  'blanket': 'blanket cozy gift',
  'throw': 'throw blanket decorative',
  'lamp': 'lamp decorative light',
  'clock': 'clock decorative wall',
  'watch': 'watch wristwatch gift',
  'wallet': 'wallet leather gift',
  'bag': 'bag handbag gift',
  'purse': 'purse handbag fashion',
  'backpack': 'backpack bag travel',
  'suitcase': 'suitcase luggage travel',
  'jewelry': 'jewelry gift box',
  'necklace': 'necklace jewelry gift',
  'bracelet': 'bracelet jewelry gift',
  'earring': 'earrings jewelry gift',
  'ring': 'ring jewelry gift',
  'pendant': 'pendant necklace jewelry',
  'perfume': 'perfume fragrance gift',
  'cologne': 'cologne fragrance men',
  'skincare': 'skincare beauty gift',
  'makeup': 'makeup cosmetics gift',
  'cosmetic': 'cosmetic beauty gift',
  'spa': 'spa gift set relaxation',
  'bath': 'bath gift set',
  'soap': 'soap handmade gift',
  'lotion': 'lotion skincare gift',
  'chocolate': 'chocolate gift box',
  'candy': 'candy sweets gift',
  'cookie': 'cookies gift box',
  'cake': 'cake dessert gift',
  'wine': 'wine bottle gift',
  'champagne': 'champagne bottle celebration',
  'tea': 'tea set gift',
  'coffee': 'coffee gift set',
  'book': 'book gift reading',
  'journal': 'journal notebook gift',
  'diary': 'diary notebook gift',
  'pen': 'pen writing gift',
  'stationery': 'stationery gift set',
  'art': 'art print decorative',
  'painting': 'painting art decorative',
  'sculpture': 'sculpture art decorative',
  'figurine': 'figurine decorative gift',
  'plant': 'plant indoor gift',
  'flower': 'flower bouquet gift',
  'succulent': 'succulent plant gift',
  'terrarium': 'terrarium plant gift',
  'garden': 'garden gift set',
  'tool': 'tool set gift',
  'gadget': 'gadget electronic gift',
  'speaker': 'speaker bluetooth gift',
  'headphone': 'headphones audio gift',
  'earbuds': 'earbuds wireless gift',
  'phone': 'phone accessory gift',
  'tablet': 'tablet accessory gift',
  'laptop': 'laptop accessory gift',
  'camera': 'camera photography gift',
  'drone': 'drone camera gift',
  'game': 'game board gift',
  'puzzle': 'puzzle game gift',
  'toy': 'toy gift children',
  'stuffed': 'stuffed animal toy',
  'teddy': 'teddy bear gift',
  'doll': 'doll toy gift',
  'lego': 'lego building blocks',
  'model': 'model kit gift',
  'craft': 'craft kit diy',
  'diy': 'diy craft kit',
  'sewing': 'sewing kit gift',
  'knitting': 'knitting kit gift',
  'cooking': 'cooking utensils gift',
  'kitchen': 'kitchen gift set',
  'cutlery': 'cutlery set gift',
  'dinnerware': 'dinnerware set gift',
  'glassware': 'glassware set gift',
  'barware': 'barware set gift',
  'coaster': 'coaster set decorative',
  'tray': 'tray serving decorative',
  'bowl': 'bowl decorative gift',
  'plate': 'plate decorative gift',
  'jar': 'jar decorative storage',
  'box': 'gift box decorative',
  'basket': 'basket gift hamper',
  'hamper': 'gift hamper basket',
  'personalized': 'personalized custom gift',
  'custom': 'custom personalized gift',
  'engraved': 'engraved gift custom',
  'monogram': 'monogram personalized gift',
  'hand-painted': 'hand painted art gift',
  'handmade': 'handmade craft gift',
  'artisan': 'artisan handmade gift',
  'vintage': 'vintage antique gift',
  'antique': 'antique vintage gift',
  'fridge magnet': 'fridge magnet decorative',
  'keychain': 'keychain gift accessory',
  'bookmark': 'bookmark reading gift',
  'ornament': 'ornament decorative gift',
  'decor': 'home decor gift',
  'decorative': 'decorative item gift',
};

// Function to get best search term for a product
function getSearchTerm(productName, isClothing) {
  const name = productName.toLowerCase();
  const terms = isClothing ? clothingSearchTerms : giftSearchTerms;
  
  // Try to find a matching term
  for (const [key, value] of Object.entries(terms)) {
    if (name.includes(key)) {
      return value;
    }
  }
  
  // Fallback: use product name with category context
  if (isClothing) {
    return `${productName} fashion clothing`;
  } else {
    return `${productName} gift`;
  }
}

// Function to fetch image from Pixabay
function fetchPixabayImage(searchTerm) {
  return new Promise((resolve, reject) => {
    const query = encodeURIComponent(searchTerm);
    const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${query}&image_type=photo&orientation=vertical&safesearch=true&per_page=5&min_width=400&min_height=500`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.hits && json.hits.length > 0) {
            // Pick a random image from top 5 results for variety
            const randomIndex = Math.floor(Math.random() * Math.min(json.hits.length, 5));
            const hit = json.hits[randomIndex];
            resolve({
              url: hit.webformatURL,
              largeUrl: hit.largeImageURL,
              photographer: hit.user,
              pixabayId: hit.id
            });
          } else {
            resolve(null);
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Sleep function for rate limiting
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function to update all images
async function updateAllImages() {
  console.log('🚀 Starting image update process...\n');
  
  // Paths to catalog files
  const clothingPath = path.join(__dirname, '../frontend/src/data/clothing-catalog.json');
  const giftsPath = path.join(__dirname, '../frontend/src/data/gifts-catalog.json');
  
  // Read catalogs
  console.log('📖 Reading catalog files...');
  let clothingCatalog = JSON.parse(fs.readFileSync(clothingPath, 'utf8'));
  let giftsCatalog = JSON.parse(fs.readFileSync(giftsPath, 'utf8'));
  
  console.log(`   Found ${clothingCatalog.length} clothing items`);
  console.log(`   Found ${giftsCatalog.length} gift items\n`);
  
  // Update clothing images
  console.log('👗 Updating clothing images...\n');
  let clothingUpdated = 0;
  let clothingFailed = 0;
  
  for (let i = 0; i < clothingCatalog.length; i++) {
    const product = clothingCatalog[i];
    const searchTerm = getSearchTerm(product.name, true);
    
    try {
      const imageData = await fetchPixabayImage(searchTerm);
      
      if (imageData) {
        clothingCatalog[i].image = imageData.largeUrl;
        clothingCatalog[i].source = 'pixabay';
        clothingCatalog[i].attribution = `Photo by ${imageData.photographer} on Pixabay`;
        clothingCatalog[i].photographer = imageData.photographer;
        clothingCatalog[i].pixabay_id = imageData.pixabayId;
        clothingUpdated++;
        console.log(`✅ [${i + 1}/${clothingCatalog.length}] ${product.name} → "${searchTerm}"`);
      } else {
        clothingFailed++;
        console.log(`⚠️ [${i + 1}/${clothingCatalog.length}] ${product.name} - No image found for "${searchTerm}"`);
      }
    } catch (error) {
      clothingFailed++;
      console.log(`❌ [${i + 1}/${clothingCatalog.length}] ${product.name} - Error: ${error.message}`);
    }
    
    // Rate limiting
    await sleep(DELAY_MS);
    
    // Save progress every 50 items
    if ((i + 1) % 50 === 0) {
      fs.writeFileSync(clothingPath, JSON.stringify(clothingCatalog, null, 2));
      console.log(`\n💾 Progress saved at ${i + 1} clothing items\n`);
    }
  }
  
  // Save final clothing catalog
  fs.writeFileSync(clothingPath, JSON.stringify(clothingCatalog, null, 2));
  console.log(`\n✅ Clothing catalog saved! Updated: ${clothingUpdated}, Failed: ${clothingFailed}\n`);
  
  // Update gift images
  console.log('🎁 Updating gift images...\n');
  let giftsUpdated = 0;
  let giftsFailed = 0;
  
  for (let i = 0; i < giftsCatalog.length; i++) {
    const product = giftsCatalog[i];
    const searchTerm = getSearchTerm(product.name, false);
    
    try {
      const imageData = await fetchPixabayImage(searchTerm);
      
      if (imageData) {
        giftsCatalog[i].image = imageData.largeUrl;
        giftsCatalog[i].source = 'pixabay';
        giftsCatalog[i].attribution = `Photo by ${imageData.photographer} on Pixabay`;
        giftsCatalog[i].photographer = imageData.photographer;
        giftsCatalog[i].pixabay_id = imageData.pixabayId;
        giftsUpdated++;
        console.log(`✅ [${i + 1}/${giftsCatalog.length}] ${product.name} → "${searchTerm}"`);
      } else {
        giftsFailed++;
        console.log(`⚠️ [${i + 1}/${giftsCatalog.length}] ${product.name} - No image found for "${searchTerm}"`);
      }
    } catch (error) {
      giftsFailed++;
      console.log(`❌ [${i + 1}/${giftsCatalog.length}] ${product.name} - Error: ${error.message}`);
    }
    
    // Rate limiting
    await sleep(DELAY_MS);
    
    // Save progress every 50 items
    if ((i + 1) % 50 === 0) {
      fs.writeFileSync(giftsPath, JSON.stringify(giftsCatalog, null, 2));
      console.log(`\n💾 Progress saved at ${i + 1} gift items\n`);
    }
  }
  
  // Save final gifts catalog
  fs.writeFileSync(giftsPath, JSON.stringify(giftsCatalog, null, 2));
  console.log(`\n✅ Gifts catalog saved! Updated: ${giftsUpdated}, Failed: ${giftsFailed}\n`);
  
  // Summary
  console.log('═'.repeat(50));
  console.log('📊 SUMMARY');
  console.log('═'.repeat(50));
  console.log(`Clothing: ${clothingUpdated} updated, ${clothingFailed} failed`);
  console.log(`Gifts: ${giftsUpdated} updated, ${giftsFailed} failed`);
  console.log(`Total: ${clothingUpdated + giftsUpdated} updated, ${clothingFailed + giftsFailed} failed`);
  console.log('═'.repeat(50));
  console.log('\n🎉 Image update complete!');
}

// Run the script
updateAllImages().catch(console.error);
