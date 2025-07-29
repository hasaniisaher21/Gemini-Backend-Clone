const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const chatroomRoutes = require('./routes/chatroom'); // <-- IMPORT NEW ROUTES

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chatroom', chatroomRoutes); // <-- USE NEW ROUTES

// A simple test route
app.get('/', (req, res) => {
  res.send('Gemini Clone Backend is running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
