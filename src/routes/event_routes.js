import express from "express";
const routes = express.Router();
import { protect } from "../middleware/user_middleware.js";
import multer from "multer";
import {
  addRating,
  createEvent,
  generateEvents,
  generateUserPDF,
  updateEvent,
} from "../controllers/event_controller.js";
import { getUserEvents } from "../controllers/global_controller.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

routes.post("/event/create", upload.array("file"), protect, createEvent);
routes.put("/event/update/:_id", protect, updateEvent);
routes.get("/event/pdf", generateEvents);
routes.get("/user_events/pdf", generateUserPDF);
routes.get("/user_events/:_id", protect, getUserEvents);
routes.post("/event_rate/:eventId", protect, addRating);
// routes.get("/event_rating/:id", protect, averageRating);

export default routes;
