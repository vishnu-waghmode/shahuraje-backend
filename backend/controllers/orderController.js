const Order = require('../models/Order');

// 1. नवीन ऑर्डर तयार करणे
exports.createOrder = async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();

        // (इथून आपण Cart चा कोड काढून टाकला आहे, कारण Frontend ते काम करत आहे)

        res.status(201).json({ message: 'ऑर्डर यशस्वीरीत्या प्लेस झाली!', order: savedOrder });
    } catch (error) {
        res.status(500).json({ error: 'ऑर्डर करताना एरर आला', details: error.message });
    }
};

// 2. सर्व ऑर्डर्स मिळवणे (Admin साठी)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'name phone')
            .populate('items.productId', 'name price')
            .sort({ createdAt: -1 });
            
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: 'ऑर्डर्स मिळवताना एरर आला', details: error.message });
    }
};

// 3. विशिष्ट युझरच्या ऑर्डर्स मिळवणे (शेतकऱ्यासाठी)
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId })
            .populate('items.productId', 'name image')
            .sort({ createdAt: -1 });
            
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: 'ऑर्डर्स मिळवताना एरर आला', details: error.message });
    }
};

// 4. ऑर्डर स्टेटस अपडेट करणे (Admin साठी)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { new: true }
        );
        res.status(200).json({ message: 'ऑर्डर स्टेटस अपडेट झाले!', order: updatedOrder });
    } catch (error) {
        res.status(500).json({ error: 'स्टेटस अपडेट करताना एरर आला', details: error.message });
    }
};