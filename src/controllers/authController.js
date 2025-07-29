const jwt = require('jsonwebtoken');
const otpService = require('../services/otpService');
const userModel = require('../models/userModel');

/**
 * Handles the /auth/send-otp endpoint.
 * Generates an OTP and sends it back in the response.
 */
const sendOtp = async (req, res) => {
  const { mobileNumber } = req.body;
  if (!mobileNumber) {
    return res.status(400).json({ message: 'Mobile number is required.' });
  }

  try {
    const otp = otpService.generateAndStoreOTP(mobileNumber);
    // As per requirements, we send the OTP in the response for this project.
    res.status(200).json({ message: 'OTP sent successfully.', otp: otp });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP.' });
  }
};

/**
 * Handles the /auth/verify-otp endpoint.
 * Verifies OTP, finds/creates a user, and returns a JWT.
 */
const verifyOtp = async (req, res) => {
  const { mobileNumber, otp } = req.body;
  if (!mobileNumber || !otp) {
    return res.status(400).json({ message: 'Mobile number and OTP are required.' });
  }

  try {
    // 1. Verify the OTP
    const isValid = otpService.verifyOTP(mobileNumber, otp);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid or expired OTP.' });
    }

    // 2. Find or create the user in the database
    const user = await userModel.findOrCreateUserByMobile(mobileNumber);

    // 3. Create a JWT
    const token = jwt.sign(
      { userId: user.id, mobileNumber: user.mobile_number },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Token expires in 7 days
    );

    // 4. Send the token back
    res.status(200).json({
      message: 'Login successful!',
      token: token,
      user: {
        id: user.id,
        mobileNumber: user.mobile_number,
        subscriptionTier: user.subscription_tier,
      },
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Server error during OTP verification.' });
  }
};

module.exports = { sendOtp, verifyOtp };
