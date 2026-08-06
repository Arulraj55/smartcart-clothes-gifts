const sampleData = {
  clothes: [
    {
      _id: '1',
      name: 'Premium Cotton T-Shirt',
      description: 'Soft, breathable cotton t-shirt perfect for everyday wear',
      price: 599,
      category: 'T-Shirts',
      subcategory: 'shirts',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['White', 'Black', 'Navy', 'Gray'],
      stock: 50,
      images: ['https://m.media-amazon.com/images/I/71vFKBpKakL._AC_UL320_.jpg'],
      brand: 'SmartCart Basics',
      rating: 4.5,
      reviews: 128,
      featured: true,
      tags: ['casual', 'cotton', 'comfortable']
    },
    {
      _id: '2',
      name: 'Classic Denim Jeans',
      description: 'High-quality denim jeans with perfect fit and comfort',
      price: 1299,
      category: 'Jeans',
      subcategory: 'jeans',
      sizes: ['28', '30', '32', '34', '36'],
      colors: ['Blue', 'Black', 'Gray'],
      stock: 35,
      images: ['https://m.media-amazon.com/images/I/61Kx6-W-WqL._AC_UL320_.jpg'],
      brand: 'SmartCart Denim',
      rating: 4.7,
      reviews: 89,
      featured: true,
      tags: ['denim', 'casual', 'classic']
    }
  ],
  
  footwear: [
    {
      _id: '7',
      name: 'Pro Athletic Running Sneakers',
      description: 'Cushioned foam midsole with breathable mesh upper for peak athletic performance.',
      price: 2499,
      discounted_price: 1299,
      category: 'Sneakers',
      subcategory: 'sports',
      sizes: ['6', '7', '8', '9', '10', '11'],
      colors: ['Black', 'White', 'Blue'],
      stock: 100,
      images: ['https://m.media-amazon.com/images/I/51rHrC7np-L._AC_UL320_.jpg'],
      brand: 'SmartCart Footwear',
      rating: 4.8,
      reviews: 310,
      featured: true,
      tags: ['sneakers', 'sports', 'running', 'footwear']
    },
    {
      _id: '8',
      name: 'Handcrafted Genuine Leather Loafers',
      description: 'Premium suede leather loafers featuring flexible TPR sole and cushioned footbed.',
      price: 3499,
      discounted_price: 1899,
      category: 'Loafers',
      subcategory: 'casual',
      sizes: ['6', '7', '8', '9', '10', '11'],
      colors: ['Tan', 'Brown', 'Black'],
      stock: 60,
      images: ['https://m.media-amazon.com/images/I/51s1cfE85lL._AC_UL320_.jpg'],
      brand: 'SmartCart Luxe',
      rating: 4.7,
      reviews: 194,
      featured: true,
      tags: ['loafers', 'leather', 'formal', 'footwear']
    }
  ]
};

module.exports = sampleData;
