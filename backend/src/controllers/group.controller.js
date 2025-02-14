import Group from '../models/group.model.js'; // ✅ Correct Import

export const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    const newGroup = new Group({
      name,
      members,
      admin: req.user._id
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
