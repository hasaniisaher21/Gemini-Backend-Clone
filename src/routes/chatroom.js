const express = require('express');
const router = express.Router();
const chatroomController = require('../controllers/chatroomController');
const { protect } = require('../middleware/authMiddleware');

// ALL routes in this file are protected and require a valid JWT.
// The `protect` middleware is applied to all of them.
router.use(protect);

// POST /api/chatroom - Create a new chatroom
router.post('/', chatroomController.createChatroom);

// GET /api/chatroom - Get all chatrooms for the user (with caching)
router.get('/', chatroomController.getChatrooms);

// GET /api/chatroom/:id - Get details of a specific chatroom
router.get('/:id', chatroomController.getChatroomById);

// POST /api/chatroom/:id/message - Send a message to a specific chatroom
router.post('/:id/message', chatroomController.sendMessage); // <-- Added

module.exports = router;
