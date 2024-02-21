import { Tracker, User } from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendMail } from "../middleware/email_send.js";
import { generateRandomPassword } from "../utils/index.js";
import { Message } from "../models/message.js";
import sendVerificationEmail from "../services/emailService.js";
import schedule from "node-schedule";
import axios from "axios";
import { Event } from "../models/event.js";
import { Todo } from "../models/todo.js";

export const userSignup = async (req, res) => {
  const { role, email, password, name } = req.body;

  if (!role || !email || !password || !name) {
    return res.status(400).json({ error: "Please fill all fields" });
  }

  try {
    let saveUser = await User.findOne({ email });

    if (saveUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    function generateActivationCode() {
      const min = 1000;
      const max = 9999;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const activationCode = generateActivationCode();

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      role,
      email,
      password: hashedPassword,
      name,
      verification_code: activationCode,
    });

    const userData = await user.save();
    const time = new Date();
    time.setSeconds(time.getSeconds() + 3);

    // Schedule email sending as a background task
    schedule.scheduleJob(time, function () {
      sendVerificationEmail(email, activationCode);
    });

    // Generate a JWT token for the user
    const token = jwt.sign({ _id: userData._id }, process.env.JWT_SECRET);

    // Remove sensitive data from the response
    userData.password = undefined;
    userData.verification_code = undefined;

    res
      .status(200)
      .json({ message: "Verify Your Account", token, user: userData });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "Something went wrong!" });
  }
};

export const memberSignup = async (req, res) => {
  const { role, email, name } = req.body;

  if (!role || !email) {
    return res.status(400).json({ error: "Please fill all fields" });
  }

  try {
    let saveUser = await User.findOne({ email });

    if (saveUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const password = "12345678"; // Set password to "12345678"

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      ...req.body,
      password: hashedPassword,
    });

    const userData = await user.save();
    const time = new Date();
    time.setSeconds(time.getSeconds() + 3);

    // Schedule email sending as a background task
    schedule.scheduleJob(time, function () {
      sendVerificationEmail(email, password);
    });

    // Generate a JWT token for the user
    const token = jwt.sign({ _id: userData._id }, process.env.JWT_SECRET);

    // Remove sensitive data from the response
    userData.password = undefined;

    res
      .status(200)
      .json({ message: "Member has been created", token, user: userData });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "Something went wrong!" });
  }
};


export const userEmailUpdate = async (req, res) => {
  const { new_email, _id } = req.body;
  if (!_id) {
    return res.status(400).json({ error: "user id is required" });
  }
  if (!new_email) {
    return res.status(400).json({ error: "please fill the email" });
  }
  try {
    let userCheck = await User.find({ email: new_email });
    if (userCheck.length > 0) {
      return res.status(400).json({ error: "Email already exist" });
    }
    function generateActivationCode() {
      const min = 1000;
      const max = 9999;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const activationCode = generateActivationCode();
    await sendMail(
      new_email,
      "Email Verification Code ",
      `<h2>Code :</h2>
    ${activationCode} `
    );
    await User.findByIdAndUpdate(_id, {
      verification_code: activationCode,
      temp_email: new_email,
    });
    res.status(200).json({ message: "please veirfy your email" });
  } catch (error) {
    res.status(400).json({ error: "something went wrong!" });
  }
};

export const userVerify = async (req, res) => {
  const { verification_code, _id, emailChange } = req.body;
  if (!_id) {
    return res.status(400).json({ error: "user id is required" });
  }
  if (!verification_code) {
    return res.status(400).json({ error: "please fill the code" });
  }
  try {
    let userCheck = await User.findById(_id);
    if (userCheck.verification_code !== verification_code) {
      return res.status(400).json({ error: "please enter valid code" });
    }
    if (emailChange) {
      await User.findByIdAndUpdate(_id, {
        verification_code: null,
        temp_email: undefined,
        email: userCheck.temp_email,
      });
    } else {
      await User.findByIdAndUpdate(_id, {
        verification_code: null,
        email_verified: true,
      });
    }
    res.status(200).json({ message: "verified email successfully" });
  } catch (error) {
    res.status(400).json({ error: "something went wrong!" });
  }
};

export const userLogin = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "please add email or password" });
  }
  User.findOne({ email: email })
    .then((savedUser) => {
      if (!savedUser) {
        return res.status(400).json({ error: "invalid email or password " });
      }
      bcrypt.compare(password, savedUser.password).then((doMatch) => {
        if (doMatch) {
          const token = jwt.sign(
            { _id: savedUser._id },
            process.env.JWT_SECRET
          );
          savedUser.password = undefined;
          res.json({ message: "Successfull Login", token, user: savedUser });
        } else {
          return res.status(400).json({ error: "invalid email or password" });
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

export const userUpdate = async (req, res) => {
  const { _id } = req.params;
  const { password } = req.body;
  let passwordUpdate = false;
  let newPassword;
  if (password) {
    passwordUpdate = true;
    newPassword = await bcrypt.hash(password, 12);
  }
  try {
    const updateData = passwordUpdate
      ? { ...req.body, password: newPassword }
      : req.body;
    const user = await User.findByIdAndUpdate(_id, updateData, { new: true });
    res.status(200).json({ message: "updated successfully", user });
  } catch (error) {
    res.status(400).json({ error: "something went wrong!" });
  }
};

export const userPassUpdate = async (req, res) => {
  const { currPassword, newPassword, _id } = req.body;
  if (!currPassword || !newPassword || !_id) {
    return res.status(400).json({ error: "please fill all fields" });
  }
  try {
    let userData = await User.findById({ _id });

    if (!userData) {
      return res.status(400).json({ error: "user not found" });
    }
    const isPasswordMatch = await bcrypt.compare(
      currPassword,
      userData.password
    );
    if (!isPasswordMatch) {
      return res.status(400).json({ error: "old password not match" });
    }
    let hashedpassword = await bcrypt.hash(newPassword, 12);
    const updateData = { password: hashedpassword };
    await User.findByIdAndUpdate(_id, updateData);
    res.status(200).json({ message: "updated successfully" });
  } catch (error) {
    res.status(400).json({ error: "something went wrong!" });
  }
};

export const userGet = async (req, res) => {
  let filter = { status: "user" };
  if (req.query._id) {
    filter._id = req.query._id.split(",");
  }
  try {
    let result = await User.find().select("-password");
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ message: "something went wrong!" });
  }
};

export const userGetbyId = async (req, res) => {
  let filter = { isActive: true };
  if (req.query._id) {
    filter._id = req.query._id.split(",");
  }
  try {
    let result = await User.findById(filter).select("-password");
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "something went wrong!" });
  }
};

//   forgot password

export const forgotPass = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "please enter email" });
  }
  try {
    let userData = await User.findOne({ email });
    if (!userData) {
      return res.status(400).json({ error: "email not found" });
    }

    function generateActivationCode() {
      const min = 1000;
      const max = 9999;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const activationCode = generateActivationCode();
    const time = new Date();
    time.setSeconds(time.getSeconds() + 3);

    schedule.scheduleJob(time, function () {
      sendVerificationEmail(email, activationCode);
    });

    let _id = userData._id;
    await User.findByIdAndUpdate(_id, { resetCode: activationCode });
    userData.password = undefined;
    res
      .status(200)
      .json({ message: "code send to your email", user: userData });
  } catch (error) {
    res.status(400).json({ error: "something went wrong!" });
  }
};

