import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      console.warn(`[Auth] No token provided for ${req.method} ${req.path}`);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id);

    if (!user) {
      console.warn(`[Auth] User not found for token with ID: ${decoded.id}`);
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    console.log(`[Auth] ✓ Authenticated user: ${user.email}`);
    next();
  } catch (error) {
    console.error(`[Auth] Error: ${error.message}`);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token invalid'
    });
  }
};

export default protect;
