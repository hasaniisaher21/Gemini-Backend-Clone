const db = require('../config/db');

/**
 * Creates a new chatroom for a user.
 * @param {number} userId - The ID of the user creating the chatroom.
 * @param {string} name - The optional name for the chatroom.
 * @returns {Promise<object>} The newly created chatroom object.
 */
const create = async (userId, name) => {
  const query = 'INSERT INTO chatrooms (user_id, name) VALUES ($1, $2) RETURNING *';
  const values = [userId, name || 'New Chat']; // Default name if not provided
  const { rows } = await db.query(query, values);
  return rows[0];
};

/**
 * Finds all chatrooms belonging to a specific user.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<Array>} An array of chatroom objects.
 */
const findByUser = async (userId) => {
  const query = 'SELECT * FROM chatrooms WHERE user_id = $1 ORDER BY created_at DESC';
  const { rows } = await db.query(query, [userId]);
  return rows;
};

/**
 * Finds a single chatroom by its ID and ensures it belongs to the user.
 * Also fetches the last 50 messages inside it.
 * @param {number} chatroomId - The ID of the chatroom.
 * @param {number} userId - The ID of the user requesting it.
 * @returns {Promise<object|null>} The chatroom object with messages, or null if not found.
 */
const findById = async (chatroomId, userId) => {
  const query = `
    SELECT c.*, (
      SELECT json_agg(m.*)
      FROM (
        SELECT * FROM messages 
        WHERE chatroom_id = c.id 
        ORDER BY created_at DESC 
        LIMIT 50
      ) m
    ) as messages
    FROM chatrooms c
    WHERE c.id = $1 AND c.user_id = $2;
  `;
  const { rows } = await db.query(query, [chatroomId, userId]);
  return rows[0];
};

/**
 * Adds a new message to a chatroom.
 * @param {number} chatroomId - The ID of the chatroom.
 * @param {string} sender - Who sent the message ('user' or 'ai').
 * @param {string} content - The message text.
 * @returns {Promise<object>} The newly saved message.
 */
const addMessage = async (chatroomId, sender, content) => {
  const query = 'INSERT INTO messages (chatroom_id, sender, content) VALUES ($1, $2, $3) RETURNING *';
  const values = [chatroomId, sender, content];
  const { rows } = await db.query(query, values);
  return rows[0];
};

module.exports = {
  create,
  findByUser,
  findById,
  addMessage, 
};
