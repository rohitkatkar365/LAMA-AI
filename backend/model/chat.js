const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Use mongoose.Schema.Types.ObjectId if referencing a User model
      required: true,
    },
    history: [
      {
        role: {
          type: String,
          enum: ["user", "model"], // Restricts values to 'user' or 'model'
          required: true,
        },
        parts: [
          {
            text: {
              type: String,
              required: true,
            },
          },
        ],
        img: {
          type: String, // Optional field for image URLs
          required: false,
        },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Export the model (CommonJS syntax)
module.exports = mongoose.models.Chat || mongoose.model("Chat", chatSchema);
