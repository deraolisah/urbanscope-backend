import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendPasswordResetEmail, sendWelcomeEmail } from "../utils/mailer.js";
import dotenv from "dotenv";


dotenv.config({ quiet: true });

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};


// Generate a 6-digit numeric code
const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
      
      // Send welcome email (non-blocking)
      try {
        await sendWelcomeEmail(user);
      } catch (emailError) {
        console.error('Welcome email failed:', emailError);
        // Don't fail the registration if email fails
      }
      
      // Return token in response instead of setting cookie
      res.status(201).json({ 
        message: "User registered successfully", 
        user: { 
          id: user._id, 
          username: user.username, 
          email: user.email,
          role: user.role 
        },
        token // Send token in response
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
      if (!user.isActive) {
        return res.status(401).json({ message: "Account is deactivated" });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user._id);
      
      // Return token in response instead of setting cookie
      res.status(200).json({ 
        message: "Login successful", 
        user: {
          id: user._id, 
          username: user.username, 
          email: user.email,
          role: user.role,
          profile: user.profile
        },
        token // Send token in response
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Logout User - Now handled on client side
const logoutUser = (req, res) => {
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


// Forgot Password - Generate reset code and send email
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({ 
        message: "If an account with that email exists, a reset code has been sent" 
      });
    }

    // Generate 6-digit reset code
    const resetCode = generateResetCode();
    
    // Hash code and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetCode)
      .digest('hex');
    
    // Set expire time (10 minutes from now - shorter for codes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    
    await user.save();

    // Send password reset code email
    try {
      await sendPasswordResetEmail(user, resetCode);
      
      res.status(200).json({ 
        message: "If an account with that email exists, a reset code has been sent",
        // In development, you might want to return the code for testing
        ...(process.env.NODE_ENV === 'development' && { debugCode: resetCode })
      });
    } catch (emailError) {
      console.error('Email error:', emailError);
      
      // Clear the reset token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      
      res.status(500).json({ message: "Email could not be sent" });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// Verify Reset Code
const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ 
        message: "Email and reset code are required" 
      });
    }

    // Hash the provided code to compare with stored token
    const hashedCode = crypto
      .createHash('sha256')
      .update(code)
      .digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordToken: hashedCode,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Invalid or expired reset code" 
      });
    }

    // Generate a temporary token for password reset (valid for 15 minutes)
    const resetToken = jwt.sign(
      { id: user._id, reset: true }, 
      process.env.JWT_SECRET, 
      { expiresIn: '15m' }
    );

    res.status(200).json({ 
      message: "Reset code verified successfully",
      resetToken
    });

  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reset Password - Use verified token to reset password
const resetPassword = async (req, res) => {
  try {
    const { resetToken, password } = req.body;

    if (!resetToken || !password) {
      return res.status(400).json({ 
        message: "Reset token and new password are required" 
      });
    }

    // Verify the reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(400).json({ 
        message: "Invalid or expired reset token" 
      });
    }

    // Check if this is a reset token
    if (!decoded.reset) {
      return res.status(400).json({ 
        message: "Invalid reset token" 
      });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ 
        message: "User not found" 
      });
    }

    // Set new password and clear reset fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    res.status(200).json({ 
      message: "Password reset successful. You can now login with your new password." 
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

export { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getCurrentUser,
  forgotPassword,
  verifyResetCode,
  resetPassword
};