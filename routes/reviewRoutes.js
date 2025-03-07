const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/:productId', verifyToken, reviewController.addReview);
router.get('/:productId', reviewController.getReviews);

module.exports = router;
