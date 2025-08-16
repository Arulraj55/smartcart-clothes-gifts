const fs = require('fs');
const contentClothes = fs.readFileSync('ClothesPage.js', 'utf8');
const clothingItemsMatch = contentClothes.match(/const clothingItems = \[([\s\S]*?)\];/);
if (clothingItemsMatch) {
  const itemsStr = clothingItemsMatch[1];
  const items = itemsStr.split(',').map(item => item.trim().replace(/^"|"$/g, '')).filter(item => item.length > 0);
  const uniqueItems = [...new Set(items)];
  console.log('Total clothing items:', items.length);
  console.log('Unique clothing items:', uniqueItems.length);
  console.log('Duplicates found:', items.length - uniqueItems.length);
  
  if (items.length !== uniqueItems.length) {
    const duplicates = items.filter((item, index) => items.indexOf(item) !== index);
    console.log('Duplicate items:', [...new Set(duplicates)]);
  }
} else {
  console.log('Could not find clothingItems array');
}
