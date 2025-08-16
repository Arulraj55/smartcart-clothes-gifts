const fs = require('fs');
const clothingData = JSON.parse(fs.readFileSync('../data/clothing-catalog.json', 'utf8'));
const items = clothingData.images.map(item => item.keyword || item.name);
const uniqueItems = [...new Set(items)];

console.log('Total clothing items:', items.length);
console.log('Unique clothing items:', uniqueItems.length);
console.log('Duplicates found:', items.length - uniqueItems.length);

if (items.length !== uniqueItems.length) {
  const duplicates = items.filter((item, index) => items.indexOf(item) !== index);
  console.log('Duplicate items:', [...new Set(duplicates)]);
}
