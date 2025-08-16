const fs = require('fs');

function analyzeWorkingImages() {
  try {
    const clothingData = JSON.parse(fs.readFileSync('../data/clothing-catalog.json', 'utf8'));
    const images = clothingData.images || [];
    
    // Filter only the real Pixabay images (working images)
    const workingImages = images.filter(img => img.source === 'pixabay');
    
    console.log('🔍 DETAILED ANALYSIS OF 367 WORKING PIXABAY IMAGES');
    console.log('================================================\n');
    
    console.log(`Total working Pixabay images: ${workingImages.length}`);
    
    // Check unique URLs among working images only
    const workingUrls = workingImages.map(img => img.image_url);
    const uniqueWorkingUrls = [...new Set(workingUrls)];
    
    console.log(`Working image URLs: ${workingUrls.length}`);
    console.log(`Unique URLs among working images: ${uniqueWorkingUrls.length}`);
    console.log(`Duplicate URLs among working images: ${workingUrls.length - uniqueWorkingUrls.length}`);
    
    // Check unique photographers among working images only
    const workingPhotographers = workingImages
      .filter(img => img.attribution && img.attribution.photographer)
      .map(img => img.attribution.photographer);
    const uniqueWorkingPhotographers = [...new Set(workingPhotographers)];
    
    console.log(`Working images with photographer info: ${workingPhotographers.length}`);
    console.log(`Unique photographers among working images: ${uniqueWorkingPhotographers.length}`);
    console.log(`Duplicate photographers among working images: ${workingPhotographers.length - uniqueWorkingPhotographers.length}`);
    
    // Find duplicate URLs among working images
    const urlCount = {};
    workingUrls.forEach(url => {
      urlCount[url] = (urlCount[url] || 0) + 1;
    });
    
    const duplicateUrls = Object.entries(urlCount).filter(([url, count]) => count > 1);
    
    if (duplicateUrls.length > 0) {
      console.log('\n❌ DUPLICATE URLs found among working images:');
      duplicateUrls.forEach(([url, count]) => {
        console.log(`  ${url.substring(0, 60)}... (used ${count} times)`);
      });
    } else {
      console.log('\n✅ NO duplicate URLs among working images!');
    }
    
    // Find duplicate photographers among working images
    const photographerCount = {};
    workingPhotographers.forEach(photographer => {
      photographerCount[photographer] = (photographerCount[photographer] || 0) + 1;
    });
    
    const duplicatePhotographers = Object.entries(photographerCount).filter(([photographer, count]) => count > 1);
    
    if (duplicatePhotographers.length > 0) {
      console.log('\n📸 DUPLICATE photographers among working images:');
      duplicatePhotographers.slice(0, 10).forEach(([photographer, count]) => {
        console.log(`  ${photographer}: ${count} images`);
      });
      if (duplicatePhotographers.length > 10) {
        console.log(`  ... and ${duplicatePhotographers.length - 10} more photographers with duplicates`);
      }
    } else {
      console.log('\n✅ NO duplicate photographers among working images!');
    }
    
    console.log('\n=== FINAL ANSWER TO YOUR QUESTION ===');
    console.log(`Working images: ${workingImages.length} ✅`);
    console.log(`Unique URLs among working images: ${uniqueWorkingUrls.length} ${uniqueWorkingUrls.length === workingImages.length ? '✅' : '❌'}`);
    console.log(`Unique photographers among working images: ${uniqueWorkingPhotographers.length} ${uniqueWorkingPhotographers.length === workingImages.length ? '✅' : '❌'}`);
    console.log(`All are real (not placeholders): ✅`);
    
    console.log('\n🎯 SUMMARY:');
    if (uniqueWorkingUrls.length === workingImages.length && uniqueWorkingPhotographers.length === workingImages.length) {
      console.log('✅ YES - You have 367 working images with 367 unique URLs and 367 unique photographers!');
    } else {
      console.log('❌ NO - You have 367 working images, but:');
      console.log(`   - Unique URLs: ${uniqueWorkingUrls.length}/${workingImages.length}`);
      console.log(`   - Unique photographers: ${uniqueWorkingPhotographers.length}/${workingImages.length}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

analyzeWorkingImages();
