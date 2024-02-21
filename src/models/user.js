import mongoose from "mongoose";
const UserSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    gender: String,
    userdepartment: String,
    phone: Number,

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    first_login: {
      type: String,
      default: "Nil",
    },
    last_login: {
      type: String,
      default: "Nil",
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "dept-manager", "complaint-assignee", "user", "director"],
    },
    password: {
      type: String,
      required: true,
    },
    permissions: ["create", "update", "delete"],
    verification_code: {
      type: String,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: process.env.DEFAULT_PROFILE_IMAGE,
    },
    temp_email: {
      tyep: String,
    },
    email_verified: {
      type: Boolean,
      default: false,
    },
    resetCode: String,
    expireToken: Date,
  },
  { timestamps: true }
);
export const User = mongoose.model("user", UserSchema);

const trackerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  login_time: Date,
  ip: String,
  country: String,
  city: String,
});

export const Tracker = mongoose.model("login-tracker", trackerSchema);
