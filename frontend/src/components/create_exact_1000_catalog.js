const fs = require('fs');

// Your exact 1000 clothing items list
const clothingCategories = {
  "traditional_women": [
    "Saree", "Lehenga", "Ghagra", "Choli", "Kurti", "Anarkali", "Salwar", "Churidaar", "Patiala suit", "Dupatta",
    "Langa voni", "Mekhela chador", "Sharara", "Gharara", "Saree blouse", "Half saree", "Bandhani saree", "Banarasi saree", "Kanchipuram saree", "Kota doria saree",
    "Uppada saree", "Phulkari suit", "Bagh print kurta", "Silk lehenga", "Kalamkari saree", "Paithani saree", "Sambalpuri saree", "Pochampally saree", "Jamdani saree", "Bhagalpuri saree",
    "Tussar silk saree", "Chikankari kurta", "Khadi kurta", "Organza saree", "Brocade lehenga", "Tissue saree", "Gota patti kurta", "Zari dupatta", "Mirror work suit", "Kashmiri kaftan",
    "Moonga silk saree", "Nauvari saree", "Gown-style saree", "Velvet lehenga", "Net saree", "Handloom kurta", "Rajasthani ghagra", "Ilkal saree", "Assam Muga saree", "Gujarat bandhni",
    "Kerala set mundu", "Madhubani print", "Embroidered kurta", "Applique saree", "Kullu wool dress", "Toda saree", "Tribal lehenga", "Tribal choli", "Banjara skirt", "Bengali tant saree",
    "Mysore silk saree", "Kosa silk", "Patola saree", "Maheshwari saree", "Narayanpet saree", "Batik printed kurta", "Dabu print kurta", "Bagru print suit", "Gamcha-style dupatta", "Lucknowi lehenga",
    "Kantha stitched kurti", "Ikat saree", "Mughal-style anarkali", "Tanjore cotton saree", "Tye-dye lehenga", "Lace blouse", "Halter blouse", "Empire waist gown", "Flared kurta", "Pleated ghagra",
    "Yoke style kurta", "Long kurta", "Short kurti", "A-line salwar", "Box pleat lehenga", "Jacket lehenga", "Designer gown", "Heavy bridal saree", "Light chiffon saree", "Printed cotton kurta",
    "Festive silk salwar", "Jute saree", "Tissue silk", "Crushed dupatta", "Cowl-style kurta", "Multicolor lehenga", "Layered kurta", "Bell sleeves blouse", "Tulip pants", "Saree with belt", "Crape saree", "Ruffled saree"
  ],
  "traditional_men": [
    "Dhoti", "Kurta", "Pajama", "Sherwani", "Achkan", "Nehru jacket", "Bandhgala", "Pathani suit", "Jodhpuri suit", "Angrakha",
    "Veshti", "Lungi", "Mundu", "Choga", "Coorgi kupya", "Himachali chola", "Kedia", "Dogri kurta", "Bihu costume", "Khasi jymphong",
    "Manipuri shirt", "Kullu wool coat", "Angavastram", "Garhwali overcoat", "Safa (turban)", "Pagri", "Sehra", "Tikka jacket", "Dabu kurta", "Phulkari kurta",
    "Bandhani kurta", "Ikat vest", "Chikankari kurta", "Silk dhoti", "Printed waistcoat", "Khadi kurta", "Cotton sherwani", "Jamdani jacket", "Paithani angavastram", "Mysore silk veshti",
    "Toda shawl", "Tanjore overcoat", "Tribal shirt", "Rajasthan angarkha", "Sikkimese bakhu", "Lachen coat", "Printed sherwani", "Mirror work jacket", "Linen kurta", "Zari dhoti",
    "Velvet sherwani", "Embroidered pajama", "Ethnic pants", "Cotton waistcoat", "Gujarati kediyu", "Pahari choga", "Mughal-style achkan", "Rajput turban", "Kashmir pheran", "Tussar silk kurta",
    "Tye-dye dhoti", "Bagh printed kurta", "Banarasi waistcoat", "Matka silk sherwani", "Bhandhani safa", "Jamawar sherwani", "Bengal cotton kurta", "Mundu with angavastram", "Angrakha-style sherwani", "Short kurta",
    "Long jacket", "Ethnic harem pants", "Printed cotton dhoti", "Cowl-style kurta", "V-neck kurta", "Piped jacket", "Double breasted sherwani", "A-line kurta", "Festive kurta", "Designer sherwani",
    "Textured achkan", "Asymmetric hem kurta", "Punjabi kurta", "Sufi-style jacket", "Kurta with scarf", "Side slit kurta", "High-low hem sherwani", "Woven Nehru vest", "Zari turban", "Checked dhoti",
    "Silk jacket", "Collared kurta", "Tapered pajama", "Koti", "Summer linen kurta", "Choga-style jacket", "Brocade jacket", "Bandi", "Cross-button kurta"
  ],
  "innerwear": [
    "Bra", "Jatti (panties)", "Boxer shorts", "Vest (banian)", "Thermal wear", "Camisole", "Petticoat", "Corset", "Sports bra", "Tummy tucker",
    "Briefs", "Trunks", "Thong", "Hipster", "Boyshorts", "Chemise", "Slip", "Shapewear", "Nightie", "Night gown",
    "Lingerie set", "Hosiery", "Nursing bra", "Maternity shapewear", "Cotton panties", "Seamless panties", "Padded bra", "Strapless bra", "Tube bra", "Bikini underwear",
    "Low-rise briefs", "High-waist panties", "Thermal leggings", "Woolen undershirt", "Undershorts", "V-neck vest", "Round neck vest", "Cotton slips", "Printed camisole", "Modal panties",
    "Lace lingerie", "Inner skirt", "Stretch vest", "Cotton trunks", "Synthetic briefs", "Maternity bra", "Front-open bra", "Sleeveless vest", "Dual support bra", "Push-up bra",
    "Mesh panties", "Netted innerwear", "Shaping camisole", "Boy's vest", "Girl's slip", "Teens briefs", "Elastic waistband", "Designer lingerie", "Silk boxer", "Bikini brief",
    "Plain jatti", "Traditional undershirt", "Checkered vest", "Colored briefs", "Half slip", "Lace camisole", "Satin night dress", "Henley undershirt", "Ribbed innerwear", "Ribbed vest",
    "Bralette", "Halter inner top", "Crop camisole", "Shaping panties", "Gender-neutral underwear", "Fancy jatti", "Printed panties", "Matching bra set", "Seamless trunks", "Inner shorts",
    "Full body slip", "Hookless bra", "Transparent strap bra", "Cotton nursing slip", "Thermal pajama", "Inner leggings", "Cotton shapewear", "Spandex briefs", "Modal boxer", "Net camisole",
    "Inner bodysuit", "Ethnic vest", "Designer slip", "Bridal innerwear", "Vintage underwear", "Long line bra", "Firm support bra"
  ],
  "modern_women": [
    "Jeans", "T-shirt", "Crop top", "Palazzo pants", "Pencil skirt", "Maxi dress", "Midi dress", "Denim jacket", "Shrug", "Bomber jacket",
    "Hooded dress", "Sweatpants", "Tracksuit", "Sleeveless top", "Bell-bottoms", "Jumpsuit", "Romper", "Wrap dress", "Bodycon dress", "Tank top",
    "Off-shoulder top", "Tube top", "Peplum blouse", "Shirt dress", "Joggers", "Cargo pants", "Leather skirt", "Short kurti", "A-line dress", "Collared shirt",
    "Henley tee", "Kaftan dress", "Culottes", "Chino pants", "Wrap skirt", "Ruffle top", "Bardot top", "Cowl neck blouse", "High-low top", "Printed tunic",
    "High-waist jeans", "Bootcut jeans", "Skinny jeans", "Flared skirt", "Ethnic jacket", "T-shirt dress", "Lace top", "Satin shirt", "Asymmetrical dress", "Cape blouse",
    "Layered top", "Embellished tunic", "Halter dress", "Tie-up blouse", "Shirt kurti", "Crochet top", "Basic tee", "Longline jacket", "Camouflage pants", "Embroidered jeans",
    "Slit dress", "Bardot jumpsuit", "Puffed sleeve top", "Corset top", "Denim dungaree", "Skater dress", "Cut-out top", "Net blouse", "Fitted turtleneck", "Graphic tee",
    "Oversized hoodie", "Knitted tunic", "Fringe skirt", "Pleated pants", "Drawstring trousers", "Sporty tank", "Ruched blouse", "Stretch leggings", "Collared tunic", "Mesh top",
    "Metallic skirt", "Wide-leg trousers", "Scarf top", "Cotton dungarees", "Belted pants", "Flannel shirt", "One-shoulder top", "Square neck blouse", "Sequin top", "Polo dress",
    "Racerback tee", "Straight pants", "Full-length skirt", "Cold-shoulder top", "Tulip skirt", "Neoprene jacket", "Printed hoodie", "Embroidered bomber"
  ],
  "modern_men": [
    "Jeans", "T-shirt", "Shirt", "Hoodie", "Bomber jacket", "Denim jacket", "Cargo pants", "Shorts", "Sweatshirt", "Tracksuit",
    "Polo shirt", "Henley tee", "Formal suit", "Chinos", "Joggers", "Blazer", "Cardigan", "Tank top", "Leather jacket", "Overcoat",
    "Trench coat", "Graphic tee", "Turtleneck", "Checked shirt", "Mandarin collar shirt", "Ripped jeans", "Skinny jeans", "Tailored trousers", "V-neck tee", "Round neck tee",
    "Printed sweatshirt", "Utility pants", "Drawstring joggers", "Athletic shorts", "Sport coat", "Double-breasted blazer", "Waistcoat", "T-shirt hoodie", "Mesh tank", "Tracksuit jacket",
    "Oxford shirt", "Cuban collar shirt", "Dungarees", "Windbreaker", "Baseball jacket", "Work pants", "Casual blazer", "Lounge pants", "Long-sleeve tee", "Puffer jacket",
    "Color-block tee", "Cropped pants", "Capris", "Muscle fit tee", "Straight-fit jeans", "Cargo joggers", "Harrington jacket", "Flannel shirt", "Golf shirt", "Satin bomber",
    "Lace-up top", "Sleeveless shirt", "Button-down tee", "Pleated trousers", "Printed pants", "Retro jacket", "Roll-up sleeve shirt", "Jersey tee", "Summer shirt", "Collared tee",
    "Longline shirt", "Boxy tee", "Embroidered jeans", "Structured coat", "Mandarin blazer", "Pocket tee", "Slim-fit tee", "Wide-leg jeans", "Denim blazer", "Split hem trousers",
    "Drawstring cargo", "Monochrome jacket", "Asymmetrical shirt", "Corduroy pants", "Overshirt", "Sequin shirt", "Fleece jacket", "Workout hoodie", "Compression tee", "Mesh shorts",
    "Lounge jacket", "Evening suit", "Printed tuxedo", "Western shirt", "Washed denim", "High-rise pants", "Co-ord sets", "Heritage jacket", "Classic tee", "Indigo jeans", "Washed sweatshirt", "Cropped jacket"
  ],
  "unisex_gender_neutral": [
    "Oversized T-shirt", "Hoodie", "Kurta", "Joggers", "Denim dungarees", "Sweatpants", "Cargo shorts", "Bomber jacket", "Tracksuit", "T-shirt dress",
    "Ethnic jacket", "Wrap shirt", "Pajama pants", "Windbreaker", "Khadi shirt", "Printed kurta", "Longline jacket", "Flannel jacket", "Puffer jacket", "Trench coat",
    "Dabu kurta", "Bagru print tee", "Cotton tunic", "Multicolor joggers", "Tie-dye hoodie", "Mesh tank", "Cotton robe", "Athleisure shorts", "Bandi vest", "Round neck tee",
    "Ethnic waistcoat", "Printed trousers", "Harem pants", "Side slit kurta", "Drawstring pants", "Linen shirt", "Denim kurta", "Statement hoodie", "Handmade jacket", "Wool blazer",
    "Collared hoodie", "Box-fit tee", "Abstract print shirt", "Cropped hoodie", "Cowl neck tunic", "Pleated co-ord", "Zari jacket", "T-shirt gown", "Artisanal waistcoat", "Piped kurta",
    "Fusion dress", "Pajama kurta combo", "Textured robe", "Tribal print tee", "Ikat hoodie", "Woolen overcoat", "Unisex dhoti", "Gamcha tee", "Sufi-style coat", "Quilted jacket",
    "Rain poncho", "Monsoon suit", "Sleeveless kurta", "Mirror work hoodie", "Oversize sweatshirt", "Silk printed gown", "Tulip pants", "Designer kaftan", "Scarf top", "Bhagalpuri jacket",
    "Zari hoodie", "Linen tunic", "Sustainable co-ord", "Shibori printed hoodie", "Printed harem pants", "Reversible kurta", "Multicolor robe", "Crochet vest", "Tribal overcoat", "Eco-fusion gown",
    "Printed cotton co-ord", "Banarasi bomber", "Bamboo fabric hoodie", "Vintage kurta", "Artistic robe", "Kantha stitched coat", "Cotton dhoti pants", "Yoga joggers", "Layered robe", "Quilted hoodie",
    "Velvet gown hoodie", "Drape kurta", "Shawl jacket", "Ethnic fusion tee", "Cross-button jacket", "Patchwork hoodie", "Indigo tunic", "Kurta jumpsuit", "Tribal kaftan"
  ],
  "festival_ceremonial": [
    "Bridal lehenga", "Wedding sherwani", "Sangeet kurta", "Mehendi sari", "Reception gown", "Haldi kurta", "Engagement suit", "Designer anarkali", "Zardozi lehenga", "Sequined saree",
    "Gown with dupatta", "Sharara for festivals", "Custom bride blouse", "Brocade kurta", "Silk sherwani", "Embellished salwar suit", "Traditional groom veshti", "Custom angarkha", "Ornate achkan", "Embroidered sari",
    "Festive crop top", "Ghagra with mirror work", "Beaded dupatta", "Sheer sari gown", "Regal sherwani", "Indo-western gown", "Jewel-toned lehenga", "Flared anarkali", "Panelled kurta", "Silk blouse",
    "Sari with gold thread", "Tassel kurti", "Peacock motif lehenga", "Koti with embroidery", "Stonework sari", "Velvet choli", "Dori-style blouse", "Multi-panel ghagra", "Floral sherwani", "Temple print sari",
    "Bejeweled kurta", "Potli paired sari", "Net bridal gown", "Ceremonial veshti", "Cape-style anarkali", "Pearl embroidered blouse", "Dupatta with sequins", "Pleated bridal gown", "Ethnic blazer", "Halterneck lehenga",
    "Groom's turban", "Festive dhoti-kurta", "Glitter kurta", "Tissue lehenga", "Maroon velvet sherwani", "High-neck blouse", "Gold zari jacket", "Banarasi sari gown", "Mirror work blouse", "Designer cape saree",
    "Jewel neckline choli", "Bridal net dupatta", "Floral wedding kurta", "Dhoti with kanjeevaram jacket", "Silk dhoti with zari border", "Puffed sleeve bridal blouse", "Lehenga with trail", "Indo-western sherwani", "Ethnic jumpsuit", "Groom's embroidered stole",
    "Gold thread salwar suit", "Embroidered angavastram", "Gharara with cape", "Multilayer bridal gown", "Saree with scallop border", "Ornate blouse with puff sleeves", "Embroidered sherwani scarf", "Royal velvet achkan", "Sequined net lehenga", "Statement bridal cape",
    "Anarkali with kalis", "Groom's kantha coat", "Zardozi work sari", "Ruffle dupatta", "Bridal jacket lehenga", "Ethnic coat kurta combo", "Indo-fusion cocktail dress", "Engagement sari", "Designer tulle gown", "Custom mehendi blouse",
    "Silk panel sherwani", "Mandap ceremony kurta", "Ethnic evening gown", "Dupatta with tassels", "Haldi yellow kurti", "Lehenga with belt", "Rajput-style angarkha", "Sleeveless bridal blouse", "Festive wrap dress", "Ornate sari drape", "Sharara set with brocade", "Ceremony dhoti pant"
  ],
  "seasonal_utility": [
    "Raincoat", "Windcheater", "Summer kurta", "Woolen shawl", "Monsoon pants", "Cotton sari", "Winter anarkali", "Quilted jacket", "Light tunic", "Rainproof hoodie",
    "Umbrella coat", "Mul cotton kurti", "Linen shirt", "Winter sherwani", "Thermal blouse", "Fleece-lined sweatshirt", "Cotton wrap skirt", "Wool scarf", "Monsoon shorts", "Waterproof tracksuit",
    "Kashmiri pheran", "Blanket shawl", "Layered tunic", "Rainproof vest", "Cotton trousers", "Snow jacket", "Summer lehenga", "Woolen cardigan", "Waterproof angavastram", "Bamboo cotton tee",
    "Heat-resistant blouse", "Fleece kurta", "Knitted sari", "Quilted salwar suit", "High-neck thermal tee", "Wool pants", "Rain jacket kurta", "Summer dhoti", "Windproof kurta", "Crinkled linen sari",
    "Rain-ready joggers", "Polyblend robe", "Woolen innerwear", "Layered jumpsuit", "Umbrella blouse", "Breathable joggers", "Winter stole", "Cotton dhoti shorts", "Water-resistant hoodie", "Linen waistcoat",
    "Soft cotton tee", "Woven thermal vest", "Velvet trousers", "Nylon sari", "Heat-tech blouse", "Monsoon fusion coat", "Snowproof vest", "Breezy tank top", "Light knit kurta", "Nylon jumpsuit",
    "Cotton inner blouse", "Summer sleeveless top", "Moisture-wick tee", "Fleece dupatta", "Double-knit coat", "Printed thermal pants", "Layered shrug", "Woolen kaftan", "Waterproof skirt", "Sheer rain sari",
    "Mulmul tunic", "Nylon kurta", "Winter silk veshti", "Lined sherwani", "Windbreaker dhoti", "All-weather hoodie", "Cuffed fleece pants", "Lightweight sari wrap", "Drizzle-ready blouse", "Moisture-proof jumpsuit",
    "Insulated Nehru jacket", "Flannel dhoti", "Fog-proof vest", "Padded kurta coat", "Climate-control joggers", "Drape rain skirt", "Summer palazzo", "Winter cape blouse", "Cotton blazer", "Tropical printed tunic",
    "Monsoon scarf", "Hydrophobic hoodie", "Hot-weather kurta", "Wool-lined blazer", "Moisture-wicking sherwani", "Nylon sari jacket", "Umbrella jumpsuit", "Ice-blue winter gown", "Quilted angarkha"
  ],
  "fabrics_styles_trends": [
    "Brocade kurta", "Satin blouse", "Lace saree", "Silk pants", "Chiffon lehenga", "Organza sari", "Georgette blouse", "Velvet kurta", "Mul cotton skirt", "Tussar trousers",
    "Raw silk sari", "Crepe anarkali", "Muslin blouse", "Net gown", "Cotton silk suit", "Denim choli", "Modal trousers", "Khadi dress", "Woolen coat", "Linen sari",
    "Bamboo kurti", "Kalamkari shirt", "Patola blouse", "Ikat pants", "Batik lehenga", "Tissue sari", "Matka silk suit", "Chambray tee", "Slub cotton jacket", "Tulle dupatta",
    "Jacquard sari", "Jamawar kurta", "Kantha embroidered jacket", "Sequined blouse", "Faux leather pant", "Stretch denim skirt", "Foil print choli", "Block print jacket", "Shibori dress", "Jute kurta",
    "Bemberg sari", "Lurex blouse", "Embossed gown", "Chanderi dupatta", "Suede shirt", "Voile kurta", "Mercerized cotton tee", "Poplin pants", "Zari embroidered coat", "Sheer overlay blouse",
    "Metallic sari", "Cambric choli", "Velvet-lined coat", "Lyocell kurti", "Soft twill jacket", "Foil print sari", "Embroidered georgette pants", "Modal silk skirt", "Paisley blouse", "Muslin robe",
    "Tencel cotton tee", "Sheer net dupatta", "Frilled cambric gown", "Crepe sari", "Checked linen pants", "Silk turtleneck blouse", "Tweed kurta", "Waffle knit robe", "Quirky patch sari", "Tartan shirt",
    "Crushed velvet blouse", "Pleated satin skirt", "Soft wash tee", "Bemberg jumpsuit", "Balloon sleeve gown", "Heat-pressed foil blouse", "Moss crepe gown", "Eco silk sari", "Yarn dyed tunic", "Kantha stitch pants",
    "Tie-dye skirt", "Lace crop top", "Dobby weave kurta", "Zari work jacket", "Dual-tone blouse", "Melange hoodie", "Rib knit trousers", "Foil overlay dupatta", "Printed twill robe", "Chambray blazer",
    "Handwoven kurti", "Pastel silk sari", "Indigo hand-block tee", "Cotton lurex tunic", "Gingham shirt", "Mirror stitched blouse", "Slub weave jacket", "Pintucked kurta", "Ombré dyed gown", "Tartan pants", "Semi-stitched suit"
  ],
  "bonus_fashion_fusion": [
    "Kurta with asymmetric hem", "Dhoti jeans", "Ethnic co-ord set", "Saree gown", "Layered lehenga", "Cape-style sherwani", "Indo-western blazer", "Tulip dhoti pants", "Flared saree dress", "Half-jacket kurti",
    "Cowl drape sari", "Dhoti jumpsuit", "Kaftan sherwani", "Sari trousers", "Tunic with harem pants", "Peplum kurta", "Cigarette pants suit", "Pre-stitched saree", "Ruffled anarkali", "Belted kurta",
    "Kurta with cape", "T-shirt sari", "Draped churidar", "Overlay lehenga", "Long line fusion jacket", "Tribal print kurta", "Gown with slit", "Printed dhoti pants", "Flared palazzo sari", "Linen jumpsuit kurta",
    "Tuxedo sherwani", "Double dupatta lehenga", "High slit kurti", "Jodhpuri vest combo", "Shirt sari fusion", "Cropped jacket kurti", "Indo-chic trench kurta", "Jacket sari set", "Lehenga with shirt", "Ethnic hoodie kurta",
    "Corset lehenga choli", "Biker jacket sherwani", "Racerback kurti", "Blazer with dhoti pants", "Embroidered trench dress", "Tunic jumpsuit", "Layered cape kurta", "One-shoulder sari", "Ruffle hem tunic", "Nehru vest with joggers",
    "Asymmetric gown kurti", "Saree poncho", "Zip-front sherwani", "Military-style angarkha", "Oversized kurta hoodie", "Two-tone sari skirt", "Kimono kurti", "Mesh overlay gown", "Festive robe", "Empire-line kurta",
    "Double-button sherwani", "Wrap tunic top", "Harem trousers kurta set", "Indo-fusion sari dhoti", "Palazzo sari with belt", "Fringe kurti", "Laced hem lehenga", "Peplum angarkha", "Denim kurta suit", "Ethnic wrap dress",
    "Suit-style kurta", "Draped back sari", "Cross-button angavastram", "Fishtail lehenga", "Button slit kurta", "Cape sleeve blouse", "Tunic blazer set", "Tulle lehenga kurti", "Split hem sherwani", "Cuffed dhoti pants",
    "Flared bottom sherwani", "Halter-neck jacket kurta", "Quilted blazer with kurta", "Modular sari set", "Minimalist lehenga", "Transparent jacket kurti", "Straight-cut robe", "A-line sherwani", "Convertible sari gown", "Denim dhoti pants",
    "Laser-cut choli", "Floor-length jacket kurta", "Bold printed kurta", "Metallic fusion gown", "Woven robe kurta", "Paneled jacket dhoti", "Floral fusion sari", "Experimental trench kurti", "Structured lehenga blouse", "Abstract print sherwani", "Draped sari jumpsuit", "Zip-slit kurta", "Collarless angarkha"
  ]
};

