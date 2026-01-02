const mongoose = require("mongoose");

const statusSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  mediaUrl: { type: String, required: true }, // URL from S3/Cloudinary
  caption: { type: String },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: 86400 // Document automatically deletes after 24 hours (86400 seconds)
  } 
});

module.exports = mongoose.model("Status", statusSchema);