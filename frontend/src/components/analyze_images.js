const fs = require('fs');
const https = require('https');

// Function to check if an image URL is working
function checkImageUrl(url) {
  return new Promise((resolve) => {
    if (url.includes('dummyimage.com') || url.includes('placeholder')) {
      resolve(false); // It's a placeholder
      return;
    }
    
    const request = https.get(url, (response) => {
      resolve(response.statusCode === 200);
    });
    
    request.on('error', () => {
      resolve(false);
    });
    
    request.setTimeout(5000, () => {
      request.abort();
      resolve(false);
    });
  });
}

// Function to analyze clothing catalog
async function analyzeClothingCatalog() {
  try {
    const clothingData = JSON.parse(fs.readFileSync('../data/clothing-catalog.json', 'utf8'));
    const images = clothingData.images || [];
    
    console.log('=== CLOTHING CATALOG ANALYSIS ===');
    console.log(`Total clothing items: ${images.length}`);
    
    // Check unique URLs
    const urls = images.map(img => img.image_url).filter(url => url);
    const uniqueUrls = [...new Set(urls)];
    console.log(`Total URLs: ${urls.length}`);
    console.log(`Unique URLs: ${uniqueUrls.length}`);
    console.log(`Duplicate URLs: ${urls.length - uniqueUrls.length}`);
    
    // Check unique photographers
    const photographers = images
      .filter(img => img.attribution && img.attribution.photographer)
      .map(img => img.attribution.photographer);
    const uniquePhotographers = [...new Set(photographers)];
    console.log(`Total photographers: ${photographers.length}`);
    console.log(`Unique photographers: ${uniquePhotographers.length}`);
    console.log(`Duplicate photographers: ${photographers.length - uniquePhotographers.length}`);
    
    // Count Pixabay vs Placeholder images
    const pixabayImages = images.filter(img => img.source === 'pixabay');
    const placeholderImages = images.filter(img => img.source === 'placeholder' || img.source === 'generated');
    
    console.log(`Pixabay images: ${pixabayImages.length}`);
    console.log(`Placeholder/Generated images: ${placeholderImages.length}`);
    
    // Test a sample of working URLs (first 10 Pixabay images)
    console.log('\nTesting sample Pixabay image URLs...');
    const sampleUrls = pixabayImages.slice(0, 10).map(img => img.image_url);
    let workingCount = 0;
    
    for (let i = 0; i < sampleUrls.length; i++) {
      const isWorking = await checkImageUrl(sampleUrls[i]);
      if (isWorking) workingCount++;
      console.log(`Sample ${i + 1}: ${isWorking ? 'Working' : 'Not Working'}`);
    }
    
    console.log(`Sample working rate: ${workingCount}/${sampleUrls.length} (${Math.round(workingCount/sampleUrls.length*100)}%)`);
    
    return {
      total: images.length,
      uniqueUrls: uniqueUrls.length,
      uniquePhotographers: uniquePhotographers.length,
      pixabayImages: pixabayImages.length,
      placeholderImages: placeholderImages.length,
      estimatedWorking: Math.round(pixabayImages.length * (workingCount / sampleUrls.length))
    };
    
  } catch (error) {
    console.error('Error analyzing clothing catalog:', error.message);
    return null;
  }
}

// Function to analyze gifts page
async function analyzeGiftsPage() {
  try {
    const giftsContent = fs.readFileSync('GiftsPage.js', 'utf8');
    const giftItemsMatch = giftsContent.match(/const giftItems = \[([\s\S]*?)\];/);
    
    if (!giftItemsMatch) {
      console.log('Could not find giftItems array in GiftsPage.js');
      return null;
    }
    
    console.log('\n=== GIFTS PAGE ANALYSIS ===');
    
    // Parse gift items from the file
    const itemsStr = giftItemsMatch[1];
    const giftItems = itemsStr.split(',').map(item => item.trim().replace(/^"|"$/g, '')).filter(item => item.length > 0);
    
    console.log(`Total gift items: ${giftItems.length}`);
    
    // Check for duplicates in gift items
    const uniqueGiftItems = [...new Set(giftItems)];
    console.log(`Unique gift items: ${uniqueGiftItems.length}`);
    console.log(`Duplicate gift items: ${giftItems.length - uniqueGiftItems.length}`);
    
    // Note: Gift items in GiftsPage.js are just text strings, not image objects
    // The actual images are generated dynamically with placeholder URLs
    console.log('\nNote: Gift items in GiftsPage.js are text-only.');
    console.log('Images are generated dynamically as placeholders during runtime.');
    console.log('For actual gift images from Pixabay, we would need to run a separate fetch.');
    
    return {
      total: giftItems.length,
      unique: uniqueGiftItems.length,
      duplicates: giftItems.length - uniqueGiftItems.length
    };
    
  } catch (error) {
    console.error('Error analyzing gifts page:', error.message);
    return null;
  }
}

