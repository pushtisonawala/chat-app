import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import cloudinary from '../lib/cloudinary.js';
import { generateToken } from '../lib/utils.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import jwt from 'jsonwebtoken';  // Add this import

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
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate token
        const token = generateToken(user._id, res);

        // Send response
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
            token
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
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
export const checkAuth = async (req, res) => {
    try {
        // User is already authenticated via protectRoute middleware
        res.status(200).json(req.user);
    } catch (error) {
        console.error("CheckAuth error:", error);
        res.status(401).json({ message: "Not authorized" });
    }
};

// Fetch all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('_id fullName email profilePic') // Include only necessary fields
      .lean();

    console.log('Users from DB:', users); // Debug log

    if (!users || !Array.isArray(users)) {
      return res.status(500).json({ error: 'No users found' });
    }

    const formattedUsers = users.map(user => ({
      _id: user._id,
      fullName: user.fullName || 'Unknown User',
      email: user.email,
      profilePic: user.profilePic || '/avatar.jpg'
    }));

    console.log('Sending formatted users:', formattedUsers); // Debug log
    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};
