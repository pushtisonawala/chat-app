import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Simple rate limiting to avoid quota issues
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

const waitForRateLimit = () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
        return new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    lastRequestTime = now;
    return Promise.resolve();
};

// Function to list available models (for debugging)
export const listAvailableModels = async () => {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        console.log('Available Gemini models:', data.models?.map(m => m.name) || []);
        return data.models || [];
    } catch (error) {
        console.error('Error listing models:', error);
        return [];
    }
};

export const processAIMessage = async (message) => {
    try {
        await waitForRateLimit();
        
        // Use the latest flash model which is more efficient for free tier
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const prompt = `You are a helpful AI assistant named Gemini. Please respond to the following message in a friendly and helpful way:\n\n${message}`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini Error:', error);
        
        // If quota exceeded, try the lite version
        if (error.message.includes('quota') || error.message.includes('429')) {
            try {
                await waitForRateLimit();
                const liteModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
                const liteResult = await liteModel.generateContent(prompt);
                const liteResponse = await liteResult.response;
                return liteResponse.text();
            } catch (liteError) {
                console.error('Gemini Lite Error:', liteError);
                return "I apologize, I'm temporarily unavailable due to API quota limits. Please try again later.";
            }
        }
        
        return "I apologize, I'm having trouble processing your request.";
    }
};

export const summarizeUnreadMessages = async (messages) => {
  try {
    await waitForRateLimit();
    
    // Use the efficient flash model for summarization
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const messagesText = messages.map(m => 
      `${m.senderId?.fullName || 'User'}: ${m.text}`
    ).join('\n');

    const prompt = `As a helpful chat assistant, please provide a clear and concise summary of these chat messages.

    Messages to summarize:
    ${messagesText}

    Please provide:
    1. A 2-3 sentence overview of the main topics
    2. Any decisions or agreements made
    3. Important questions raised
    4. Action items if any

    Keep the summary conversational and friendly. If there are technical discussions, highlight key points.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Summarization Error:', error);
    
    // If quota exceeded, try the lite version
    if (error.message.includes('quota') || error.message.includes('429')) {
      try {
        await waitForRateLimit();
        const liteModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const liteResult = await liteModel.generateContent(prompt);
        const liteResponse = await liteResult.response;
        return liteResponse.text();
      } catch (liteError) {
        console.error('Summarization Lite Error:', liteError);
        throw new Error('Unable to generate summary: API quota exceeded. Please try again later.');
      }
    }
    
    throw new Error('Unable to generate summary: ' + error.message);
  }
};
