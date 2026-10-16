const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const Notification = require('../models/Notification'); 
const bcrypt = require('bcryptjs'); 

// 👉 १. Firebase Admin इम्पोर्ट करा (पुश नोटिफिकेशनसाठी)
const admin = require('firebase-admin'); 

// 1. Delivery boy la assign jhalelya orders milvane
router.get('/assigned-orders/:deliveryBoyId', async (req, res) => {
  try {
    const { deliveryBoyId } = req.params;
    if (!deliveryBoyId || deliveryBoyId === 'undefined') {
      return res.status(400).json({ success: false, error: 'Invalid deliveryBoyId' });
    }
    let queryBoyId = deliveryBoyId;
    if (mongoose.Types.ObjectId.isValid(deliveryBoyId)) {
      queryBoyId = new mongoose.Types.ObjectId(deliveryBoyId);
    }
    const orders = await Order.find({ 
      deliveryBoyId: { $in: [deliveryBoyId, queryBoyId] },
      status: { $ne: 'Delivered' }
    })
    .populate('userId', 'name phone')
    .populate('items.productId', 'name price image')
    .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Delivery boy ne status update karne + शेतकऱ्याला नोटिफिकेशन पाठवणे 🔴
router.put('/update-status/:orderId', async (req, res) => {
  try {
    // 👉 आपण चेक करूया की API कॉल होतेय का आणि कोणता डेटा येतोय
    console.log("👉 Status Update API कॉल झाली! Order ID:", req.params.orderId);
    console.log("👉 Frontend कडून आलेला डेटा:", req.body);

    const { deliveryStatus, lat, lng } = req.body;
    const updateData = {};
    if (deliveryStatus) updateData.deliveryStatus = deliveryStatus;

    if (deliveryStatus === 'Picked_Up') {
      updateData.status = 'Out for Delivery'; 
    } else if (deliveryStatus === 'Delivered') {
      updateData.status = 'Delivered';
      updateData.paymentStatus = 'Paid';
    }
    if (lat && lng) {
      updateData.deliveryBoyLocation = { lat, lng };
    }
    
    const order = await Order.findByIdAndUpdate(req.params.orderId, updateData, { new: true });

    if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
    }

    console.log("👉 ऑर्डर डेटाबेसमध्ये अपडेट झाली. Customer ID:", order.userId);

    // 👉 शेतकऱ्याला नोटिफिकेशन पाठवण्याचा कोड
    if (order.userId) {
        let notifTitle = '';
        let notifMessage = '';

        if (deliveryStatus === 'Picked_Up') {
            notifTitle = 'डिलिव्हरीसाठी निघाली! 🚚';
            notifMessage = `डिलिव्हरी बॉय तुमची ऑर्डर #${order._id.toString().substring(18).toUpperCase()} घेऊन निघाला आहे. लवकरच ती तुमच्यापर्यंत पोहोचेल.`;
        } else if (deliveryStatus === 'Delivered') {
            notifTitle = 'ऑर्डर पोहोचली (Delivered) 🎉';
            notifMessage = 'तुमची ऑर्डर यशस्वीरीत्या तुम्हाला देण्यात आली आहे. शाहूराजे कृषी केंद्रावर खरेदी केल्याबद्दल धन्यवाद!';
        } else {
            console.log("⚠️ Status मॅच झाले नाही. आलेले स्टेटस:", deliveryStatus);
        }

        if (notifTitle) {
            // १. डेटाबेसमध्ये नोटिफिकेशन सेव्ह करा (In-App Notification)
            const userNotification = new Notification({
                userId: order.userId, 
                title: notifTitle,
                message: notifMessage,
                type: 'ORDER',
                relatedId: order._id
            });
            await userNotification.save();

            // २. Firebase द्वारे मोबाईलच्या स्क्रीनवर Push Notification पाठवा
            try {
                const customer = await User.findById(order.userId);
                
                if (customer && customer.fcmToken) {
                    const message = {
                        notification: {
                            title: notifTitle,
                            body: notifMessage
                        },
                        // 👉 बॅकग्राउंडला मेसेज सक्तीने पाठवण्यासाठी नवीन कोड
                        android: {
                            priority: 'high',
                            notification: {
                                channelId: 'shahuraje_orders',
                                sound: 'default'
                            }
                        },
                        token: customer.fcmToken
                    };
                    
                    await admin.messaging().send(message);
                    console.log('✅ Firebase Push Notification यशस्वीरीत्या पाठवले!');
                } else {
                    console.log('❌ शेतकऱ्याचा FCM Token सापडला नाही, त्यामुळे Push Notification गेले नाही.');
                }
            } catch (pushError) {
                console.error('❌ Push notification पाठवताना एरर:', pushError);
            }
        }
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error('❌ API मध्ये एरर आला:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Sarv delivery boys chi list milvane (Admin Web Dropdown sathi)
router.get('/delivery-boys', async (req, res) => {
  try {
    const deliveryBoys = await User.find({ role: 'delivery_boy' }).select('name phone email _id');
    res.status(200).json({ success: true, deliveryBoys });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Admin ne order delivery boy la assign karne
const assignOrderHandler = async (req, res) => {
  try {
    const { orderId, deliveryBoyId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, error: 'Order ID required ahe' });
    }
    const updateFields = {
      deliveryBoyId: deliveryBoyId ? deliveryBoyId : null,
      deliveryStatus: deliveryBoyId ? 'Assigned' : 'Pending',
      status: deliveryBoyId ? 'Processing' : 'Pending'
    };
    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateFields, { new: true })
    .populate('userId', 'name phone')
    .populate('deliveryBoyId', 'name phone');
    res.status(200).json({ success: true, message: 'Delivery boy assign jhala!', order: updatedOrder });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
router.post('/assign-order', assignOrderHandler);
router.put('/assign-order', assignOrderHandler);

// 5. Admin dware navin delivery boy tayar karne
router.post('/add-delivery-boy', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, error: 'सर्व माहिती भरणे आवश्यक आहे.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'हा ईमेल आधीपासून वापरलेला आहे.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newDeliveryBoy = new User({
      name, email, phone, password: hashedPassword, role: 'delivery_boy'
    });
    await newDeliveryBoy.save();

    res.status(201).json({ 
      success: true, 
      message: 'नवीन डिलिव्हरी बॉय यशस्वीरीत्या तयार केला!',
      deliveryBoy: { _id: newDeliveryBoy._id, name: newDeliveryBoy.name, phone: newDeliveryBoy.phone, email: newDeliveryBoy.email }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. ॲडमिनद्वारे डिलिव्हरी बॉयची माहिती आणि पासवर्ड अपडेट करणे
router.put('/update-delivery-boy/:id', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const updateData = { name, email, phone };

    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedBoy = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('name phone email _id');
    res.status(200).json({ success: true, message: 'माहिती यशस्वीरित्या अपडेट झाली!', deliveryBoy: updatedBoy });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;