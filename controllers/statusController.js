const asyncHandler = require("express-async-handler");
const Status = require("../models/statusModel");
const User = require("../models/userModel");

// @desc    Get all valid statuses (last 24h)
// @route   GET /api/status
const getStatuses = asyncHandler(async (req, res) => {
  const statuses = await Status.find({
    createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Only last 24h
  })
    .populate("user", "name pic")
    .sort({ createdAt: -1 });

  res.json(statuses);
});

// @desc    Create new status
// @route   POST /api/status
const createStatus = asyncHandler(async (req, res) => {
  const { mediaUrl, caption } = req.body;

  if (!mediaUrl) {
    res.status(400);
    throw new Error("Please provide an image URL");
  }

  const status = await Status.create({
    user: req.user._id,
    mediaUrl,
    caption,
  });

  const fullStatus = await Status.findById(status._id).populate("user", "name pic");

  res.status(201).json(fullStatus);
});

module.exports = { getStatuses, createStatus };