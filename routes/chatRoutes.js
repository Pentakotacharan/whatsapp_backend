const express = require("express");
const { protect } = require("../middleware/authMiddleware");
// IMPORT FETCHCHATS HERE 👇
const { accessChat, createGroupChat, fetchChats, deleteChat, exitGroup} = require("../controllers/chatController");

const router = express.Router();

router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats); // Now this will work
router.route("/group").post(protect, createGroupChat);
router.route("/groupexit").put(protect, exitGroup);
router.route("/delete").delete(protect, deleteChat);

module.exports = router;