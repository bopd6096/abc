const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/', verifyToken, orderController.createOrder);
router.get('/user', verifyToken, orderController.getOrdersByUser);

module.exports = router;
