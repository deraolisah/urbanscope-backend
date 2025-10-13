import User from "../models/User.js";

// Get all users (Admin only)
const getUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (role) query.role = role;
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { profile, isActive } = req.body;
    
    const updateData = {};
    if (profile) updateData.profile = profile;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    
    // Only admin can change roles
    if (req.user.role === 'admin' && req.body.role) {
      updateData.role = req.body.role;
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all agents
const getAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: 'agent', isActive: true })
      .select('-password')
      .sort({ 'profile.firstName': 1 });
    
    res.status(200).json(agents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAgents
};