import mongoose from 'mongoose';

export const AI_USER_ID = new mongoose.Types.ObjectId('000000000000000000000000');

export const AI_DEFAULTS = {
    _id: AI_USER_ID,
    fullName: 'Gemini AI',
    profilePic: 'https://api.dicebear.com/7.x/bottts/svg?seed=gemini&backgroundColor=d1d5db&eyes=happy&mouth=smile',
    email: 'ai@assistant.com'
};
