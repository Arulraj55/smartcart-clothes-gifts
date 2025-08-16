const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const sampleData = require('../data/sampleData');

// @route   GET /api/products
// @desc    Get all products with filtering, sorting, and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      category,
      subcategory,
      minPrice,
      maxPrice,
      brand,
      size,
      color,
      search,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    // For demo purposes, return sample data
    let products = [...sampleData.clothes, ...sampleData.gifts];

    // Apply filters
    if (category) {
      products = products.filter(product => product.category === category);
    }

    if (subcategory) {
      products = products.filter(product => product.subcategory === subcategory);
    }

    if (minPrice || maxPrice) {
      products = products.filter(product => {
        const price = product.price;
        if (minPrice && price < parseFloat(minPrice)) return false;
        if (maxPrice && price > parseFloat(maxPrice)) return false;
        return true;
      });
    }

    if (brand) {
      products = products.filter(product => 
        product.brand.toLowerCase().includes(brand.toLowerCase())
      );
    }

    if (search) {
      products = products.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Apply sorting
    products.sort((a, b) => {
      let aValue = a[sort];
      let bValue = b[sort];
      
      if (sort === 'price' || sort === 'rating') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }
      
      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = products.slice(startIndex, endIndex);

    res.json({
      success: true,
      products: paginatedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalProducts: products.length,
        totalPages: Math.ceil(products.length / limit),
        hasNextPage: endIndex < products.length,
        hasPrevPage: page > 1
      },
      filters: {
        category,
        subcategory,
        minPrice,
        maxPrice,
        brand,
        search
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

// @route   GET /api/products/clothes
// @desc    Get clothes products only
// @access  Public
router.get('/clothes', async (req, res) => {
  try {
    const { subcategory, sort = 'featured', page = 1, limit = 12 } = req.query;
    
    let clothes = [...sampleData.clothes];

    if (subcategory) {
      clothes = clothes.filter(product => product.subcategory === subcategory);
    }

    // Sort by featured first, then by rating
    clothes.sort((a, b) => {
      if (sort === 'featured') {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.rating - a.rating;
      }
      return b[sort] - a[sort];
    });

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedClothes = clothes.slice(startIndex, endIndex);

    res.json({
      success: true,
      products: paginatedClothes,
      total: clothes.length,
      category: 'clothes'
    });
  } catch (error) {
    console.error('Get clothes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clothes',
      error: error.message
    });
  }
});

// @route   GET /api/products/gifts
// @desc    Get gifts products only
// @access  Public
router.get('/gifts', async (req, res) => {
  try {
    const { subcategory, sort = 'featured', page = 1, limit = 12 } = req.query;
    
    let gifts = [...sampleData.gifts];

    if (subcategory) {
      gifts = gifts.filter(product => product.subcategory === subcategory);
    }

    // Sort by featured first, then by rating
    gifts.sort((a, b) => {
      if (sort === 'featured') {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.rating - a.rating;
      }
      return b[sort] - a[sort];
    });

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedGifts = gifts.slice(startIndex, endIndex);

    res.json({
      success: true,
      products: paginatedGifts,
      total: gifts.length,
      category: 'gifts'
    });
  } catch (error) {
    console.error('Get gifts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gifts',
      error: error.message
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find product in sample data
    const allProducts = [...sampleData.clothes, ...sampleData.gifts];
    const product = allProducts.find(p => p._id === id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
});

// @route   GET /api/products/category/:category
// @desc    Get products by category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { sort = 'featured', page = 1, limit = 12 } = req.query;

    let products;
    if (category === 'clothes') {
      products = [...sampleData.clothes];
    } else if (category === 'gifts') {
      products = [...sampleData.gifts];
    } else {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Sort products
    products.sort((a, b) => {
      if (sort === 'featured') {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.rating - a.rating;
      } else if (sort === 'price-low') {
        return a.price - b.price;
      } else if (sort === 'price-high') {
        return b.price - a.price;
      } else if (sort === 'rating') {
        return b.rating - a.rating;
      }
      return 0;
    });

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = products.slice(startIndex, endIndex);

    res.json({
      success: true,
      products: paginatedProducts,
      total: products.length,
      category
    });
  } catch (error) {
    console.error('Get category products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category products',
      error: error.message
    });
  }
});

module.exports = router;
