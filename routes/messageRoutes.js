const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { sendMessage, allMessages, markAsRead} = require("../controllers/messageController");
const router = express.Router();

router.route("/").post(protect, sendMessage);
router.route("/:chatId").get(protect, allMessages);
router.route("/read").put(protect, markAsRead);
module.exports = router;