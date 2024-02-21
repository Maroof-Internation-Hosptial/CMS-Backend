import { Message } from "../models/message.js";
import { v2 as cloudinary } from "cloudinary";
import { User } from "../models/user.js";

export const postMessage = async (req, res) => {
  try {
    const { senderId, recepientId, messageType, messageText } = req.body;

    let imageUrl = null;

    if (messageType === "image") {
      await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "auto" },
          (error, result) => {
            if (error) {
              console.error("Error uploading to Cloudinary:", error);
              reject(error);
            } else {
              imageUrl = result.secure_url;
              resolve();
            }
          }
        );

        uploadStream.end(req.file.buffer);
      });
    }

    const newMessage = new Message({
      senderId,
      recepientId,
      messageType,
      message: messageText,
      timestamp: new Date(),
      imageUrl: messageType === "image" ? imageUrl : null,
    });

    await newMessage.save();
    res.status(200).json({ message: "Message sent Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const userDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    //fetch the user data from the user ID
    const recepientId = await User.findById(userId);

    res.json(recepientId);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const fetchMessages = async (req, res) => {
  try {
    const { senderId, recepientId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: senderId, recepientId: recepientId },
        { senderId: recepientId, recepientId: senderId },
      ],
    });

    res.json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteMessages = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "invalid req body!" });
    }

    await Message.deleteMany({ _id: { $in: messages } });

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server" });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const senderId = req.params.senderId;
    const recepientId = req.params.recepientId;

    const deleteResult = await Message.deleteMany({
      $or: [
        { senderId: senderId, recepientId: recepientId },
        { senderId: recepientId, recepientId: senderId },
      ],
    });

    res.json({
      message: `${deleteResult.deletedCount} messages deleted`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const friendsChat = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch the user's connections
    const user = await User.findById(userId).populate({
      path: "connections",
      select: "name image",
      model: User,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const connectionsWithMessages = [];

    for (const connection of user.connections) {
      const lastMessage = await Message.findOne({
        $or: [
          { senderId: user._id, recepientId: connection._id },
          { senderId: connection._id, recepientId: user._id },
        ],
      })
        .sort({ timeStamp: -1 })
        .limit(1);
      if (lastMessage) {
      }
      if (lastMessage) {
        connectionsWithMessages.push({
          name: connection.name,
          _id: connection._id,
          image: connection.image,
          lastMessage: lastMessage
            ? lastMessage.message
            : "Empty Chat, Join Now",
          timeStamp: lastMessage ? lastMessage.timeStamp : null,
        });
      }
    }

    res.json(connectionsWithMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getFriends = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch the user's connections
    const user = await User.findById(userId).populate({
      path: "connections",
      select: "name image",
      model: User,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const connectionsWithoutMessages = [];

    for (const connection of user.connections) {
      const lastMessage = await Message.findOne({
        $or: [
          { senderId: user._id, recepientId: connection._id },
          { senderId: connection._id, recepientId: user._id },
        ],
      });

      if (!lastMessage) {
        connectionsWithoutMessages.push({
          name: connection.name,
          _id: connection._id,
          image: connection.image,
          lastMessage: "Empty Chat, Join Now",
        });
      }
    }

    res.json(connectionsWithoutMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
