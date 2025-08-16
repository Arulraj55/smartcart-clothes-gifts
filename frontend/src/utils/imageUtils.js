// Image utility to generate proper product images
export const generateProductImage = (type, gender, name, colorIndex = 0) => {
  // Define specific image collections for each product type
  const imageCollections = {
    // Clothes
    shirts: {
      men: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', // men's casual shirt
        'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d', // men's t-shirt
        'https://images.unsplash.com/photo-1583743814966-8936f37f4a16', // men's dress shirt
        'https://images.unsplash.com/photo-1571945153237-4929e783af4a', // men's polo
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990', // men's button up
      ],
      women: [
        'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec', // women's blouse
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105', // women's t-shirt
        'https://images.unsplash.com/photo-1551232864-3f0890e580d9', // women's top
        'https://images.unsplash.com/photo-1596783074918-c84cb06531ca', // women's shirt
        'https://images.unsplash.com/photo-1485968504862-3e4d0e4de8be', // women's casual top
      ]
    },
    jeans: {
      men: [
        'https://images.unsplash.com/photo-1542272604-787c3835535d', // men's jeans
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80', // men's denim
        'https://images.unsplash.com/photo-1555689502-c4b22d76c56f', // men's blue jeans
        'https://images.unsplash.com/photo-1551698618-1dfe5d97d256', // men's casual jeans
        'https://images.unsplash.com/photo-1606914469633-ca7b0b5818b8', // men's dark jeans
      ],
      women: [
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246', // women's jeans
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1', // women's denim
        'https://images.unsplash.com/photo-1582418702059-97ebafb35d09', // women's skinny jeans
        'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3', // women's blue jeans
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c', // women's high waist jeans
      ]
    },
    dresses: {
      women: [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8', // elegant dress
        'https://images.unsplash.com/photo-1566479179817-c0b2eaaa10d5', // casual dress
        'https://images.unsplash.com/photo-1539008835657-9e8e9680c956', // summer dress
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446', // party dress
        'https://images.unsplash.com/photo-1588117305388-c2631a279f41', // midi dress
      ]
    },
    skirts: {
      women: [
        'https://images.unsplash.com/photo-1583846112901-f4490d8eb4ee', // pencil skirt
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1', // denim skirt
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f', // pleated skirt
        'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c', // mini skirt
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96', // maxi skirt
      ]
    },
    jackets: {
      men: [
        'https://images.unsplash.com/photo-1544966503-7cc5ac882d5b', // men's jacket
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea', // men's bomber jacket
        'https://images.unsplash.com/photo-1520975954732-35dd22299614', // men's leather jacket
        'https://images.unsplash.com/photo-1594938374896-b99b4f71893b', // men's denim jacket
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa', // men's blazer
      ],
      women: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96', // women's blazer
        'https://images.unsplash.com/photo-1580402666939-ee73687642bb', // women's coat
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f', // women's jacket
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1', // women's denim jacket
        'https://images.unsplash.com/photo-1596155874229-dc9b51d3ed71', // women's cardigan
      ]
    },
    trousers: {
      men: [
        'https://images.unsplash.com/photo-1594938374896-b99b4f71893b', // men's dress pants
        'https://images.unsplash.com/photo-1506629905607-c331d8a0d3d2', // men's chinos
        'https://images.unsplash.com/photo-1581795074194-b14db624a2ee', // men's trousers
        'https://images.unsplash.com/photo-1566479179817-c0b2eaaa10d5', // men's formal pants
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990', // men's casual pants
      ],
      women: [
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1', // women's pants
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96', // women's trousers
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f', // women's dress pants
        'https://images.unsplash.com/photo-1596155874229-dc9b51d3ed71', // women's wide leg pants
        'https://images.unsplash.com/photo-1580402666939-ee73687642bb', // women's formal trousers
      ]
    },
    sweaters: {
      men: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', // men's sweater
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990', // men's pullover
        'https://images.unsplash.com/photo-1581795074194-b14db624a2ee', // men's knit sweater
        'https://images.unsplash.com/photo-1594938374896-b99b4f71893b', // men's cardigan
        'https://images.unsplash.com/photo-1506629905607-c331d8a0d3d2', // men's hoodie
      ],
      women: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96', // women's sweater
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f', // women's cardigan
        'https://images.unsplash.com/photo-1580402666939-ee73687642bb', // women's knit top
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1', // women's pullover
        'https://images.unsplash.com/photo-1596155874229-dc9b51d3ed71', // women's cozy sweater
      ]
    },
    shorts: {
      men: [
        'https://images.unsplash.com/photo-1506629905607-c331d8a0d3d2', // men's shorts
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990', // men's casual shorts
        'https://images.unsplash.com/photo-1581795074194-b14db624a2ee', // men's denim shorts
        'https://images.unsplash.com/photo-1594938374896-b99b4f71893b', // men's cargo shorts
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', // men's athletic shorts
      ],
      women: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96', // women's shorts
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f', // women's denim shorts
        'https://images.unsplash.com/photo-1580402666939-ee73687642bb', // women's high waist shorts
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1', // women's casual shorts
        'https://images.unsplash.com/photo-1596155874229-dc9b51d3ed71', // women's summer shorts
      ]
    }
  };

  // Gifts images
  const giftCollections = {
    toys: [
      'https://images.unsplash.com/photo-1558060370-d140d2fcb6f5', // teddy bear
      'https://images.unsplash.com/photo-1551238260-a8c78be1d31d', // toy car
      'https://images.unsplash.com/photo-1544966503-7cc5ac882d5b', // plush toy
      'https://images.unsplash.com/photo-1506629905607-c331d8a0d3d2', // wooden toys
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990', // educational toys
    ],
    electronics: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085', // computer
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d', // smartphone
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e', // headphones
      'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0', // electronics
      'https://images.unsplash.com/photo-1580894732444-8ecded7900cd', // gadgets
    ],
    books: [
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570', // books
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', // library
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c', // reading
      'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6', // book collection
      'https://images.unsplash.com/photo-1495446815901-a7297e633e8d', // open book
    ],
    jewelry: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338', // jewelry
      'https://images.unsplash.com/photo-1506629905607-c331d8a0d3d2', // necklace
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990', // earrings
      'https://images.unsplash.com/photo-1581795074194-b14db624a2ee', // bracelet
      'https://images.unsplash.com/photo-1594938374896-b99b4f71893b', // ring
    ],
    home: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7', // home decor
      'https://images.unsplash.com/photo-1571079570759-504609307-', // plant
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', // candle
      'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6', // vase
      'https://images.unsplash.com/photo-1495446815901-a7297e633e8d', // pillow
    ]
  };

  // Get the appropriate collection
  let collection;
  if (imageCollections[type]) {
    collection = imageCollections[type][gender] || imageCollections[type]['men'] || imageCollections[type]['women'];
  } else {
    // For gifts, use gift collections
    if (name.toLowerCase().includes('teddy') || name.toLowerCase().includes('bear') || name.toLowerCase().includes('toy')) {
      collection = giftCollections.toys;
    } else if (name.toLowerCase().includes('book') || name.toLowerCase().includes('journal')) {
      collection = giftCollections.books;
    } else if (name.toLowerCase().includes('necklace') || name.toLowerCase().includes('bracelet') || name.toLowerCase().includes('jewelry')) {
      collection = giftCollections.jewelry;
    } else if (name.toLowerCase().includes('home') || name.toLowerCase().includes('plant') || name.toLowerCase().includes('candle')) {
      collection = giftCollections.home;
    } else {
      collection = giftCollections.electronics;
    }
  }

  if (!collection) {
    // Fallback to a default image
    return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop';
  }

  // Select image based on color index or random
  const imageIndex = colorIndex % collection.length;
  const baseUrl = collection[imageIndex];
  
  // Add Unsplash parameters for consistent sizing
  return `${baseUrl}?w=400&h=400&fit=crop&crop=center`;
};

export default generateProductImage;
