import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const processAIMessage = async (message) => {
    try {
        // Simple direct message generation
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const result = await model.generateContent([
            { text: "You are a helpful AI assistant named Gemini." },
            { text: message }
        ]);

        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini Error:', error);
        return "I apologize, I'm having trouble processing your request.";
    }
};

export const summarizeUnreadMessages = async (messages) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
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
    throw error;
  }
};
