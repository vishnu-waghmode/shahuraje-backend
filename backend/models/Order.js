const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, 
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true }, 
    status: { 
        type: String, 
        enum: ['Pending', 'Processing', 'Delivered', 'Cancelled'], 
        default: 'Pending' 
    },
    deliveryAddress: { type: String },

    // 👉 आधीपासून असलेले Payment फील्ड्स
    paymentMethod: { 
        type: String, 
        enum: ['COD', 'ONLINE'], 
        default: 'COD' 
    },
    paymentStatus: { 
        type: String, 
        enum: ['Pending', 'Paid', 'Failed'], 
        default: 'Pending' 
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },

    // 👇 नवीन जोडलेले Delivery Boy फील्ड्स 👇
    deliveryBoyId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        default: null 
    },
    deliveryStatus: { 
        type: String, 
        default: 'Pending' 
    },
    deliveryBoyLocation: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null }
    }

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);