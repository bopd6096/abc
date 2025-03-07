const Order = require('../models/order');

exports.createOrder = async (req, res) => {
  try {
    const { products } = req.body;
    let totalAmount = 0;
    const orderProducts = await Promise.all(products.map(async product => {
      const productData = await require('../models/product').findById(product.productId);
      totalAmount += productData.price * product.quantity;
      return {
        productId: product.productId,
        quantity: product.quantity,
        price: productData.price,
      };
    }));
    
    const order = new Order({
      userId: req.userId,
      products: orderProducts,
      totalAmount,
      status: 'pending',
    });
    
    await order.save();
    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
