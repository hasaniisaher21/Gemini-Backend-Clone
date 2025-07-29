const db = require('../config/db');

/**
 * Finds a user by their mobile number or creates a new one if they don't exist.
 * This is an "upsert" operation.
 * @param {string} mobileNumber - The user's mobile number.
 * @returns {Promise<object>} The user object from the database.
 */
const findOrCreateUserByMobile = async (mobileNumber) => {
  // First, try to find the user
  const findUserQuery = 'SELECT * FROM users WHERE mobile_number = $1';
  let userResult = await db.query(findUserQuery, [mobileNumber]);

  if (userResult.rows.length > 0) {
    // User exists, return them
    return userResult.rows[0];
  } else {
    // User does not exist, create a new one
    const insertUserQuery = 'INSERT INTO users (mobile_number) VALUES ($1) RETURNING *';
    userResult = await db.query(insertUserQuery, [mobileNumber]);
    return userResult.rows[0];
  }
};

module.exports = { findOrCreateUserByMobile };
