const jwt = require('jsonwebtoken');
const resUtils = require('../utils/response');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return resUtils.unauthorized(res, 'Access denied. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    resUtils.unauthorized(res, 'Invalid token.');
  }
};

const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return resUtils.forbidden(res, 'Access denied. Admin only.');
  }
  next();
};

module.exports = { auth, adminAuth };