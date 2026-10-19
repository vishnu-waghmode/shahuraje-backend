const mongoose = require('mongoose');

const cropAdvisorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Resolved'],
    default: 'Pending'
  },
  // 👉 एकापेक्षा जास्त औषधे साठवण्यासाठी Array केला आहे
  suggestedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  adminMessage: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('CropAdvisory', cropAdvisorySchema);