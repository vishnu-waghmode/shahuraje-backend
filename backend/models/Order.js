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

    // 👉 He navin fields add kara:
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
    razorpayPaymentId: { type: String }

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);