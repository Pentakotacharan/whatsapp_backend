const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const fetchChats = asyncHandler(async (req, res) => {
  try {
    // Find all chats where the current user is a participant
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
// Create or fetch 1-on-1 chat
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  }).populate("users", "-password").populate("latestMessage");

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };
    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password");
      res.status(200).send(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the fields" });
  }

  var users = JSON.parse(req.body.users);
  if (users.length < 2) {
    return res.status(400).send("More than 2 users are required to form a group chat");
  }
  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Delete a Chat (One-on-One or Group)
// @route   DELETE /api/chat/delete
// @access  Protected
const deleteChat = asyncHandler(async (req, res) => {
  const { chatId } = req.body;

  if (!chatId) {
    res.status(400);
    throw new Error("Chat ID is required");
  }

  // Delete the chat
  const removed = await Chat.findByIdAndDelete(chatId);
  
  if (!removed) {
    res.status(404);
    throw new Error("Chat not found");
  }

  // Optional: Delete all messages associated with this chat to clean up DB
  const Message = require("../models/messageModel");
  await Message.deleteMany({ chat: chatId });

  res.json(removed);
});

// @desc    Exit from a Group
// @route   PUT /api/chat/groupexit
// @access  Protected
const exitGroup = asyncHandler(async (req, res) => {
  const { chatId } = req.body;

  // Remove the logged-in user from the group
  const removed = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: req.user._id } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
});

module.exports = { accessChat, createGroupChat, fetchChats, deleteChat, exitGroup };