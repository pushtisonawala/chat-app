import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  groupProfilePic: {
    type: String,
    default: "https://api.dicebear.com/7.x/initials/svg?seed=group" // Default group avatar
  }
}, { timestamps: true });

const Group = mongoose.model('Group', groupSchema);
export default Group; // ✅ Ensure default export
