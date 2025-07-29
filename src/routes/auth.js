const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route to send an OTP to a user's mobile number
router.post('/send-otp', authController.sendOtp);

// Route to verify the OTP and get a JWT token
router.post('/verify-otp', authController.verifyOtp);

module.exports = router;
