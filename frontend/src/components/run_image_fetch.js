const readline = require('readline');
const { execSync } = require('child_process');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🖼️  Pixabay Image Fetcher for SmartCart');
console.log('=====================================');
console.log('This script will fetch 1500 images:');
console.log('- 1000 clothing images');
console.log('- 500 gift images');
console.log('');

rl.question('Please enter your Pixabay API key: ', (apiKey) => {
  if (!apiKey || apiKey.trim() === '') {
    console.log('❌ No API key provided. Exiting...');
    rl.close();
    return;
  }
  
  try {
    // Read the fetch_images.js file and replace the API key
    let scriptContent = fs.readFileSync('fetch_images.js', 'utf8');
    scriptContent = scriptContent.replace('YOUR_PIXABAY_API_KEY', apiKey.trim());
    
    // Write the updated script to a temporary file
    fs.writeFileSync('fetch_images_with_key.js', scriptContent);
    
    console.log('✅ API key set successfully!');
    console.log('🚀 Starting image fetch process...');
    console.log('');
    
    // Run the image fetching script
    execSync('node fetch_images_with_key.js', { stdio: 'inherit' });
    
    // Clean up the temporary file
    fs.unlinkSync('fetch_images_with_key.js');
    
    console.log('');
    console.log('🎉 Image fetching completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
});

rl.on('close', () => {
  console.log('Goodbye! 👋');
});
