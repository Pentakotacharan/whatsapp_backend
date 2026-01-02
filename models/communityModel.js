const mongoose = require("mongoose");

const communitySchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // A community contains multiple group chats
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
    // Standard announcement channel created automatically
    announcementGroup: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Community", communitySchema);