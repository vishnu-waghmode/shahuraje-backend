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
router.put('/update-status/:orderId', async (req, res) => {
  try {
    const { deliveryStatus, lat, lng } = req.body;
    
    const updateData = {};
    if (deliveryStatus) updateData.deliveryStatus = deliveryStatus;

    // जेव्हा तो पिकअप करेल तेव्हा मुख्य ऑर्डर स्टेटस Processing होईल
    if (deliveryStatus === 'Picked_Up') {
      updateData.status = 'Processing';
    } 
    // जेव्हा तो डिलिव्हर करेल
    else if (deliveryStatus === 'Delivered') {
      updateData.status = 'Delivered';
      updateData.paymentStatus = 'Paid'; // COD चे पैसे डिलिव्हरी बॉयने गोळा केल्यावर Paid होईल
    }

    // मोबाईलचे जीपीएस लोकेशन आल्यास सेव्ह करणे
    if (lat && lng) {
      updateData.deliveryBoyLocation = { lat, lng };
    }

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      updateData,
      { new: true }
    );

    res.status(200).json({ success: true, order });
  } catch (err) {
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