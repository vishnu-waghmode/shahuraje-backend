const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User'); // युझर मॉडेल आवश्यक आहे

// १. डिलिव्हरी बॉयला नेमून दिलेल्या सर्व ऑर्डर्स मिळवणे (Mobile App साठी)
router.get('/assigned-orders/:deliveryBoyId', async (req, res) => {
  try {
    const orders = await Order.find({ 
      deliveryBoyId: req.params.deliveryBoyId,
      status: { $ne: 'Delivered' } // ज्या ऑर्डर्स पूर्ण झाल्या नाहीत त्या दाखवा
    })
    .populate('userId', 'name phone')
    .populate('items.productId', 'name price image')
    .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// २. डिलिव्हरी बॉयने स्टेटस अपडेट करणे (उदा. Picked_Up किंवा Delivered - Mobile App साठी)
router.put('/assign-order', async (req, res) => {
  try {
    const { orderId, deliveryBoyId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, error: 'Order ID आवश्यक आहे' });
    }

    const updateFields = {
      deliveryBoyId: deliveryBoyId ? deliveryBoyId : null,
      deliveryStatus: deliveryBoyId ? 'Assigned' : 'Pending',
    };

    // ऑर्डर स्टेटस Processing करणे (जर ती Delivered नसेल तर)
    if (deliveryBoyId) {
      updateFields.status = 'Processing';
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateFields,
      { new: true }
    );

    res.status(200).json({ 
      success: true, 
      message: 'डिलिव्हरी बॉय यशस्वीरीत्या नेमला गेला!', 
      order: updatedOrder 
    });
  } catch (err) {
    console.error("Assign Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ३. सर्व रजिस्टर असलेल्या डिलिव्हरी बॉईजची यादी मिळवणे (Admin Web Dropdown साठी)
router.get('/delivery-boys', async (req, res) => {
  try {
    const deliveryBoys = await User.find({ role: 'delivery_boy' }).select('name phone _id');
    res.status(200).json({ success: true, deliveryBoys });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ४. ॲडमिनने ऑर्डर डिलिव्हरी बॉयला सोपवणे (Assign Order - Admin Web साठी)
router.put('/assign-order', async (req, res) => {
  try {
    const { orderId, deliveryBoyId } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        deliveryBoyId: deliveryBoyId || null,
        deliveryStatus: deliveryBoyId ? 'Assigned' : 'Pending',
        status: deliveryBoyId ? 'Processing' : 'Pending'
      },
      { new: true }
    )
    .populate('userId', 'name phone')
    .populate('deliveryBoyId', 'name phone');

    res.status(200).json({ 
      success: true, 
      message: 'डिलिव्हरी बॉय यशस्वीरीत्या निवडला!', 
      order: updatedOrder 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;