const jwt = require('jsonwebtoken');
const User = require('../models/user.model.js');

const protect = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id)
      .select('_id name email role department profileImage')
      .lean();

    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// We can also add a specific check for HODs
const isHod = (req, res, next) => {
  if (req.user && req.user.role === 'hod') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized, only HODs can perform this action.' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized, only Admins can perform this action.' });
  }
};

const isAdminOrHod = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'hod')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized, only Admins or HODs can perform this action.' });
  }
};

module.exports = { protect, isHod, isAdmin, isAdminOrHod };
