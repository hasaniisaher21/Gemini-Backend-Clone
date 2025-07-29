const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize the Google Generative AI client with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Gets a response from the Gemini API based on a user's prompt.
 * @param {string} prompt - The user's message.
 * @returns {Promise<string>} The AI-generated response text.
 */
const getAiResponse = async (prompt) => {
  try {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error('Error contacting Gemini API:', error);
    return 'Sorry, I encountered an error. Please try again.';
  }
};

module.exports = { getAiResponse };
