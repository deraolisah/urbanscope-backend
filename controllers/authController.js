import User from "../models/User.js";
import jwt from "jsonwebtoken";


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists "});
    }

    const user = await User.create({ username, email, password });
    if (user) {
      const token = generateToken(user._id);
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 3600000 });
      res.status(200).json({ message: "User registered successfully", id: user.id, username: user.username, email: user.email, });
    } else {
      res.status(400).json({ message: "invsalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}



export {
  registerUser,

}