const { Queue } = require('bullmq');
require('dotenv').config();

// Create a new queue instance connected to Redis.
// 'gemini-jobs' is the name of our queue.
const geminiQueue = new Queue('gemini-jobs', {
  connection: {
    url: process.env.REDIS_URL,
  },
});

module.exports = geminiQueue;