// verify forgot code

export const verifyForgotcode = async (req, res) => {
  const { resetCode, _id } = req.body;
  if (!_id) {
    return res.status(400).json({ error: "user id is required" });
  }
  if (!resetCode) {
    return res.status(400).json({ error: "please fill the code" });
  }
  try {
    let userCheck = await User.findById(_id);
    if (userCheck.resetCode !== resetCode) {
      return res.status(400).json({ error: "please enter valid code" });
    }
    await User.findByIdAndUpdate(_id, { resetCode: null });
    userCheck.password = undefined;
    res
      .status(200)
      .json({ message: "Please enter your new password", user: userCheck });
  } catch (error) {
    res.status(400).json({ error: "something went wrong!" });
  }
};

export const getRequests = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate({
      path: "requests.sender",
      select: "name image",
      model: User,
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ success: true, data: user.requests });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error fetching user's friend requests" });
  }
};

// Send a Connection Request
export const sendRequest = async (req, res) => {
  try {
    const sender = await User.findById(req.params.id);
    const receiver = await User.findById(req.body.receiver_id);
    if (!sender || !receiver) {
      return res.status(404).json({ error: "User not found" });
    }

    receiver.requests.push({ sender: sender._id, status: "pending" });
    await receiver.save();

    res.json({ message: "Friend request sent" });
  } catch (err) {
    res.status(500).json({ error: "Error sending friend request" });
  }
};

// Accept a connection request
export const acceptRequest = async (req, res) => {
  try {
    const receiver = await User.findById(req.params.id);
    if (!receiver) {
      return res.status(404).json({ error: "User not found" });
    }

    const requestIndex = receiver.requests.findIndex(
      (request) =>
        request.sender.toString() === req.body.sender_id &&
        request.status === "pending"
    );

    if (requestIndex === -1) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    receiver.requests[requestIndex].status = "accepted";
    receiver.connections.push(req.body.sender_id);
    await receiver.save();

    const sender = await User.findByIdAndUpdate(req.body.sender_id, {
      $push: { connections: receiver._id },
    });

    res.json({ message: "Friend request accepted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error accepting friend request" });
  }
};

