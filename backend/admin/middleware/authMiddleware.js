const jwt = require('jsonwebtoken');
const BackendUser = require('../models/backendUser/backendUser.model');

/**
 * ✅ Auth Middleware: Verify JWT token
 */
const auth = async (req, res, next) => {
  try {
    // Extract token from header
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, access denied',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user from DB
    const user = await BackendUser.findById(decoded.id).populate('roleAndPermissionModel');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found or deleted',
      });
    }

    // Attach user info to request
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.roleAndPermissionModel?.role || 'No Role',
      permissions: user.roleAndPermissionModel,
    };

    next(); // Continue to next middleware or route handler
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

module.exports = auth;
