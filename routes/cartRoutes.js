const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, cartController.getCart);
router.post('/add', verifyToken, cartController.addToCart);
router.post('/remove', verifyToken, cartController.removeFromCart);

module.exports = router;
