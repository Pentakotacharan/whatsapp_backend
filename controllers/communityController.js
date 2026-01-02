const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

// @desc    Get all Communities (Group chats marked as community)
// @route   GET /api/community
// @access  Protected
const fetchCommunities = asyncHandler(async (req, res) => {
  try {
    // In this simple clone, we treat "Group Chats" with specific naming or just all groups as communities
    // For now, let's fetch all Group Chats
    const results = await Chat.find({ 
        isGroupChat: true, 
        users: { $elemMatch: { $eq: req.user._id } } 
    })
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .sort({ updatedAt: -1 });

    res.status(200).send(results);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { fetchCommunities };