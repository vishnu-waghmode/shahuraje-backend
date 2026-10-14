const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // जर userId 'null' असेल, तर ते नोटिफिकेशन वेब ॲडमिनसाठी असेल.
  // जर userId असेल, तर ते शेतकरी किंवा डिलिव्हरी बॉयसाठी असेल.
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, 
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['ORDER', 'DELIVERY', 'SYSTEM'], default: 'ORDER' },
  isRead: { type: Boolean, default: false },
  relatedId: { type: mongoose.Schema.Types.ObjectId } // उदा. Order ID
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);