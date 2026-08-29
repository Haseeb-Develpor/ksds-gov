const jwt = require('jsonwebtoken');

const SECRET = () => process.env.JWT_SECRET || 'dev-secret';

function sign(user) {
  return jwt.sign({ id: user._id, role: user.role }, SECRET(), { expiresIn: process.env.JWT_EXPIRES || '7d' });
}

function auth(required = true) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      if (required) return res.status(401).json({ message: 'Authentication required' });
      return next();
    }
    try {
      req.user = jwt.verify(token, SECRET());
      next();
    } catch {
      if (required) return res.status(401).json({ message: 'Invalid or expired token' });
      next();
    }
  };
}

function admin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
}

module.exports = { sign, auth, admin };
