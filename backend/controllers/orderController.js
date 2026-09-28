const Order = require('../models/Order');
const Cart = require('../models/Cart'); // 👈 कार्ट मॉडेल इम्पोर्ट करणे आवश्यक आहे

exports.createOrder = async (req, res) => {
    try {
        // १. नवीन ऑर्डर बनवणे आणि सेव्ह करणे
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();

        // २. 👈 ऑर्डर यशस्वी झाल्यावर युझरची कार्ट रिकामी (Clear) करणे
        if (req.body.userId) {
            await Cart.findOneAndUpdate({ userId: req.body.userId }, { items: [] });
        }

        res.status(201).json({ message: 'ऑर्डर यशस्वीरीत्या प्लेस झाली!', order: savedOrder });
    } catch (error) {
        res.status(500).json({ error: 'ऑर्डर करताना एरर आला', details: error.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'name phone')
            .populate('items.productId', 'name price')
            .sort({ createdAt: -1 }); // 👈 नवीन ऑर्डर्स सर्वात वर दिसण्यासाठी (Optional)
            
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: 'ऑर्डर्स मिळवताना एरर आला', details: error.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId })
            .populate('items.productId', 'name image')
            .sort({ createdAt: -1 }); // 👈 नवीन ऑर्डर्स सर्वात वर दिसण्यासाठी (Optional)
            
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: 'ऑर्डर्स मिळवताना एरर आला', details: error.message });
    }
};