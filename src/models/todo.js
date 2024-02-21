import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    text: String,
    isCompleted: Boolean,
  },
  { timestamps: true }
);
export const Todo = mongoose.model("todo", todoSchema);
