import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true,
    },
    requiredCost: {
      type: Number,
      required: true,
    },
    location: String,
    collectedAmount: {
      type: Number,
      default: 0,
    },
    city: String,
    donors: [
      {
        donationBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        amount: String,
        receiptImage: String,
        donationDate: String,
        mark: {
          type: Boolean,
          default: false,
        },
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

export const Donation = mongoose.model("donation", donationSchema);
