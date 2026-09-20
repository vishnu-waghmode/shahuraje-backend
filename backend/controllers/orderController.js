const Order = require('../models/Order');
exports.createOrder = async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();
        res.status(201).json({ message: 'ऑर्डर यशस्वीरीत्या प्लेस झाली!', order: savedOrder });
    } catch (error) {
        res.status(500).json({ error: 'ऑर्डर करताना एरर आला', details: error.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'name phone')
            .populate('items.productId', 'name price');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: 'ऑर्डर्स मिळवताना एरर आला', details: error.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId })
            .populate('items.productId', 'name image');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: 'ऑर्डर्स मिळवताना एरर आला', details: error.message });
    }
};