const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/database');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header' });
    }

    if (authHeader.startsWith('Basic ')) {
      // Basic Authentication
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
      const [email, password] = credentials.split(':');

      const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      req.user = user;
      next();
    } else if (authHeader.startsWith('Bearer ')) {
      // JWT Authentication
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await db.get('SELECT * FROM users WHERE email = ?', [decoded.email]);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user;
      next();
    } else {
      return res.status(401).json({ message: 'Invalid authorization header' });
    }
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const isLibrarian = (req, res, next) => {
  if (req.user && req.user.role === 'librarian') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Librarian role required.' });
  }
};

module.exports = {
  authenticate,
  isLibrarian,
  generateToken
};
