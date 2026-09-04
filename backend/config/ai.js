const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let geminiModel = null;

const initAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_google_gemini_api_key_here') {
    console.warn('[Gemini AI] No valid GEMINI_API_KEY detected in environment. Intelligent rule-based fallback active.');
    return null;
  }

  try {
    genAI = new GoogleGenerativeAI(apiKey);
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('[Gemini AI] Initialized Google Generative AI (gemini-1.5-flash)');
    return geminiModel;
  } catch (error) {
    console.error(`[Gemini AI] Initialization error: ${error.message}`);
    return null;
  }
};

const getModel = () => {
  if (!geminiModel) {
    return initAI();
  }
  return geminiModel;
};

module.exports = {
  initAI,
  getModel
};
