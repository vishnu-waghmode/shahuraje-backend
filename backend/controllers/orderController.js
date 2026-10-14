const Order = require('../models/Order');

// 1. नवीन ऑर्डर तयार करणे (COD & Direct Orders)
exports.createOrder = async (req, res) => {
    try {
        const orderData = {
            ...req.body,
            // पेमेंट मेथडनुसार डिफॉल्ट स्टेटस ठरवणे
            paymentStatus: req.body.paymentStatus || (req.body.paymentMethod === 'ONLINE' ? 'Paid' : 'Pending')
        };

        const newOrder = new Order(orderData);
        const savedOrder = await newOrder.save();

        res.status(201).json({ 
            success: true,
            message: 'ऑर्डर यशस्वीरीत्या नोंदवली गेली!', 
            order: savedOrder 
        });
    } catch (error) {
        console.error("Order creation error:", error);
        res.status(500).json({ error: 'ऑर्डर करताना एरर आला', details: error.message });
    }
};

// 2. सर्व ऑर्डर्स मिळवणे (Admin साठी)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'name phone')
            .populate('items.productId', 'name price image')
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
            .populate('items.productId', 'name image price')
            .sort({ createdAt: -1 });
            
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: 'ऑर्डर्स मिळवताना एरर आला', details: error.message });
    }
};

// 4. ऑर्डर आणि पेमेंट स्टेटस अपडेट करणे (Admin साठी)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, paymentStatus } = req.body;
        
        const updateFields = {};
        if (status) updateFields.status = status;
        if (paymentStatus) updateFields.paymentStatus = paymentStatus;

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ error: 'ऑर्डर सापडली नाही' });
        }

        res.status(200).json({ message: 'ऑर्डर स्टेटस अपडेट झाले!', order: updatedOrder });
    } catch (error) {
        res.status(500).json({ error: 'स्टेटस अपडेट करताना एरर आला', details: error.message });
    }
};