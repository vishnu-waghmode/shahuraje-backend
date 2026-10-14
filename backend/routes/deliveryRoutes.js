const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');

// 1. Delivery boy la assign jhalelya orders milvane (Mobile App sathi)
router.get('/assigned-orders/:deliveryBoyId', async (req, res) => {
  try {
    const { deliveryBoyId } = req.params;

    if (!deliveryBoyId || deliveryBoyId === 'undefined') {
      return res.status(400).json({ success: false, error: 'Invalid deliveryBoyId' });
    }

    // String la Mongoose ObjectId madhye convert karne
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
    console.error("Fetch assigned orders error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Delivery boy ne status update karne (Pick Up kiva Delivered - Mobile App sathi)
router.put('/update-status/:orderId', async (req, res) => {
  try {
    const { deliveryStatus, lat, lng } = req.body;
    
    const updateData = {};
    if (deliveryStatus) updateData.deliveryStatus = deliveryStatus;

    if (deliveryStatus === 'Picked_Up') {
      updateData.status = 'Processing';
    } else if (deliveryStatus === 'Delivered') {
      updateData.status = 'Delivered';
      updateData.paymentStatus = 'Paid';
    }

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
    console.error("Update status error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Sarv delivery boys chi list milvane (Admin Web Dropdown sathi)
router.get('/delivery-boys', async (req, res) => {
  try {
    const deliveryBoys = await User.find({ role: 'delivery_boy' }).select('name phone _id');
    res.status(200).json({ success: true, deliveryBoys });
  } catch (err) {
    console.error("Fetch delivery boys error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Admin ne order delivery boy la assign karne (POST मेथड ॲड केली)
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

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateFields,
      { new: true }
    )
    .populate('userId', 'name phone')
    .populate('deliveryBoyId', 'name phone');

    res.status(200).json({ 
      success: true, 
      message: 'Delivery boy assign jhala!', 
      order: updatedOrder 
    });
  } catch (err) {
    console.error("Assign error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 👉 POST आणि PUT दोन्ही चालू राहतील
router.post('/assign-order', assignOrderHandler);
router.put('/assign-order', assignOrderHandler);

module.exports = router;