// Reject a connection request
export const RejectRequest = async (req, res) => {
  try {
    const receiver = await User.findById(req.params.id);

    if (!receiver) {
      return res.status(404).json({ error: "User not found" });
    }

    const requestIndex = receiver.requests.findIndex(
      (request) =>
        request.sender.toString() === req.body.sender_id &&
        request.status === "pending"
    );

    if (requestIndex === -1) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    receiver.requests[requestIndex].status = "rejected";
    await receiver.save();

    res.json({ message: "Friend request rejected" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error rejecting friend request" });
  }
};

// Disconnect a user
export const Disconnect = async (req, res) => {
  const { connection_id } = req.body;
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const connectionIndex = user.connections.findIndex(
      (connection) => connection.toString() === connection_id
    );

    if (connectionIndex === -1) {
      return res.status(404).json({ error: "Connection not found" });
    }

    user.connections.splice(connectionIndex, 1);
    await user.save();

    const connection_user = await User.findById(connection_id);

    if (!connection_user) {
      return res.status(404).json({ error: "Connection not found" });
    }

    const connection2Index = connection_user.connections.findIndex(
      (connection) => connection.toString() === req.params.id
    );

    if (connection2Index === -1) {
      return res.status(404).json({ error: "Connection not found" });
    }

    connection_user.connections.splice(connection2Index, 1);
    await connection_user.save();

    res.json({ message: "User Disconnected" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error Disconnecting user" });
  }
};

// Get user's friends
export const getConnections = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate({
      path: "connections",
      select: "name image",
      model: User,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, data: user.connections });
  } catch (err) {
    res.status(500).json({ error: "Error fetching user's friends" });
  }
};

// Neighbour May Know
export const getMayKnow = async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const addressRange = parseFloat(user.address_rang) || 5;

    // Fetch potential connections who are not in the user's connections
    const potentialConnections = await User.find({
      _id: {
        $ne: userId,
        $nin: user.connections,
      },
      "address.latitude": { $exists: true },
      "address.longitude": { $exists: true },
    });

    const filteredConnections = potentialConnections.filter(
      (u) =>
        calculateDistance(
          parseFloat(user.address.latitude),
          parseFloat(user.address.longitude),
          parseFloat(u.address.latitude),
          parseFloat(u.address.longitude)
        ) <= addressRange
    );

    res.json(filteredConnections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//Delete Account
export const deleteAccount = async (req, res) => {
  const { id } = req.params;
  try {
    await Event.deleteMany({ created_by: id });
    await Message.deleteMany({
      $or: [{ senderId: id }, { recepientId: id }],
    });
    await Todo.deleteMany({ created_by: id });
    await User.findByIdAndDelete(id);
    res.json({ message: "Accsount deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error Deleting User" });
  }
};

export const getUserStatistics = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Months are 0-based, so add 1.

    const pipeline = [
      {
        $match: {
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lt: new Date(`${currentYear}-${currentMonth + 1}-01`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ];

    const result = await User.aggregate(pipeline);
    const monthData = Array.from({ length: currentMonth }, (_, i) => {
      const monthNumber = i + 1;
      const monthName = new Date(
        `${currentYear}-${monthNumber}-01`
      ).toLocaleString("en-US", { month: "short" });
      const monthCount =
        result.find((item) => item._id === monthNumber)?.count || 0;
      return { month: monthName, Accounts: monthCount };
    });

    res.json(monthData);
  } catch (error) {
    res.status(400).json({ message: "something went wrong!" });
  }
};

export const handleTrack = async (req, res) => {
  const { id, ip } = req.body;

  try {
    const user = await User.findById(id);
    if (user) {
      if (user.first_login === "Nil") {
        user.first_login = new Date().toISOString();
      }
      user.last_login = new Date().toISOString();
    }

    await user.save();

    const ip_response = await axios(
      `https://ipinfo.io/${ip}?token=${process.env.IP_INFO_TOKEN}`
    );
    const track = new Tracker({
      user: id,
      login_time: new Date().toISOString(),
      country: ip_response.data.country,
      city: ip_response.data.city,
      ip,
    });
    await track.save();
    res.status(201).json({ message: "User log saved" });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while taking log" });
  }
};

export const RecentLogins = async (req, res) => {
  try {
    const latestLogins = await Tracker.find()
      .populate("user", "name image")
      .sort({ login_time: "desc" })
      .limit(10);

    res.json(latestLogins);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching latest logins" });
  }
};

export async function generateOrgChart(req, res) {
  try {
    const admin = await User.findOne({ _id: req.params.id });
    const orgChart = await generateOrgChartHelper(admin);

    res.json(orgChart);
  } catch (error) {
    console.error(error);
  }
}

async function generateOrgChartHelper(user) {
  const orgNode = {
    name: user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName,
    attributes: {
      role: user.role,
      email: user.email,
    },
  };

  const children = await User.find({ created_by: user._id });

  if (children.length > 0) {
    orgNode.children = await Promise.all(
      children.map((child) => generateOrgChartHelper(child))
    );
  }

  return orgNode;
}

export const PermissionChecked = async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
    res.json(user.permissions);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching permissions" });
  }
};
