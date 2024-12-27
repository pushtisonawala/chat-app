import express from 'express';
import { signup, login, logout, updateProfile, checkAuth } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../lib/cloudinary.js'; // Import the Cloudinary configuration

// Configure CloudinaryStorage for Multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'user_profiles', // Folder in Cloudinary where images will be stored
    allowed_formats: ['jpg', 'jpeg', 'png'], // Restrict formats
  },
});

const upload = multer({ storage });

const router = express.Router();

// Routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

// Updated route for updating profile with Cloudinary
router.put('/update-profile', protectRoute, upload.single('profilePic'), updateProfile);

router.get('/check', protectRoute, checkAuth);

export default router;
