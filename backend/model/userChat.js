const mongoose = require("mongoose");

const userChatSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Consider using ObjectId if it references another collection
      required: true,
    },
    chats: [
      {
        _id: {
          type: String, // Replace with ObjectId if applicable
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now, // Use function reference, not invocation
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

module.exports = mongoose.models.UserChat || mongoose.model("UserChat", userChatSchema);
