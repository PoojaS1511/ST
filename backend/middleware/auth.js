const jwt = require('jsonwebtoken');
const { supabase, TABLES } = require('../config/database');
const { logError } = require('../utils/logger');

// Protect routes - requires authentication
exports.protect = async (req, res, next) => {
  let token;
  
  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // Get token from cookie
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({ 
      status: 'error',
      message: 'Not authorized to access this route. No token provided.'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from the database
    const { data: user, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized. User not found.'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        status: 'error',
        message: 'User account is deactivated.'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    logError(error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized. Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Session expired. Please log in again.'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Server error during authentication.'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user is the owner of the resource or admin
exports.checkOwnership = (model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName];
      const userId = req.user.id;
      
      // Admin can access any resource
      if (req.user.role === 'admin') {
        return next();
      }
      
      // Get the resource
      const { data: resource, error } = await supabase
        .from(model)
        .select('user_id')
        .eq('id', resourceId)
        .single();
      
      if (error || !resource) {
        return res.status(404).json({
          status: 'error',
          message: 'Resource not found'
        });
      }
      
      // Check if user is the owner
      if (resource.user_id !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to access this resource'
        });
      }
      
      next();
    } catch (error) {
      logError(error);
      res.status(500).json({
        status: 'error',
        message: 'Server error during authorization check'
      });
    }
  };
};
