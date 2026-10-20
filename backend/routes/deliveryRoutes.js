const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const Notification = require('../models/Notification'); 
const bcrypt = require('bcryptjs'); 

const { getMessaging } = require('firebase-admin/messaging'); 

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

// 2. Delivery boy ne status update karne + Shetkaryala push notification
router.put('/update-status/:orderId', async (req, res) => {
  try {
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

    if (order.userId) {
      let notifTitle = '';
      let notifMessage = '';

      if (deliveryStatus === 'Picked_Up') {
        notifTitle = 'डिलिव्हरीसाठी निघाली! 🚚';
        notifMessage = `डिलिव्हरी बॉय तुमची ऑर्डर #${order._id.toString().substring(18).toUpperCase()} घेऊन निघाला आहे. लवकरच ती तुमच्यापर्यंत पोहोचेल.`;
      } else if (deliveryStatus === 'Delivered') {
        notifTitle = 'ऑर्डर पोहोचली (Delivered) 🎉';
        notifMessage = 'तुमची ऑर्डर यशस्वीरीत्या तुम्हाला देण्यात आली आहे. शाहूराजे कृषी केंद्रावर खरेदी केल्याबद्दल धन्यवाद!';
      }

      if (notifTitle) {
        // 1. In-App Notification save
        try {
          const userNotification = new Notification({
            userId: order.userId, 
            title: notifTitle,
            message: notifMessage,
            type: 'ORDER',
            relatedId: order._id,
            isRead: false
          });
          await userNotification.save();
        } catch (dbErr) {
          console.error("Notification DB save error:", dbErr);
        }

        // 2. Firebase Push Notification (शेतकऱ्यासाठी)
        try {
          const customer = await User.findById(order.userId);
          
          if (customer && customer.fcmToken) {
            const message = {
              token: customer.fcmToken,
              notification: {
                title: notifTitle,
                body: notifMessage
              },
              data: {
                route: '/orders',
                type: 'ORDER',
                orderId: order._id.toString()
              },
              android: {
                priority: 'high',
                notification: {
                  channelId: 'shahuraje_orders',
                  sound: 'default',
                  defaultSound: true,
                  defaultVibrateTimings: true,
                  priority: 'high'
                }
              }
            };
            
            const pushResponse = await getMessaging().send(message);
            console.log('✅ Firebase Delivery Push Response:', pushResponse);
          }
        } catch (pushError) {
          console.error('❌ Delivery push error:', pushError);
        }
      }
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Sarv delivery boys chi list milvane
router.get('/delivery-boys', async (req, res) => {
  try {
    const deliveryBoys = await User.find({ role: 'delivery_boy' }).select('name phone email _id');
    res.status(200).json({ success: true, deliveryBoys });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Admin ne order delivery boy la assign karne + Delivery Boy ला Push Notification पाठवणे 🔴
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

    // 🔴 ॲडमिनने डिलिव्हरी बॉय सिलेक्ट केल्यावर त्याला थेट मोबाईलवर नोटिफिकेशन पाठवणे
    if (deliveryBoyId) {
      try {
        const boy = await User.findById(deliveryBoyId);

        if (boy && boy.fcmToken) {
          const shortOrderId = updatedOrder._id.toString().substring(18).toUpperCase();
          const customerName = updatedOrder.customerName || updatedOrder.userId?.name || 'शेतकरी ग्राहक';

          // १. डेटाबेसमध्ये डिलिव्हरी बॉयसाठी नोटिफिकेशन सेव्ह करणे
          await Notification.create({
            userId: boy._id,
            title: 'नवीन डिलिव्हरी मिळाली! 📦',
            message: `तुम्हाला ऑर्डर #${shortOrderId} (${customerName}) डिलिव्हर करण्यासाठी दिली आहे. कृपया तपासा.`,
            type: 'DELIVERY_ASSIGNED',
            relatedId: updatedOrder._id,
            isRead: false
          });

          // २. Firebase द्वारे डिलिव्हरी बॉयच्या फोनवर पुश नोटिफिकेशन पाठवणे
          const boyMessage = {
            token: boy.fcmToken,
            notification: {
              title: 'नवीन डिलिव्हरी मिळाली! 📦',
              body: `ऑर्डर #${shortOrderId} (${customerName}) तुमच्याकडे सोपवली आहे. डॅशबोर्ड उघडा.`
            },
            data: {
              route: '/delivery-dashboard',
              type: 'DELIVERY_ASSIGNED',
              orderId: updatedOrder._id.toString()
            },
            android: {
              priority: 'high',
              notification: {
                channelId: 'shahuraje_orders',
                sound: 'default',
                defaultSound: true,
                defaultVibrateTimings: true,
                priority: 'high'
              }
            }
          };

          const pushResponse = await getMessaging().send(boyMessage);
          console.log('✅ डिलिव्हरी बॉयला पुश नोटिफिकेशन गेले! Response:', pushResponse);
        } else {
          console.warn('⚠️ या डिलिव्हरी बॉयचा FCM Token डेटाबेसमध्ये सापडला नाही.');
        }
      } catch (pushErr) {
        console.error('❌ डिलिव्हरी बॉयला पुश पाठवताना एरर:', pushErr);
      }
    }

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

// 6. Admin dware delivery boy update karne
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