const { verifyToken } = require('../utils/auth');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const authorizeEmployer = (req, res, next) => {
  if (req.user.userType !== 'employer') {
    return res.status(403).json({ message: 'Access denied. Employers only.' });
  }
  next();
};

const authorizeJobSeeker = (req, res, next) => {
  if (req.user.userType !== 'job_seeker') {
    return res.status(403).json({ message: 'Access denied. Job seekers only.' });
  }
  next();
};

module.exports = {
  authenticate,
  authorizeEmployer,
  authorizeJobSeeker
};