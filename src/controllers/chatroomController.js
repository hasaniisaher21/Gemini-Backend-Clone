const NodeCache = require('node-cache');
const chatroomModel = require('../models/chatroomModel');
const geminiQueue = require('../queues/geminiQueue'); // <-- Add Gemini message queue

// Initialize cache with a 5-minute TTL
const cache = new NodeCache({ stdTTL: 300 });

/**
 * Creates a new chatroom for the authenticated user.
 */
const createChatroom = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.userId;

  try {
    const newChatroom = await chatroomModel.create(userId, name);

    // Invalidate cache so next GET /chatroom returns updated list
    const cacheKey = `chatrooms_${userId}`;
    cache.del(cacheKey);

    res.status(201).json(newChatroom);
  } catch (error) {
    console.error('Error creating chatroom:', error);
    res.status(500).json({ message: 'Server error while creating chatroom.' });
  }
};

/**
 * Lists all chatrooms for the authenticated user.
 * Uses in-memory cache (NodeCache) to reduce DB hits.
 */
const getChatrooms = async (req, res) => {
  const userId = req.user.userId;
  const cacheKey = `chatrooms_${userId}`;

  try {
    const cachedChatrooms = cache.get(cacheKey);
    if (cachedChatrooms) {
      console.log(`[Cache] HIT for user ${userId}`);
      return res.status(200).json(cachedChatrooms);
    }

    console.log(`[Cache] MISS for user ${userId}. Fetching from DB.`);
    const chatrooms = await chatroomModel.findByUser(userId);

    cache.set(cacheKey, chatrooms);
    res.status(200).json(chatrooms);
  } catch (error) {
    console.error('Error fetching chatrooms:', error);
    res.status(500).json({ message: 'Server error while fetching chatrooms.' });
  }
};

/**
 * Retrieves detailed information about a specific chatroom.
 * Includes latest 50 messages inside the chatroom.
 */
const getChatroomById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const chatroom = await chatroomModel.findById(id, userId);
    if (!chatroom) {
      return res.status(404).json({ message: 'Chatroom not found.' });
    }
    res.status(200).json(chatroom);
  } catch (error) {
    console.error('Error fetching chatroom details:', error);
    res.status(500).json({ message: 'Server error while fetching chatroom details.' });
  }
};

/**
 * Handles sending a message to a chatroom.
 * Saves user's message and queues AI response via Gemini.
 */
const sendMessage = async (req, res) => {
  const { id: chatroomId } = req.params;
  const { content } = req.body;
  const userId = req.user.userId;

  if (!content) {
    return res.status(400).json({ message: 'Message content is required.' });
  }

  try {
    // Verify chatroom ownership
    const chatroom = await chatroomModel.findById(chatroomId, userId);
    if (!chatroom) {
      return res.status(404).json({ message: 'Chatroom not found or access denied.' });
    }

    // Save user's message
    await chatroomModel.addMessage(chatroomId, 'user', content);

    // Queue AI response generation
    await geminiQueue.add('process-message', {
      chatroomId: chatroomId,
      prompt: content,
    });

    res.status(202).json({ message: 'Message received. AI is responding shortly.' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error while sending message.' });
  }
};

module.exports = {
  createChatroom,
  getChatrooms,
  getChatroomById,
  sendMessage, 
};
