const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true 
  },
  items: [
    {
      productId: { type: String, required: true },
      name: { type: String },
      price: { type: Number },
      image: { type: String },
      quantity: { type: Number, default: 1 }
    }
  ]
});

module.exports = mongoose.model('Cart', cartSchema);