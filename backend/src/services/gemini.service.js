import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are Gemini AI, an assistant integrated into this chat application.

About this app:
- This is a real-time chat application built with React, Node.js, and Socket.IO
- Users can chat in groups or privately
- Messages are stored in MongoDB and delivered in real-time
- The app supports text messages and profile customization
- Users can mention you using @gemini command

Your capabilities:
1. Answer questions about the app's features
2. Help with technical topics and coding
3. Engage in casual conversation
4. Provide helpful information

Key features you should know about:
- Real-time messaging using Socket.IO
- Group chat functionality
- User authentication and profiles
- Message history
- Online/offline status indicators
- @mentions system

Remember to:
- Keep responses friendly and concise (under 150 words)
- Stay helpful and informative
- Acknowledge the group chat context
- Maintain conversation flow
- Be accurate about app features`;

export const processAIMessage = async (message, context = []) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
      }
    });

    const chat = model.startChat({
      history: context.map(m => ({
        role: m.isAIMessage ? 'model' : 'user',
        parts: m.text,
      })),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini Error:', error);
    throw error;
  }
};
