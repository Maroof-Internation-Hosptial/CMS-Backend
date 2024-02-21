import express from "express";
const routes = express.Router();

import {
  userSignup,
  userLogin,
  userUpdate,
  userGet,
  forgotPass,
  userVerify,
  verifyForgotcode,
  userPassUpdate,
  userEmailUpdate,
  getRequests,
  sendRequest,
  acceptRequest,
  RejectRequest,
  Disconnect,
  getConnections,
  getMayKnow,
  userGetbyId,
  deleteAccount,
  getUserStatistics,
  handleTrack,
  RecentLogins,
  memberSignup,
  generateOrgChart,
  PermissionChecked,
} from "../controllers/auth_controller.js";
import { uploadMultiple, uploadSingle } from "../middleware/pic_upload.js";
import { protect } from "../middleware/user_middleware.js";
import { uploadPicture, uploadPictures } from "../controllers/upload_pic.js";

routes.post("/user_signup", memberSignup);
routes.put("/user_verify", userVerify);
routes.put("/user_update/:_id", userUpdate);
routes.get("/user_get", protect, userGet);
routes.get("/user_getbyid", protect, userGetbyId);
routes.put("/user_passupdate", protect, userPassUpdate);
routes.put("/user_emailupdate", protect, userEmailUpdate);
routes.post("/user_login", userLogin);
routes.put("/reset_password", forgotPass);
routes.put("/reset_passcode", verifyForgotcode);
routes.delete("/delete_account/:id", deleteAccount);
routes.get("/user_statistics", getUserStatistics);
routes.post("/track_login", handleTrack);
routes.get("/user_tree/:id", generateOrgChart);
routes.get("/permissions_check/:userId", PermissionChecked);

// Connection routes
routes.get("/get_requests/:id", getRequests);
routes.post("/send_request/:id", sendRequest);
routes.post("/accept_request/:id", acceptRequest);
routes.post("/reject_request/:id", RejectRequest);
routes.post("/disconnect/:id", Disconnect);
routes.get("/user_connections/:id", getConnections);
routes.get("/people-you-may-know/:userId", getMayKnow);
routes.get("/recent_logins", RecentLogins);

// picture upload

routes.post("/picture_upload", uploadSingle, uploadPicture);
routes.post("/picture_uploads", uploadMultiple, uploadPictures);

export default routes;
