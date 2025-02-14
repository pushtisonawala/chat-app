import Group from '../models/group.model.js'; // ✅ Correct Import
import cloudinary from '../lib/cloudinary.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads/group_profiles';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

export const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    let groupProfilePic = "https://i.pinimg.com/550x/7b/ea/e8/7beae8dce96a3422081fdc816459f579.jpg";

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      groupProfilePic = result.secure_url;
    }

    const newGroup = new Group({
      name,
      members,
      admin: req.user._id,
      groupProfilePic
    });

    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (error) {
    console.error('Error in createGroup:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('members', 'fullName email profilePic')
      .populate('admin', 'fullName email profilePic');
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'fullName email profilePic username')  // Add username to population
      .populate('admin', 'fullName email profilePic username');   // Add username to population
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Log for debugging
    console.log('Fetched group members:', group.members);
    
    res.status(200).json(group);
  } catch (error) {
    console.error('Error in getGroupById:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateGroupProfile = async (req, res) => {
    try {
        const { groupId } = req.params;
        
        if (!req.file) {
            return res.status(400).json({ error: "No image file provided" });
        }

        // Upload to cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'group_profiles',
            resource_type: 'auto'
        });

        // Delete local file after upload
        fs.unlinkSync(req.file.path);

        const updatedGroup = await Group.findByIdAndUpdate(
            groupId,
            { groupProfilePic: result.secure_url },
            { new: true }
        ).populate('members', 'fullName email profilePic username')
         .populate('admin', 'fullName email profilePic username');

        if (!updatedGroup) {
            return res.status(404).json({ error: "Group not found" });
        }

        res.status(200).json(updatedGroup);
    } catch (error) {
        console.error('Error updating group profile:', error);
        // Delete uploaded file if it exists
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: error.message || "Failed to update group profile" });
    }
};
