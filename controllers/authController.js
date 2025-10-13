import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

// Register User (Only for users, not agents/admins)
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Force role to 'user' for public registration
    const user = await User.create({ 
      username, 
      email, 
      password,
      role: 'user' 
    });
    
    if (user) {
      const token = generateToken(user._id);
      res.cookie('token', token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 3600000 
      });
      res.status(201).json({ 
        message: "User registered successfully", 
        user: { 
          id: user._id, 
          username: user.username, 
          email: user.email,
          role: user.role 
        } 
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create Agent (Admin only)
const createAgent = async (req, res) => {
  const { username, email, password, profile } = req.body;

  try {
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const agent = await User.create({ 
      username, 
      email, 
      password,
      role: 'agent',
      profile 
    });
    
    res.status(201).json({ 
      message: "Agent created successfully", 
      agent: { 
        id: agent._id, 
        username: agent.username, 
        email: agent.email,
        role: agent.role,
        profile: agent.profile
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    
    if (user && (await user.matchPassword(password))) {
      if (!user.isActive) {
        return res.status(401).json({ message: "Account is deactivated" });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user._id);
      res.cookie('token', token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 3600000 
      });
      res.status(200).json({ 
        message: "Login successful", 
        user: {
          id: user._id, 
          username: user.username, 
          email: user.email,
          role: user.role,
          token: token,
          profile: user.profile
        } 
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logout User
const logoutUser = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: "Logout successful" });
};

// Get Current User
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { 
  registerUser, 
  createAgent,
  loginUser, 
  logoutUser, 
  getCurrentUser 
};