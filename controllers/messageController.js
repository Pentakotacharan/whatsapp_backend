const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId, mediaUrl, mediaType} = req.body;

  console.log("Backend Received -> Content:", content, "ChatId:", chatId);
  if ((!content && !mediaUrl) || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    mediaUrl: mediaUrl || "",
    mediaType: mediaType || "none",
  };

  try {
    var message = await Message.create(newMessage);
    // Populate sender and chat info for the frontend
    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    // Update latest message in Chat model
    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
// @desc    Mark all messages in a chat as read
// @route   PUT /api/message/read
// @access  Protected
const markAsRead = asyncHandler(async (req, res) => {
  const { chatId } = req.body;

  if (!chatId) {
    res.status(400);
    throw new Error("ChatId not sent");
  }

  // Find messages in this chat, NOT sent by me, that I haven't read yet
  await Message.updateMany(
    { chat: chatId, sender: { $ne: req.user._id }, readBy: { $ne: req.user._id } },
    { $addToSet: { readBy: req.user._id } }
  );

  res.json({ success: true });
});

// Remember to add 'markAsRead' to module.exports at the bottom!
module.exports = { sendMessage, allMessages, markAsRead };

