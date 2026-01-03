const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../utils/generateToken");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;
  console.log("recieved data:", req.body);
  console.log("--------------------------------");
  console.log("INCOMING SIGNUP REQUEST:");
  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Password:", password);
  console.log("--------------------------------");

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    console.log("User already exists");
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({ name, email, password, pic });
   console.log("Created User:", user);
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Failed to Create the User");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log("--- LOGIN ATTEMPT ---");
  console.log("Email:", email);
  console.log("Password:", password);

  const user = await User.findOne({ email });

  if (!user) {
    console.log("Result: User Not Found");
    res.status(401);
    throw new Error("Invalid Email or Password");
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  console.log("Password Match Result:", isMatch);

  if (user && isMatch) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    console.log("Result: Password Mismatch");
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

// ... existing imports (asyncHandler, User, etc.)

// /api/user?search=charan
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } }, // Case insensitive regex
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  // Find users matching the keyword, except the current logged-in user
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});
// @desc    Update User Profile
// @route   PUT /api/user/profile
// @access  Protected
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.pic = req.body.pic || user.pic;

    // If password is sent, we can update it too (optional)
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      pic: updatedUser.pic,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// Update the export at the bottom
module.exports = { registerUser, authUser, allUsers, updateUserProfile };