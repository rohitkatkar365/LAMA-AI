const express = require("express");
const ImageKit = require("imagekit");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const chat = require("./model/chat.js");
const userChat = require("./model/userChat.js");
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB CONNECTED");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1); // Exit the application if the database connection fails
  }
};

const imagekit = new ImageKit({
  urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
  publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
});

app.get("/api/upload", (req, res) => {
  try {
    const result = imagekit.getAuthenticationParameters();
    res.json(result); // Properly send JSON response
  } catch (error) {
    console.error("Error in /api/upload:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/chats", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  const { text } = req.body;
  try {
    // Create new chat
    const newChat = new chat({
      userId: userId,
      history: [{ role: "user", parts: [{ text }] }],
    });
    const savedChat = await newChat.save();

    // Check if user exists in userChat
    const userchat = await userChat.findOne({ userId: userId });
    if (!userchat) {
      // Create new userChat document
      const newUserChat = new userChat({
        userId: userId,
        chats: [
          {
            _id: savedChat._id,
            title: text.substring(0, 40),
          },
        ],
      });
      await newUserChat.save();
      res.status(201).json(savedChat); // Send the saved chat with 'Created' status
    } else {
      // Update existing userChat document
      await userChat.updateOne(
        { userId: userId },
        {
          $push: {
            chats: {
              _id: savedChat._id,
              title: text.substring(0, 40),
            },
          },
        }
      );
      res.status(200).json(savedChat); // Send the saved chat
    }
  } catch (error) {
    console.error("Error in /api/chats:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/userchats", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  try {
    const userChats = await userChat.find({ userId });
    if (userChats.length > 0) {
      res.status(200).json(userChats[0].chats); // Send the chats array as a response
    } else {
      res.status(404).json({ message: "No chats found for the user" });
    }
  } catch (error) {
    console.log("Error in /api/userchats:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/chat/:id", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  const chatId = req.params.id;

  try {
    // Validate chatId (MongoDB ObjectId format)
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chat ID format" });
    }

    // Find the chat by _id and userId
    const chatData = await chat.findOne({ _id: chatId, userId });

    if (!chatData) {
      // If no chat is found
      return res.status(404).json({ message: "Chat not found" });
    }

    // Return the chat data
    res.status(200).json(chatData);
  } catch (error) {
    console.log("Error in /api/chats/:id:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/chats/:id", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;

  const { question, answer, img } = req.body;

  const newItems = [
    ...(question
      ? [{ role: "user", parts: [{ text: question }], ...(img && { img }) }]
      : []),
    { role: "model", parts: [{ text: answer }] },
  ];

  try {
    const updatedChat = await chat.updateOne(
      { _id: req.params.id, userId },
      {
        $push: {
          history: {
            $each: newItems,
          },
        },
      }
    );
    res.status(200).send(updatedChat);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error adding conversation!");
  }
});
// Global error handler for unhandled errors
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  res.status(500).json({ error: "An unexpected error occurred." });
});

app.listen(PORT, () => {
  connect();
  console.log(`Server started on port ${PORT}`);
});
