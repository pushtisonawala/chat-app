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
    default: "https://i.pinimg.com/550x/7b/ea/e8/7beae8dce96a3422081fdc816459f579.jpg"
  }
}, { timestamps: true });

const Group = mongoose.model('Group', groupSchema);
export default Group; // ✅ Ensure default export
