import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    message: String,
    isReadBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    isClearBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    notificationBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model("notification", notificationSchema);
