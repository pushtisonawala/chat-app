import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import cloudinary from '../lib/cloudinary.js';
import { generateToken } from '../lib/utils.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure multer for local storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/profile_pics'); // Save images to this folder
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Give unique names to files
    },
  });
  
  const upload = multer({ storage });
// Sign Up controller
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    generateToken(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      fullName,
      email,
    });
  } catch (error) {
    console.error("Error in signup controller:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Login controller
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic, // Send profile picture URL
    });
  } catch (error) {
    console.error("Error in login controller:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Logout controller
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    console.error("Error in logout controller:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Update Profile Controller
export const updateProfile = async (req, res) => {
    try {
        const file = req.file; // Get the uploaded file
        if (!file) {
            return res.status(400).json({ message: "No file uploaded." });
        }

        const updatedUser  = await User.findByIdAndUpdate(
            req.user._id,
            { profilePic: file.path }, // Save file path in the database
            { new: true }
        );

        res.status(200).json(updatedUser ); // Return the updated user data including the profilePic URL
    } catch (error) {
        console.error("Error updating profile picture:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};


// Check Auth controller
export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error("Error in checkAuth controller:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};
