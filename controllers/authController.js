import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

// Register User
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ username, email, password });
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
          email: user.email ,
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

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    
    if (user && (await user.matchPassword(password))) {
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
          role: user.role 
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

export { registerUser, loginUser, logoutUser, getCurrentUser };