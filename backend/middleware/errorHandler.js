// Error handling middleware for SmartCart: Clothes & Gifts
const errorHandler = (err, req, res, next) => {
  console.error('Error in SmartCart:', err.message);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error in SmartCart: Clothes & Gifts',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