// Function to find duplicate URLs and photographers in clothing catalog
function findDuplicates() {
  try {
    const clothingData = JSON.parse(fs.readFileSync('../data/clothing-catalog.json', 'utf8'));
    const images = clothingData.images || [];
    
    console.log('\n=== DUPLICATE ANALYSIS ===');
    
    // Find duplicate URLs
    const urlMap = new Map();
    images.forEach((img, index) => {
      if (img.image_url) {
        if (!urlMap.has(img.image_url)) {
          urlMap.set(img.image_url, []);
        }
        urlMap.get(img.image_url).push(index + 1);
      }
    });
    
    const duplicateUrls = Array.from(urlMap.entries()).filter(([url, indices]) => indices.length > 1);
    
    if (duplicateUrls.length > 0) {
      console.log('Duplicate URLs found:');
      duplicateUrls.slice(0, 5).forEach(([url, indices]) => {
        console.log(`  URL: ${url.substring(0, 50)}... (used by items: ${indices.join(', ')})`);
      });
      if (duplicateUrls.length > 5) {
        console.log(`  ... and ${duplicateUrls.length - 5} more duplicate URLs`);
      }
    } else {
      console.log('No duplicate URLs found!');
    }
    
    // Find duplicate photographers
    const photographerMap = new Map();
    images.forEach((img, index) => {
      if (img.attribution && img.attribution.photographer && img.source === 'pixabay') {
        const photographer = img.attribution.photographer;
        if (!photographerMap.has(photographer)) {
          photographerMap.set(photographer, []);
        }
        photographerMap.get(photographer).push(index + 1);
      }
    });
    
    const duplicatePhotographers = Array.from(photographerMap.entries()).filter(([photographer, indices]) => indices.length > 1);
    
    if (duplicatePhotographers.length > 0) {
      console.log('\nDuplicate photographers found:');
      duplicatePhotographers.slice(0, 5).forEach(([photographer, indices]) => {
        console.log(`  ${photographer}: ${indices.length} images (items: ${indices.slice(0, 5).join(', ')}${indices.length > 5 ? '...' : ''})`);
      });
      if (duplicatePhotographers.length > 5) {
        console.log(`  ... and ${duplicatePhotographers.length - 5} more photographers with duplicates`);
      }
    } else {
      console.log('No duplicate photographers found!');
    }
    
  } catch (error) {
    console.error('Error finding duplicates:', error.message);
  }
}

// Main analysis function
async function main() {
  console.log('🔍 ANALYZING FETCHED IMAGES');
  console.log('===========================\n');
  
  const clothingResults = await analyzeClothingCatalog();
  const giftsResults = await analyzeGiftsPage();
  
  findDuplicates();
  
  console.log('\n=== FINAL SUMMARY ===');
  
  if (clothingResults) {
    console.log('CLOTHING CATALOG:');
    console.log(`  Total items: ${clothingResults.total}`);
    console.log(`  Unique URLs: ${clothingResults.uniqueUrls}`);
    console.log(`  Unique photographers: ${clothingResults.uniquePhotographers}`);
    console.log(`  Real Pixabay images: ${clothingResults.pixabayImages}`);
    console.log(`  Placeholder images: ${clothingResults.placeholderImages}`);
    console.log(`  Estimated working images: ${clothingResults.estimatedWorking}`);
  }
  
  if (giftsResults) {
    console.log('\nGIFT ITEMS:');
    console.log(`  Total items: ${giftsResults.total}`);
    console.log(`  Unique items: ${giftsResults.unique}`);
    console.log(`  Duplicates: ${giftsResults.duplicates}`);
    console.log(`  Note: Gift items use placeholder images (no Pixabay fetch)`);
  }
  
  const totalRealImages = clothingResults ? clothingResults.pixabayImages : 0;
  const totalUniqueUrls = clothingResults ? clothingResults.uniqueUrls : 0;
  const totalUniquePhotographers = clothingResults ? clothingResults.uniquePhotographers : 0;
  
  console.log('\nOVERALL STATISTICS:');
  console.log(`  Total real images from Pixabay: ${totalRealImages}`);
  console.log(`  Total unique URLs: ${totalUniqueUrls}`);
  console.log(`  Total unique photographers: ${totalUniquePhotographers}`);
  console.log(`  Working images (non-placeholders): ${totalRealImages}`);
}

// Run the analysis
main();
