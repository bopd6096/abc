const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/secrets');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '2h' });
    res.status(201).json({ token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Невірні дані" });
    
    const isMatch = await require('bcrypt').compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Невірні дані" });
    
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '2h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
