const mongoose = require('mongoose');

const cropAdvisorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // हा सुरुवातीचा पहिला फोटो राहील
  image: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In-Progress', 'Resolved'], // 'In-Progress' नवीन ॲड केला
    default: 'Pending'
  },
  suggestedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  // 👉 🔴 हा नवीन Chat Array: दोघांमधील संभाषण साठवण्यासाठी
  messages: [{
    sender: { type: String, enum: ['farmer', 'admin'], required: true },
    text: { type: String, default: '' },
    image: { type: String, default: null }, // चॅटमध्ये नवीन फोटो पाठवण्यासाठी
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('CropAdvisory', cropAdvisorySchema);