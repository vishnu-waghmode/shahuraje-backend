const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const User = require('../models/User'); // 👈 FCM Token सेव्ह करण्यासाठी User मॉडेल इम्पोर्ट केले

// सर्व राऊट्स बरोबर जुळवा
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/send-otp', userController.sendOtp);
router.post('/reset-password', userController.resetPasswordWithOtp);

// 👉 युझरचा FCM Token सेव्ह करण्यासाठी नवीन API
router.put('/update-fcm-token/:userId', async (req, res) => {
    try {
        const { fcmToken } = req.body;
        await User.findByIdAndUpdate(req.params.userId, { fcmToken });
        res.status(200).json({ success: true, message: 'FCM Token यशस्वीरित्या सेव्ह झाला!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;