const Order = require('../models/Order');
const Notification = require('../models/Notification'); // 👈 नोटिफिकेशन मॉडेल इम्पोर्ट केले

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

        // 👉 ॲडमिनसाठी नवीन नोटिफिकेशन तयार करा
        const adminNotification = new Notification({
            userId: null, // null म्हणजे हे ॲडमिनसाठी आहे
            title: 'नवीन ऑर्डर प्राप्त!',
            // 👇 इथे मी मेसेज एकाच लाईनमध्ये व्यवस्थित लिहिला आहे
            message: `ऑर्डर #${savedOrder._id.toString().substring(18).toUpperCase()} - ₹${savedOrder.totalAmount} ची नवीन ऑर्डर आली आहे.`,
            type: 'ORDER',
            relatedId: savedOrder._id
        });
        await adminNotification.save();

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

        // 👉 जर ऑर्डरचे स्टेटस बदलले असेल, तर शेतकऱ्याला नोटिफिकेशन पाठवा
        if (status) {
            let notifTitle = 'ऑर्डर अपडेट';
            let notifMessage = `तुमच्या ऑर्डर #${updatedOrder._id.toString().substring(18).toUpperCase()} चे स्टेटस '${status}' करण्यात आले आहे.`;

            if (status === 'Processing') {
                notifTitle = 'ऑर्डर स्वीकारली ✅';
                notifMessage = 'तुमची ऑर्डर दुकानातून स्वीकारण्यात आली आहे आणि लवकरच पाठवली जाईल.';
            } else if (status === 'Delivered') {
                notifTitle = 'ऑर्डर डिलिव्हर्ड 🎉';
                notifMessage = 'तुमची ऑर्डर यशस्वीरीत्या पोहोचवली गेली आहे. शाहूराजे कृषी केंद्रावर खरेदी केल्याबद्दल धन्यवाद!';
            }

            const userNotification = new Notification({
                userId: updatedOrder.userId, // ज्या शेतकऱ्याची ऑर्डर आहे त्याचा ID
                title: notifTitle,
                message: notifMessage,
                type: 'ORDER',
                relatedId: updatedOrder._id
            });
            await userNotification.save();
        }

        res.status(200).json({ message: 'ऑर्डर स्टेटस अपडेट झाले!', order: updatedOrder });
    } catch (error) {
        console.error("Status Update Error:", error);
        res.status(500).json({ error: 'स्टेटस अपडेट करताना एरर आला', details: error.message });
    }
};