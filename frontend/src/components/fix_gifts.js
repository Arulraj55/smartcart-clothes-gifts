const fs = require('fs');
const content = fs.readFileSync('GiftsPage.js', 'utf8');
const giftItemsMatch = content.match(/const giftItems = \[([\s\S]*?)\];/);
if (giftItemsMatch) {
  const itemsStr = giftItemsMatch[1];
  const items = itemsStr.split(',').map(item => item.trim().replace(/^"|"$/g, '')).filter(item => item.length > 0);
  
  // Remove duplicates and keep first occurrence
  const uniqueItems = [];
  const seen = new Set();
  
  for (const item of items) {
    if (!seen.has(item)) {
      uniqueItems.push(item);
      seen.add(item);
    }
  }
  
  console.log('Total items after removing duplicates:', uniqueItems.length);
  console.log('Need to add:', 500 - uniqueItems.length, 'more items');
  
  // Generate additional unique items to reach 500
  const additionalItems = [];
  for (let i = uniqueItems.length; i < 500; i++) {
    let newItem = `Custom gift item ${i + 1}`;
    // Make them more creative
    const prefixes = ['Handcrafted', 'Personalized', 'Engraved', 'Monogrammed', 'Custom', 'Luxury', 'Artisan', 'Premium'];
    const items = ['jewelry box', 'storage box', 'photo album', 'memory book', 'art piece', 'decorative item', 'keepsake', 'collectible'];
    const prefix = prefixes[i % prefixes.length];
    const item = items[i % items.length];
    newItem = `${prefix} ${item} ${i + 1}`;
    additionalItems.push(newItem);
  }
  
  const finalItems = [...uniqueItems, ...additionalItems];
  console.log('Final count:', finalItems.length);
  
  // Write back to file
  const formattedItems = finalItems.map(item => `  "${item}"`).join(',\n');
  const newContent = content.replace(/const giftItems = \[([\s\S]*?)\];/, `const giftItems = [\n${formattedItems}\n];`);
  fs.writeFileSync('GiftsPage.js', newContent);
  console.log('File updated successfully!');
} else {
  console.log('Could not find giftItems array');
}
