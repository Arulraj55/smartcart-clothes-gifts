/**
 * Update All Product Images with STRICTLY Content-Related Images
 * Version 2 - Much better search term mappings
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const PIXABAY_API_KEY = '51575401-bb623edd55d98049d535f54dd';
const DELAY_MS = 700;

// STRICT search term mappings - very specific to get correct images
const clothingExactTerms = {
  // Traditional Indian Women's Wear
  'saree': 'indian saree silk woman',
  'lehenga': 'lehenga choli indian wedding',
  'salwar': 'salwar kameez indian dress',
  'anarkali': 'anarkali indian dress woman',
  'sharara': 'sharara indian dress woman',
  'palazzo': 'palazzo pants woman fashion',
  'churidar': 'churidar indian woman dress',
  'ghagra': 'ghagra choli indian dress',
  'kurti': 'kurti indian woman tunic',
  'kurta': 'kurta indian traditional',
  'dupatta': 'dupatta scarf indian woman',
  'odhni': 'indian dupatta scarf woman',
  'bandhani': 'bandhani indian fabric tie dye',
  'kanjeevaram': 'silk saree indian gold',
  'banarasi': 'banarasi silk saree brocade',
  'chanderi': 'chanderi saree indian light',
  'georgette': 'georgette saree flowing',
  'chiffon': 'chiffon saree transparent',
  'cotton saree': 'cotton saree indian simple',
  'silk saree': 'silk saree indian elegant',
  'patola': 'patola saree indian geometric',
  'ikat': 'ikat fabric pattern weave',
  'tant': 'tant saree bengali cotton',
  'handloom': 'handloom saree weave traditional',
  'designer saree': 'designer saree indian party',
  'party wear': 'party dress indian glamorous',
  'wedding': 'wedding dress indian bridal',
  'casual saree': 'cotton saree daily wear',
  'office saree': 'formal saree professional',
  'printed': 'printed dress pattern woman',
  'embroidered': 'embroidered dress indian zari',
  'zari': 'zari embroidery gold thread',
  'mirror work': 'mirror work embroidery indian',
  'sequin': 'sequin dress sparkle woman',
  'net': 'net fabric dress transparent',
  
  // Men's Traditional
  'sherwani': 'sherwani indian groom wedding',
  'dhoti': 'dhoti indian man traditional',
  'nehru jacket': 'nehru jacket indian formal',
  'kurta pajama': 'kurta pajama indian man',
  'pathani': 'pathani suit indian man',
  'jodhpuri': 'jodhpuri suit indian formal',
  'bandhgala': 'bandhgala suit indian collar',
  'angarkha': 'angarkha indian traditional coat',
  'achkan': 'achkan indian long coat',
  'lungi': 'lungi indian man wrap',
  'mundu': 'mundu kerala white cloth',
  
  // Western Women's Wear
  'dress': 'woman dress elegant fashion',
  'gown': 'evening gown woman elegant',
  'maxi': 'maxi dress long woman',
  'midi': 'midi dress knee woman',
  'mini': 'mini dress short woman',
  'a-line': 'a-line dress woman flared',
  'bodycon': 'bodycon dress fitted woman',
  'wrap dress': 'wrap dress woman tied',
  'shift dress': 'shift dress woman straight',
  'sheath': 'sheath dress woman fitted',
  'skater': 'skater dress woman flared',
  'fit and flare': 'fit flare dress woman',
  'pencil dress': 'pencil dress fitted woman',
  'cocktail': 'cocktail dress party woman',
  'prom': 'prom dress formal woman',
  'sundress': 'sundress summer woman casual',
  'shirt dress': 'shirt dress woman button',
  'sweater dress': 'sweater dress knit woman',
  'slip dress': 'slip dress satin woman',
  'tube dress': 'tube dress strapless woman',
  'halter': 'halter dress neck woman',
  'off shoulder': 'off shoulder dress woman',
  'one shoulder': 'one shoulder dress asymmetric',
  'backless': 'backless dress woman elegant',
  'asymmetric': 'asymmetric dress woman modern',
  
  // Tops
  'blouse': 'blouse woman elegant top',
  'top': 'woman top fashion casual',
  'shirt': 'shirt woman formal button',
  't-shirt': 'tshirt woman casual cotton',
  'tshirt': 'tshirt woman casual cotton',
  'tank top': 'tank top woman sleeveless',
  'camisole': 'camisole top woman spaghetti',
  'crop top': 'crop top woman short',
  'tube top': 'tube top woman strapless',
  'halter top': 'halter top woman neck',
  'peplum': 'peplum top woman flared',
  'tunic': 'tunic top woman long',
  'kaftan': 'kaftan loose dress woman',
  'kimono': 'kimono robe japanese style',
  'poncho': 'poncho wrap woman cape',
  'cape': 'cape woman fashion wrap',
  'cardigan': 'cardigan woman knit sweater',
  'sweater': 'sweater woman knit warm',
  'pullover': 'pullover sweater woman',
  'hoodie': 'hoodie woman casual sweatshirt',
  'sweatshirt': 'sweatshirt woman casual',
  
  // Bottoms
  'jeans': 'jeans woman denim blue',
  'trousers': 'trousers woman formal pants',
  'pants': 'pants woman fashion',
  'leggings': 'leggings woman fitted stretch',
  'jeggings': 'jeggings woman denim stretch',
  'shorts': 'shorts woman casual summer',
  'skirt': 'skirt woman fashion knee',
  'mini skirt': 'mini skirt woman short',
  'midi skirt': 'midi skirt woman knee',
  'maxi skirt': 'maxi skirt woman long',
  'pencil skirt': 'pencil skirt woman fitted',
  'pleated skirt': 'pleated skirt woman folds',
  'a-line skirt': 'a-line skirt woman flared',
  'wrap skirt': 'wrap skirt woman tied',
  'denim skirt': 'denim skirt woman jeans',
  'culottes': 'culottes woman wide pants',
  'palazzos': 'palazzo pants woman wide',
  'capri': 'capri pants woman cropped',
  'joggers': 'joggers woman casual pants',
  'cargo': 'cargo pants woman pockets',
  'chinos': 'chinos pants woman cotton',
  
  // Outerwear
  'jacket': 'jacket woman fashion coat',
  'blazer': 'blazer woman formal jacket',
  'coat': 'coat woman winter fashion',
  'overcoat': 'overcoat woman long winter',
  'trench': 'trench coat woman classic',
  'denim jacket': 'denim jacket woman jeans',
  'leather jacket': 'leather jacket woman biker',
  'bomber': 'bomber jacket woman casual',
  'puffer': 'puffer jacket woman quilted',
  'windbreaker': 'windbreaker jacket woman light',
  'raincoat': 'raincoat woman waterproof',
  'parka': 'parka coat woman warm',
  'anorak': 'anorak jacket woman hood',
  'vest': 'vest woman sleeveless jacket',
  'waistcoat': 'waistcoat woman formal vest',
  'gilet': 'gilet vest woman quilted',
  'shrug': 'shrug woman short cardigan',
  'bolero': 'bolero jacket woman short',
  
  // Men's Western Wear
  'men shirt': 'shirt man formal button',
  'men t-shirt': 'tshirt man casual cotton',
  'polo': 'polo shirt man collar',
  'men jeans': 'jeans man denim blue',
  'men trousers': 'trousers man formal pants',
  'men shorts': 'shorts man casual summer',
  'men jacket': 'jacket man fashion coat',
  'men blazer': 'blazer man formal suit',
  'men coat': 'coat man winter fashion',
  'men suit': 'suit man formal business',
  'men sweater': 'sweater man knit warm',
  'men hoodie': 'hoodie man casual sweatshirt',
  
  // Ethnic Fusion
  'indo western': 'indo western dress fusion',
  'fusion': 'fusion dress modern indian',
  'dhoti pants': 'dhoti pants modern fusion',
  'dhoti saree': 'dhoti saree modern drape',
  'cape saree': 'cape saree modern fusion',
  'pant saree': 'pant saree modern fusion',
  'jacket lehenga': 'jacket lehenga modern',
  'crop top lehenga': 'crop top lehenga modern',
  
  // Innerwear (use modest alternatives)
  'bra': 'lingerie woman undergarment',
  'panty': 'lingerie woman undergarment',
  'brief': 'underwear garment cotton',
  'boxer': 'underwear man cotton',
  'vest innerwear': 'undershirt man cotton',
  'slip': 'slip dress woman satin',
  'camisole innerwear': 'camisole woman undergarment',
  'shapewear': 'shapewear woman body',
  'thermal': 'thermal wear winter warm',
  'bustier': 'bustier corset woman top',
  'corset': 'corset woman vintage',
  'hipster': 'underwear hipster woman',
  'bikini underwear': 'bikini underwear woman',
  'thong': 'lingerie woman elegant',
  'boyshort': 'boyshort underwear woman',
  
  // Sleepwear
  'nightgown': 'nightgown woman sleep',
  'nightdress': 'nightdress woman sleep',
  'pajama': 'pajama woman sleep cotton',
  'pyjama': 'pyjama woman sleep cotton',
  'nightsuit': 'night suit woman sleep',
  'sleepwear': 'sleepwear woman comfortable',
  'loungewear': 'loungewear woman home',
  'robe': 'robe woman bathrobe',
  
  // Activewear
  'sports bra': 'sports bra woman fitness',
  'sports top': 'sports top woman athletic',
  'track pants': 'track pants woman athletic',
  'yoga pants': 'yoga pants woman stretch',
  'gym wear': 'gym wear woman fitness',
  'sportswear': 'sportswear woman athletic',
  'activewear': 'activewear woman fitness',
  'running': 'running wear woman athletic',
  'swimwear': 'swimwear woman beach',
  'swimsuit': 'swimsuit woman beach',
  'bikini': 'bikini woman beach swimwear',
  
  // Accessories (clothing)
  'scarf': 'scarf woman fashion accessory',
  'stole': 'stole woman wrap elegant',
  'shawl': 'shawl woman wrap warm',
  'muffler': 'muffler scarf winter warm',
  'gloves': 'gloves woman fashion winter',
  'belt': 'belt woman fashion leather',
  'tie': 'tie man formal necktie',
  'bow tie': 'bow tie man formal',
  'suspenders': 'suspenders man fashion',
  'hat': 'hat woman fashion accessory',
  'cap': 'cap woman casual headwear',
  'beanie': 'beanie hat winter warm',
  'headband': 'headband woman hair accessory',
  
  // Fabric types for generic matching
  'cotton': 'cotton fabric clothing natural',
  'silk': 'silk fabric luxury smooth',
  'polyester': 'polyester fabric synthetic',
  'linen': 'linen fabric clothing natural',
  'wool': 'wool fabric warm knit',
  'velvet': 'velvet fabric luxury soft',
  'satin': 'satin fabric shiny smooth',
  'denim': 'denim fabric jeans blue',
  'lace': 'lace fabric delicate pattern',
  'chiffon fabric': 'chiffon fabric transparent light',
  'georgette fabric': 'georgette fabric flowing',
  'crepe': 'crepe fabric textured',
  'rayon': 'rayon fabric soft drape',
  'nylon': 'nylon fabric synthetic stretch',
  'spandex': 'spandex fabric stretch elastic',
  'jersey': 'jersey fabric knit stretch',
  'tweed': 'tweed fabric woven wool',
  'corduroy': 'corduroy fabric ribbed',
  'fleece': 'fleece fabric warm soft',
  'organza': 'organza fabric sheer stiff',
  'tulle': 'tulle fabric net sheer',
  'brocade': 'brocade fabric woven pattern',
  'jacquard': 'jacquard fabric woven design',
  
  // Seasonal
  'summer': 'summer dress light woman',
  'winter': 'winter coat warm woman',
  'monsoon': 'rainwear waterproof woman',
  'spring': 'spring dress floral woman',
  'autumn': 'autumn fashion layered woman',
  'festive': 'festive dress indian celebration',
  'bridal': 'bridal dress wedding woman',
  'casual': 'casual wear woman everyday',
  'formal': 'formal dress woman elegant',
  'party': 'party dress woman glamorous',
  'office': 'office wear woman professional',
  'daily': 'daily wear woman casual',
};

// Gift search terms - very specific
const giftExactTerms = {
  // Mugs & Cups
  'mug': 'coffee mug ceramic colorful',
  'personalized mug': 'personalized mug custom print',
  'coffee mug': 'coffee mug ceramic morning',
  'tea cup': 'tea cup saucer ceramic',
  'travel mug': 'travel mug insulated coffee',
  'beer mug': 'beer mug glass handle',
  'magic mug': 'magic mug color changing',
  
  // Photo & Frames
  'photo frame': 'photo frame wooden decorative',
  'picture frame': 'picture frame elegant display',
  'collage frame': 'collage frame multiple photos',
  'digital frame': 'digital photo frame display',
  'photo album': 'photo album memories book',
  'photo book': 'photo book custom print',
  'photo print': 'photo print canvas wall',
  'canvas print': 'canvas print wall art',
  
  // Home Decor
  'vase': 'vase flower decorative ceramic',
  'candle': 'candle scented decorative jar',
  'cushion': 'cushion pillow decorative soft',
  'pillow': 'pillow decorative bed sofa',
  'throw blanket': 'throw blanket cozy warm',
  'lamp': 'lamp decorative table light',
  'clock': 'clock wall decorative modern',
  'wall art': 'wall art decorative print',
  'painting': 'painting art decorative canvas',
  'sculpture': 'sculpture art decorative figurine',
  'figurine': 'figurine decorative statue cute',
  'showpiece': 'showpiece decorative display home',
  'wind chime': 'wind chime decorative hanging',
  'dream catcher': 'dream catcher decorative hanging',
  'wall hanging': 'wall hanging decorative art',
  'mirror': 'mirror decorative wall frame',
  'coaster': 'coaster set decorative table',
  'tray': 'tray decorative serving wooden',
  'bookend': 'bookend decorative book holder',
  'globe': 'globe decorative world map',
  'hourglass': 'hourglass sand timer decorative',
  
  // Kitchen & Dining
  'tea set': 'tea set ceramic cups pot',
  'coffee set': 'coffee set cups pot ceramic',
  'dinner set': 'dinner set plates ceramic',
  'cutlery set': 'cutlery set spoon fork knife',
  'glassware': 'glassware set drinking glasses',
  'wine glass': 'wine glass elegant crystal',
  'water bottle': 'water bottle stainless steel',
  'lunch box': 'lunch box container food',
  'serving bowl': 'serving bowl ceramic decorative',
  'platter': 'platter serving plate ceramic',
  'jar': 'jar storage glass ceramic',
  'cookie jar': 'cookie jar ceramic kitchen',
  'spice rack': 'spice rack organizer kitchen',
  'cutting board': 'cutting board wooden kitchen',
  'apron': 'apron kitchen cooking chef',
  'oven mitt': 'oven mitt kitchen cooking',
  'kitchen towel': 'kitchen towel cotton cloth',
  
  // Personal Accessories
  'wallet': 'wallet leather men women',
  'purse': 'purse handbag women fashion',
  'handbag': 'handbag women fashion leather',
  'clutch': 'clutch bag women evening',
  'backpack': 'backpack bag travel casual',
  'tote bag': 'tote bag women shopping',
  'sling bag': 'sling bag crossbody women',
  'duffle bag': 'duffle bag travel gym',
  'laptop bag': 'laptop bag professional office',
  'travel bag': 'travel bag luggage trip',
  'cosmetic bag': 'cosmetic bag makeup pouch',
  'pouch': 'pouch small bag zipper',
  
  // Jewelry & Accessories
  'jewelry box': 'jewelry box organizer elegant',
  'necklace': 'necklace jewelry elegant pendant',
  'bracelet': 'bracelet jewelry elegant band',
  'earrings': 'earrings jewelry elegant dangle',
  'ring': 'ring jewelry elegant band',
  'pendant': 'pendant necklace jewelry charm',
  'anklet': 'anklet jewelry ankle chain',
  'brooch': 'brooch pin jewelry decorative',
  'cufflinks': 'cufflinks men formal jewelry',
  'tie pin': 'tie pin men formal accessory',
  'watch': 'watch wristwatch elegant timepiece',
  'sunglasses': 'sunglasses fashion accessory style',
  'keychain': 'keychain accessory metal charm',
  'key holder': 'key holder organizer wall',
  
  // Beauty & Personal Care
  'perfume': 'perfume fragrance bottle elegant',
  'cologne': 'cologne fragrance men bottle',
  'skincare set': 'skincare set beauty products',
  'makeup set': 'makeup set cosmetics beauty',
  'makeup kit': 'makeup kit cosmetics case',
  'nail polish': 'nail polish colorful bottles',
  'lipstick set': 'lipstick set makeup colors',
  'face mask': 'face mask skincare beauty',
  'bath set': 'bath set spa products',
  'spa set': 'spa set relaxation beauty',
  'soap set': 'soap set handmade natural',
  'lotion set': 'lotion set body care',
  'essential oil': 'essential oil aromatherapy bottle',
  'diffuser': 'diffuser aromatherapy essential oil',
  'massage oil': 'massage oil relaxation spa',
  'bath bomb': 'bath bomb colorful fizzy',
  'body scrub': 'body scrub spa exfoliate',
  'hand cream': 'hand cream moisturizer tube',
  
  // Stationery & Office
  'diary': 'diary notebook leather elegant',
  'journal': 'journal notebook writing elegant',
  'notebook': 'notebook writing stationery',
  'planner': 'planner organizer calendar book',
  'pen set': 'pen set writing elegant',
  'pen holder': 'pen holder desk organizer',
  'desk organizer': 'desk organizer office stationery',
  'bookmark': 'bookmark reading elegant metal',
  'paper weight': 'paperweight desk decorative glass',
  'letter opener': 'letter opener desk elegant',
  'card holder': 'card holder business elegant',
  'name plate': 'nameplate desk office personalized',
  
  // Electronics & Gadgets
  'bluetooth speaker': 'bluetooth speaker wireless audio',
  'earbuds': 'earbuds wireless audio headphones',
  'headphones': 'headphones audio music wireless',
  'power bank': 'power bank portable charger',
  'phone stand': 'phone stand holder desk',
  'phone case': 'phone case cover protective',
  'tablet stand': 'tablet stand holder desk',
  'usb hub': 'usb hub adapter electronics',
  'led lamp': 'led lamp desk light',
  'smart watch': 'smart watch fitness wearable',
  'fitness band': 'fitness band tracker wearable',
  'camera': 'camera photography instant',
  'drone': 'drone camera flying toy',
  'portable fan': 'portable fan mini handheld',
  'mini fridge': 'mini fridge portable cooler',
  
  // Games & Toys
  'board game': 'board game family fun',
  'puzzle': 'puzzle jigsaw pieces game',
  'rubik cube': 'rubik cube puzzle game',
  'chess set': 'chess set board game',
  'carrom board': 'carrom board game indian',
  'ludo': 'ludo board game colorful',
  'playing cards': 'playing cards deck game',
  'dart board': 'dart board game target',
  'teddy bear': 'teddy bear plush soft',
  'stuffed toy': 'stuffed animal plush soft',
  'soft toy': 'soft toy plush cute',
  'action figure': 'action figure toy collectible',
  'model car': 'model car toy collectible',
  'remote car': 'remote control car toy',
  'drone toy': 'drone toy flying remote',
  'lego': 'lego building blocks toy',
  'building blocks': 'building blocks toy colorful',
  
  // Plants & Garden
  'plant': 'indoor plant pot green',
  'succulent': 'succulent plant small pot',
  'bonsai': 'bonsai tree miniature plant',
  'terrarium': 'terrarium glass plant mini',
  'flower bouquet': 'flower bouquet fresh roses',
  'artificial flower': 'artificial flower decorative vase',
  'planter': 'planter pot decorative ceramic',
  'garden tool': 'garden tool set kit',
  'watering can': 'watering can garden decorative',
  'bird feeder': 'bird feeder garden hanging',
  
  // Food & Gourmet
  'chocolate box': 'chocolate box gift assorted',
  'cookie box': 'cookie box gift biscuits',
  'dry fruits': 'dry fruits box gift nuts',
  'gift hamper': 'gift hamper basket assorted',
  'wine': 'wine bottle red elegant',
  'champagne': 'champagne bottle celebration bubbles',
  'cake': 'cake dessert celebration birthday',
  'cupcake': 'cupcake dessert colorful frosting',
  'macaron': 'macaron french dessert colorful',
  'honey jar': 'honey jar natural golden',
  'tea box': 'tea box assorted flavors',
  'coffee beans': 'coffee beans roasted bag',
  'spice box': 'spice box masala indian',
  
  // Books & Media
  'book': 'book reading literature gift',
  'coffee table book': 'coffee table book large',
  'comic book': 'comic book graphic novel',
  'magazine subscription': 'magazine subscription reading',
  'music cd': 'music cd album disc',
  'vinyl record': 'vinyl record music retro',
  
  // Religious & Spiritual
  'idol': 'idol god statue brass',
  'god statue': 'god statue brass decorative',
  'buddha': 'buddha statue peaceful meditation',
  'ganesha': 'ganesha idol hindu brass',
  'lakshmi': 'lakshmi idol goddess brass',
  'pooja thali': 'pooja thali brass decorative',
  'diya': 'diya lamp oil brass',
  'incense holder': 'incense holder brass stand',
  'prayer beads': 'prayer beads mala spiritual',
  'rudraksha': 'rudraksha beads spiritual mala',
  'crystal': 'crystal healing stone natural',
  'feng shui': 'feng shui decorative chinese',
  'laughing buddha': 'laughing buddha statue golden',
  
  // Personalized Gifts
  'personalized': 'personalized custom gift engraved',
  'custom': 'custom personalized gift unique',
  'engraved': 'engraved gift personalized custom',
  'monogram': 'monogram personalized initials gift',
  'name plate': 'nameplate personalized custom door',
  'photo gift': 'photo gift custom print',
  'caricature': 'caricature portrait cartoon custom',
  
  // Handmade & Artisan
  'handmade': 'handmade craft artisan gift',
  'handcrafted': 'handcrafted artisan unique gift',
  'hand painted': 'hand painted art decorative',
  'artisan': 'artisan craft handmade unique',
  'pottery': 'pottery ceramic handmade craft',
  'woodwork': 'woodwork carved handmade craft',
  'embroidery': 'embroidery handmade fabric craft',
  'macrame': 'macrame wall hanging craft',
  'crochet': 'crochet handmade yarn craft',
  'knitted': 'knitted handmade yarn warm',
  
  // Occasion Specific
  'birthday': 'birthday gift celebration cake',
  'anniversary': 'anniversary gift couple love',
  'wedding gift': 'wedding gift couple elegant',
  'baby shower': 'baby shower gift newborn',
  'housewarming': 'housewarming gift home decor',
  'graduation': 'graduation gift achievement success',
  'valentines': 'valentines gift love heart',
  'mothers day': 'mothers day gift love mom',
  'fathers day': 'fathers day gift love dad',
  'christmas': 'christmas gift holiday festive',
  'diwali': 'diwali gift indian festive',
  'rakhi': 'rakhi gift brother sister',
  'new year': 'new year gift celebration',
  
  // Miscellaneous
  'fridge magnet': 'fridge magnet decorative colorful',
  'refrigerator magnet': 'refrigerator magnet decorative',
  'car accessory': 'car accessory decorative dashboard',
  'travel accessory': 'travel accessory kit organizer',
  'umbrella': 'umbrella colorful rain accessory',
  'torch': 'torch flashlight led portable',
  'swiss knife': 'swiss knife multi tool',
  'compass': 'compass navigation travel vintage',
  'binoculars': 'binoculars viewing travel outdoor',
  'telescope': 'telescope astronomy stars viewing',
  'magnifying glass': 'magnifying glass vintage reading',
};

// Get best search term
function getSearchTerm(productName, isClothing) {
  const name = productName.toLowerCase().trim();
  const terms = isClothing ? clothingExactTerms : giftExactTerms;
  
  // Try exact match first
  if (terms[name]) {
    return terms[name];
  }
  
  // Try partial matches (longest match first)
  const keys = Object.keys(terms).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (name.includes(key)) {
      return terms[key];
    }
  }
  
  // Fallback with better context
  if (isClothing) {
    // Check for common patterns
    if (name.includes('saree') || name.includes('sari')) return 'indian saree silk woman elegant';
    if (name.includes('kurta') || name.includes('kurti')) return 'kurti indian woman tunic elegant';
    if (name.includes('dress')) return 'woman dress elegant fashion beautiful';
    if (name.includes('shirt')) return 'shirt fashion elegant clean';
    if (name.includes('pant') || name.includes('trouser')) return 'pants trousers woman fashion';
    if (name.includes('top')) return 'woman top fashion elegant';
    if (name.includes('jacket')) return 'jacket woman fashion elegant';
    if (name.includes('suit')) return 'suit formal elegant fashion';
    return `${productName} indian fashion clothing woman`;
  } else {
    if (name.includes('mug') || name.includes('cup')) return 'coffee mug ceramic gift colorful';
    if (name.includes('frame')) return 'photo frame wooden decorative elegant';
    if (name.includes('candle')) return 'candle scented decorative gift';
    if (name.includes('box')) return 'gift box decorative elegant';
    if (name.includes('set')) return 'gift set elegant box';
    return `${productName} gift decorative elegant`;
  }
}

// Fetch image from Pixabay with retry
async function fetchPixabayImage(searchTerm, retryCount = 0) {
  return new Promise((resolve, reject) => {
    const query = encodeURIComponent(searchTerm);
    const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${query}&image_type=photo&orientation=vertical&safesearch=true&per_page=10&min_width=400&min_height=500`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.hits && json.hits.length > 0) {
            // Get a varied result
            const index = Math.floor(Math.random() * Math.min(json.hits.length, 5));
            const hit = json.hits[index];
            resolve({
              url: hit.largeImageURL || hit.webformatURL,
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
    }).on('error', (err) => {
      if (retryCount < 2) {
        setTimeout(() => {
          fetchPixabayImage(searchTerm, retryCount + 1).then(resolve).catch(reject);
        }, 1000);
      } else {
        reject(err);
      }
    });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateAllImages() {
  console.log('🚀 Starting IMPROVED image update (v2)...\n');
  
  const clothingPath = path.join(__dirname, '../frontend/src/data/clothing-catalog.json');
  const giftsPath = path.join(__dirname, '../frontend/src/data/gifts-catalog.json');
  
  console.log('📖 Reading catalog files...');
  let clothingCatalog = JSON.parse(fs.readFileSync(clothingPath, 'utf8'));
  let giftsCatalog = JSON.parse(fs.readFileSync(giftsPath, 'utf8'));
  
  console.log(`   Found ${clothingCatalog.length} clothing items`);
  console.log(`   Found ${giftsCatalog.length} gift items\n`);
  
  // Update clothing
  console.log('👗 Updating clothing images...\n');
  let clothingUpdated = 0, clothingFailed = 0;
  
  for (let i = 0; i < clothingCatalog.length; i++) {
    const product = clothingCatalog[i];
    const searchTerm = getSearchTerm(product.name, true);
    
    try {
      const imageData = await fetchPixabayImage(searchTerm);
      
      if (imageData) {
        clothingCatalog[i].image = imageData.url;
        clothingCatalog[i].source = 'pixabay';
        clothingCatalog[i].attribution = `Photo by ${imageData.photographer} on Pixabay`;
        clothingCatalog[i].photographer = imageData.photographer;
        clothingCatalog[i].pixabay_id = imageData.pixabayId;
        clothingUpdated++;
        console.log(`✅ [${i + 1}/${clothingCatalog.length}] ${product.name} → "${searchTerm}"`);
      } else {
        clothingFailed++;
        console.log(`⚠️ [${i + 1}/${clothingCatalog.length}] ${product.name} - No results for "${searchTerm}"`);
      }
    } catch (error) {
      clothingFailed++;
      console.log(`❌ [${i + 1}/${clothingCatalog.length}] ${product.name} - Error: ${error.message}`);
    }
    
    await sleep(DELAY_MS);
    
    if ((i + 1) % 50 === 0) {
      fs.writeFileSync(clothingPath, JSON.stringify(clothingCatalog, null, 2));
      console.log(`\n💾 Saved progress: ${i + 1} clothing items\n`);
    }
  }
  
  fs.writeFileSync(clothingPath, JSON.stringify(clothingCatalog, null, 2));
  console.log(`\n✅ Clothing done! Updated: ${clothingUpdated}, Failed: ${clothingFailed}\n`);
  
  // Update gifts
  console.log('🎁 Updating gift images...\n');
  let giftsUpdated = 0, giftsFailed = 0;
  
  for (let i = 0; i < giftsCatalog.length; i++) {
    const product = giftsCatalog[i];
    const searchTerm = getSearchTerm(product.name, false);
    
    try {
      const imageData = await fetchPixabayImage(searchTerm);
      
      if (imageData) {
        giftsCatalog[i].image = imageData.url;
        giftsCatalog[i].source = 'pixabay';
        giftsCatalog[i].attribution = `Photo by ${imageData.photographer} on Pixabay`;
        giftsCatalog[i].photographer = imageData.photographer;
        giftsCatalog[i].pixabay_id = imageData.pixabayId;
        giftsUpdated++;
        console.log(`✅ [${i + 1}/${giftsCatalog.length}] ${product.name} → "${searchTerm}"`);
      } else {
        giftsFailed++;
        console.log(`⚠️ [${i + 1}/${giftsCatalog.length}] ${product.name} - No results for "${searchTerm}"`);
      }
    } catch (error) {
      giftsFailed++;
      console.log(`❌ [${i + 1}/${giftsCatalog.length}] ${product.name} - Error: ${error.message}`);
    }
    
    await sleep(DELAY_MS);
    
    if ((i + 1) % 50 === 0) {
      fs.writeFileSync(giftsPath, JSON.stringify(giftsCatalog, null, 2));
      console.log(`\n💾 Saved progress: ${i + 1} gift items\n`);
    }
  }
  
  fs.writeFileSync(giftsPath, JSON.stringify(giftsCatalog, null, 2));
  console.log(`\n✅ Gifts done! Updated: ${giftsUpdated}, Failed: ${giftsFailed}\n`);
  
  // Summary
  console.log('═'.repeat(50));
  console.log('📊 FINAL SUMMARY');
  console.log('═'.repeat(50));
  console.log(`Clothing: ${clothingUpdated} updated, ${clothingFailed} failed`);
  console.log(`Gifts: ${giftsUpdated} updated, ${giftsFailed} failed`);
  console.log(`Total: ${clothingUpdated + giftsUpdated} images updated`);
  console.log('═'.repeat(50));
  console.log('\n🎉 Image update complete!');
}

updateAllImages().catch(console.error);
