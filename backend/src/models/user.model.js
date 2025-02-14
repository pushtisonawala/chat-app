import mongoose from 'mongoose'
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        default: function() {
            // Generate username from email if not provided
            return this.email.split('@')[0];
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    profilePic: {
        type: String,
        default: "",
    },
}, { timestamps: true });
const User = mongoose.model("User", userSchema);
export default User;
