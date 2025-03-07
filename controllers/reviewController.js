const Review = require('../models/review');

exports.addReview = async (req, res) => {
  try {
    const review = new Review({
      productId: req.params.productId,
      userId: req.userId,
      rating: req.body.rating,
      comment: req.body.comment,
    });
    await review.save();
    res.status(201).json({ message: "Review added successfully", review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
