const mongoose = require('mongoose');

const cropAdvisorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String, // इथे Cloudinary ची इमेज लिंक सेव्ह होईल
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Resolved'], // Pending = तपासणी सुरु, Resolved = सल्ला दिला
    default: 'Pending'
  },
  suggestedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // ॲडमिन जे औषध सुचवेल त्याचा ID
    default: null
  },
  adminMessage: {
    type: String, // ॲडमिनने दिलेला काही विशेष सल्ला
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('CropAdvisory', cropAdvisorySchema);