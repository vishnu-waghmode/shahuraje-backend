const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// १. नोटिफिकेशन्स मिळवणे (Admin किंवा User साठी)
router.get('/:userId?', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // जर API मध्ये userId पाठवला नाही (undefined), तर ॲडमिनचे (null) नोटिफिकेशन्स आणा
    const query = (userId && userId !== 'undefined' && userId !== 'null') ? { userId } : { userId: null };
    
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(30);
    const unreadCount = await Notification.countDocuments({ ...query, isRead: false });

    res.status(200).json({ success: true, notifications, unreadCount });
  } catch (err) {
    console.error("Fetch Notifications Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// २. एकाच वेळी सर्व नोटिफिकेशन्स वाचले (Mark All Read) म्हणून मार्क करणे - बॅज काढण्यासाठी 🔴
router.put('/mark-all-read/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const query = (userId && userId !== 'undefined' && userId !== 'null') ? { userId } : { userId: null };
    
    await Notification.updateMany({ ...query, isRead: false }, { $set: { isRead: true } });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    console.error("Mark All Read Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ३. विशिष्ट नोटिफिकेशन वाचले (Read) म्हणून मार्क करणे
router.put('/mark-read/:id', async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ success: true, message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;