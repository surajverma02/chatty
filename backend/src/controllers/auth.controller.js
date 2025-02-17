const User = require("../models/user.model");
const cloudinary = require("../lib/cloudinary");
const { generateToken } = require("../lib/utils");
const logger = require("../lib/logger");
const bcrypt = require("bcryptjs");

const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!password || !fullName || !email) {
      return res.status(400).json({
        message: "All the fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 letters",
      });
    }

    const isUser = await User.findOne({ email });
    if (isUser)
      return res.status(400).json({
        message: "Email already exists",
      });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (user) {
      generateToken(user._id, res);
      await user.save();
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
      });
    } else {
      res.status(400).json({
        message: "Invalid user data",
      });
    }
  } catch (error) {
    logger.error(`Auth Controller :: Signup : ${error.message}`);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({
        message: "User not found",
      });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({
        message: "Invalid credentials",
      });

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    logger.error(`Auth Controller :: login : ${error.message}`);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    logger.error(`Auth Controller :: logout : ${error.message}`);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({
        message: "Profile pic is required",
      });
    }

    const uploadProfile = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: uploadProfile.secure_url,
      },
      { new: true }
    );

    return res.status(200).json(updatedUser);
  } catch (error) {
    logger.error(`Auth Controller :: Update Profile : ${error.message}`);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

const checkAuth = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    logger.error(`Auth Controller :: Check Auth User : ${error.message}`);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

module.exports = { signup, login, logout, updateProfile, checkAuth };