// Create the exact 1000 clothing catalog
function createExactClothingCatalog() {
  console.log('Creating exact 1000 clothing items catalog...');
  
  let allItems = [];
  let itemId = 1;
  
  // Process each category
  for (const [category, items] of Object.entries(clothingCategories)) {
    console.log(`Adding ${items.length} items from ${category}`);
    
    items.forEach(itemName => {
      allItems.push({
        id: itemId++,
        keyword: itemName,
        name: itemName,
        category: category,
        image_url: `https://dummyimage.com/400x300/667eea/ffffff.png&text=${encodeURIComponent(itemName)}`,
        source: 'placeholder',
        attribution: {
          photographer: 'Placeholder',
          photographer_url: '#',
          photo_url: '#'
        }
      });
    });
  }
  
  console.log(`Total items created: ${allItems.length}`);
  
  // Verify we have exactly 1000 unique items
  const uniqueItems = [...new Set(allItems.map(item => item.name))];
  console.log(`Unique items: ${uniqueItems.length}`);
  
  if (uniqueItems.length !== 1000) {
    console.log('❌ Not exactly 1000 unique items!');
    
    // Find duplicates
    const itemCounts = {};
    allItems.forEach(item => {
      itemCounts[item.name] = (itemCounts[item.name] || 0) + 1;
    });
    
    const duplicates = Object.entries(itemCounts).filter(([name, count]) => count > 1);
    if (duplicates.length > 0) {
      console.log('Duplicate items found:');
      duplicates.forEach(([name, count]) => {
        console.log(`  ${name}: ${count} times`);
      });
    }
    
    // Remove duplicates
    const uniqueItemsMap = new Map();
    allItems.forEach(item => {
      if (!uniqueItemsMap.has(item.name)) {
        uniqueItemsMap.set(item.name, item);
      }
    });
    
    allItems = Array.from(uniqueItemsMap.values());
    console.log(`After removing duplicates: ${allItems.length} items`);
  }
  
  const catalog = {
    metadata: {
      total_keywords: allItems.length,
      successful_images: 0,
      placeholder_images: allItems.length,
      last_updated: new Date().toISOString(),
      api_source: 'user_specified_list',
      description: 'Exact 1000 clothing items as specified by user'
    },
    images: allItems
  };
  
  // Save to the correct location
  const fs = require('fs');
  const path = require('path');
  
  // Save to frontend data folder
  fs.writeFileSync('../data/clothing-catalog.json', JSON.stringify(catalog, null, 2));
  console.log('✅ Saved catalog to ../data/clothing-catalog.json');
  
  // Also save breakdown by category
  const breakdown = {};
  for (const [category, items] of Object.entries(clothingCategories)) {
    breakdown[category] = items.length;
  }
  
  console.log('\n📊 Category breakdown:');
  Object.entries(breakdown).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} items`);
  });
  
  const totalFromBreakdown = Object.values(breakdown).reduce((sum, count) => sum + count, 0);
  console.log(`\n✅ Total items: ${totalFromBreakdown}`);
  
  return catalog;
}

// Run the script
createExactClothingCatalog();
