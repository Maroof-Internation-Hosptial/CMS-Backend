import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    complaint_id: {
      // Add the complaint ID field
      type: String,
      unique: true, // Ensure uniqueness
    },
    name: String,
    description: String,
    status: String,
    timing: String,
    deadline: String,
    department: String,
    priority: String,
    remarks: String,
    date: Number,
    resolvedAt: String,
    nature: String,
    files: [],
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    ratings: [
      {
        byUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
      },
    ],
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Event = mongoose.model("event", eventSchema);
