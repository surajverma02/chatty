const Message = require("../models/message.model");
const User = require("../models/user.model");
const cloudinary = require("../lib/cloudinary");
const { io, getReceiverSocketId } = require("../lib/socket");
const logger = require("../lib/logger");

const getUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filterUsers = await User.find({ _id: { $ne: loggedInUserId } });
    res.status(200).json(filterUsers);
  } catch (error) {
    logger.error(`Message Controller :: Get Sidebar : ${error.message}`);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: receiverId },
        { senderId: receiverId, receiverId: myId },
      ],
    });
    res.status(200).json(messages);
  } catch (error) {
    logger.error(`Message Controller :: Get Messages : ${error.message}`);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const { text, image } = req.body;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadedImage = await cloudinary.uploader.upload(image);
      imageUrl = uploadedImage.secure_url;
    }

    const message = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });
    await message.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }
    res.status(201).json(message);
  } catch (error) {
    logger.error(`Message Controller :: Send Messages : ${error.message}`);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

module.exports = { getUsers, getMessages, sendMessage };
