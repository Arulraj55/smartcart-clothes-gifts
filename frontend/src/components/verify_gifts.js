const fs = require('fs');
const content = fs.readFileSync('GiftsPage.js', 'utf8');
const giftItemsMatch = content.match(/const giftItems = \[([\s\S]*?)\];/);
if (giftItemsMatch) {
  const itemsStr = giftItemsMatch[1];
  const items = itemsStr.split(',').map(item => item.trim().replace(/^"|"$/g, '')).filter(item => item.length > 0);
  const uniqueItems = [...new Set(items)];
  console.log('Total gift items:', items.length);
  console.log('Unique gift items:', uniqueItems.length);
  console.log('Duplicates found:', items.length - uniqueItems.length);
  
  // Count teddy bear related items
  const teddyBearItems = items.filter(item => 
    item.toLowerCase().includes('teddy bear') || 
    item.toLowerCase().includes('teddy')
  );
  console.log('Teddy bear related items:', teddyBearItems.length);
  console.log('Teddy bear items list:', teddyBearItems);
  
  if (items.length !== uniqueItems.length) {
    const duplicates = items.filter((item, index) => items.indexOf(item) !== index);
    console.log('Duplicate items:', [...new Set(duplicates)]);
  }
} else {
  console.log('Could not find giftItems array');
}
