const Group = require('../models/Group');

exports.createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    const newGroup = new Group({
      name,
      members,
    });
    
    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (error) {
    console.error('Error in createGroup:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate('members', 'username email');
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('members', 'username email');
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message }); // Fixed the missing semicolon here
  }
};

exports.addMember = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    group.members.push(req.body.userId);
    await group.save();
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};