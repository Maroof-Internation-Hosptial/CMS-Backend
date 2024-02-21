import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reported_post: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "post_type",
      required: true,
    },
    post_type: {
      type: String,
      enum: [
        "lost_found",
        "sell",
        "neighbour-watch",
        "skill",
        "neighbour-forum",
      ],
      required: true,
    },
    reports: [
      { email: String, reason: String, date: String, optional_note: String },
    ],
    reply_id: String,
    delete_action: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Report = mongoose.model("report", reportSchema);
