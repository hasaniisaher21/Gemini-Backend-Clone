const { Worker } = require('bullmq');
const geminiService = require('../services/geminiService');
const chatroomModel = require('../models/chatroomModel');
require('dotenv').config();

console.log('Worker is starting...');

// Create a new worker that processes jobs from the 'gemini-jobs' queue.
const worker = new Worker('gemini-jobs', async (job) => {
  const { chatroomId, prompt } = job.data;
  console.log(`Processing job ${job.id} for chatroom ${chatroomId}`);

  try {
    // 1. Call the Gemini API to get a response.
    const aiResponse = await geminiService.getAiResponse(prompt);

    // 2. Save the AI's response to the database.
    await chatroomModel.addMessage(chatroomId, 'ai', aiResponse);

    console.log(`Job ${job.id} completed successfully.`);
  } catch (error) {
    console.error(`Job ${job.id} failed:`, error);
    // It's important to throw the error so BullMQ knows the job failed
    // and can potentially retry it.
    throw error;
  }
}, {
  connection: {
    url: process.env.REDIS_URL,
  },
  // You can adjust how many jobs are processed at the same time.
  concurrency: 5, 
});

worker.on('completed', (job) => {
  console.log(`Finished job ${job.id} with result.`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error ${err.message}`);
});

console.log('Worker is listening for jobs...');
