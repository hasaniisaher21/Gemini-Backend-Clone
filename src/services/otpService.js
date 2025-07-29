
// This is a simple in-memory store. In a production app, use Redis.
const otpStore = new Map();

/**
 * Generates a 6-digit OTP, stores it with the mobile number,
 * and sets it to expire in 5 minutes.
 * @param {string} mobileNumber - The user's mobile number.
 * @returns {string} The generated OTP.
 */
const generateAndStoreOTP = (mobileNumber) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

  otpStore.set(mobileNumber, { otp, expires });

  console.log(`Generated OTP for ${mobileNumber}: ${otp}`); // For debugging
  return otp;
};

/**
 * Verifies if the provided OTP is valid and not expired.
 * @param {string} mobileNumber - The user's mobile number.
 * @param {string} otp - The OTP to verify.
 * @returns {boolean} True if the OTP is valid, false otherwise.
 */
const verifyOTP = (mobileNumber, otp) => {
  const stored = otpStore.get(mobileNumber);

  if (!stored) {
    return false; // No OTP was generated for this number
  }

  if (Date.now() > stored.expires) {
    otpStore.delete(mobileNumber); // Clean up expired OTP
    return false; // OTP has expired
  }

  if (stored.otp === otp) {
    otpStore.delete(mobileNumber); // OTP is used, so delete it
    return true;
  }

  return false;
};

module.exports = { generateAndStoreOTP, verifyOTP };
