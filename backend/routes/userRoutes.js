const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// सर्व राऊट्स बरोबर जुळवा
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/send-otp', userController.sendOtp);
router.post('/reset-password', userController.resetPasswordWithOtp);

module.exports = router;