const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - authentication middleware
const auth = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Support tokens signed as { user: { id } } (current) or { id } (legacy)
      const userId = (decoded && decoded.user && decoded.user.id) || decoded.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Invalid token payload' });
      }

      // Get user from token
      const user = await User.findById(userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No user found with this id'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated'
        });
      }

      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication',
      error: error.message
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = (decoded && decoded.user && decoded.user.id) || decoded.id;
  const user = userId ? await User.findById(userId) : null;
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (err) {
        // Token is invalid, but we continue without user
        req.user = null;
      }
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = {
  auth,
  authorize,
  optionalAuth
};
