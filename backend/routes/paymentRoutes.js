const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

const Order = require('../models/Order');

// Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * १. Razorpay कडून Order ID तयार करणे
 * Endpoint: POST /api/payment/create-order
 */
router.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'अवैध रक्कम' });
    }

    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    res.status(500).json({ success: false, error: 'पेमेंट ऑर्डर तयार करता आली नाही' });
  }
});

/**
 * २. पेमेंट व्हेरिफाय करून डेटाबेसमध्ये ऑर्डर सेव्ह करणे
 * Endpoint: POST /api/payment/verify-payment
 */
router.post('/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData
    } = req.body;

    // Signature Verification (SHA256)
    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({
        success: false,
        error: 'पेमेंट व्हेरिफिकेशन अयशस्वी (Signature Invalid)'
      });
    }

    // सुरक्षिततेसाठी जुना _id असल्यास काढून टाकणे
    if (orderData && orderData._id) {
      delete orderData._id;
    }

    // पेमेंट खरे आहे, डेटाबेसमध्ये ऑर्डर सेव्ह करा
    const newOrder = new Order({
      ...orderData,
      paymentMethod: 'ONLINE',
      paymentStatus: 'Paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: 'Processing'
    });

    const savedOrder = await newOrder.save();

    res.status(200).json({
      success: true,
      message: 'पेमेंट यशस्वी झाले आणि ऑर्डर नोंदवली गेली!',
      order: savedOrder
    });

  } catch (error) {
    console.error('Payment Verification Error:', error);
    res.status(500).json({
      success: false,
      error: 'पेमेंट व्हेरिफाय करताना त्रुटी आली: ' + error.message
    });
  }
});

module.exports = router;