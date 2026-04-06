const jwt = require('jsonwebtoken');
const User = require('../models/user.model.js');

const protect = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Find the user from the token's ID and attach them to the request
      // We do '-password' to make sure we don't attach the password
      req.user = await User.findById(decoded.id).select('-password');

      next();

    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
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