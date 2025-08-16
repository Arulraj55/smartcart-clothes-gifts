const fs = require('fs');
const { exactClothingList } = require('./verify_1000_clothing_items.js');

// Read current clothing catalog
const clothingCatalog = JSON.parse(fs.readFileSync('./frontend/src/data/clothing-catalog.json', 'utf8'));
const currentItems = clothingCatalog.images.map(item => item.keyword);

console.log(`Current catalog has: ${currentItems.length} items`);
console.log(`Exact list has: ${exactClothingList.length} items`);

// Find missing items from exact list
const missingFromCatalog = exactClothingList.filter(item => 
  !currentItems.some(currentItem => 
    currentItem.toLowerCase().includes(item.toLowerCase()) || 
    item.toLowerCase().includes(currentItem.toLowerCase())
  )
);

// Find extra items in catalog not in exact list
const extraInCatalog = currentItems.filter(item => 
  !exactClothingList.some(exactItem => 
    item.toLowerCase().includes(exactItem.toLowerCase()) || 
    exactItem.toLowerCase().includes(item.toLowerCase())
  )
);

console.log(`\nMissing from catalog (${missingFromCatalog.length} items):`);
missingFromCatalog.slice(0, 20).forEach((item, i) => console.log(`${i+1}. ${item}`));
if (missingFromCatalog.length > 20) console.log(`... and ${missingFromCatalog.length - 20} more`);

console.log(`\nExtra in catalog (${extraInCatalog.length} items):`);
extraInCatalog.slice(0, 20).forEach((item, i) => console.log(`${i+1}. ${item}`));
if (extraInCatalog.length > 20) console.log(`... and ${extraInCatalog.length - 20} more`);

// Sample current items for comparison
console.log(`\nSample current catalog items (first 10):`);
currentItems.slice(0, 10).forEach((item, i) => console.log(`${i+1}. ${item}`));

console.log(`\nSample exact list items (first 10):`);
exactClothingList.slice(0, 10).forEach((item, i) => console.log(`${i+1}. ${item}`));
