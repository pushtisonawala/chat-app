import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function() {
            return !this.isAIMessage; // senderId only required for non-AI messages
        }
    },
    recieverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    },
    text: {
        type: String,
        required: true
    },
    image: String,
    isGroupMessage: {
        type: Boolean,
        default: false
    },
    isAIMessage: {
        type: Boolean,
        default: false
    },
    mentionedAI: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);
export default Message;
