import mongoose from 'mongoose';

export const AI_USER_ID = new mongoose.Types.ObjectId('000000000000000000000000');

export const AI_DEFAULTS = {
    _id: AI_USER_ID,
    fullName: 'Gemini AI',
    profilePic: 'https://imgcdn.stablediffusionweb.com/2024/9/15/8b8274f7-c2f8-46e9-9c66-cd6b4960f636.jpg',
    email: 'ai@assistant.com'
};
