// Зауважте: ця логіка працює за умови, що модель корзини (Cart) існує.
// Якщо її немає, можна інтегрувати логіку в модель Order або створити окрему модель.
const Cart = require('../models/cart');

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.userId },
      { $push: { items: req.body.productId } },
      { new: true, upsert: true }
    );
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.userId },
      { $pull: { items: req.body.productId } },
      { new: true }
    );
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
