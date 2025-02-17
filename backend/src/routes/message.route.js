const express = require("express");
const {
  getUsers,
  getMessages,
  sendMessage
} = require("../controllers/message.controller");
const { protectRoute } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/users", protectRoute, getUsers);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);

module.exports = router;
