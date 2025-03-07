const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/secrets');

function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('Token is required');
  
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) return res.status(500).send('Invalid token');
    req.userId = decoded.userId;
    next();
  });
}

module.exports = { verifyToken };
