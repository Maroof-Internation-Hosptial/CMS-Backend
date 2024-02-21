import express from "express";
const routes = express.Router();
import { protect } from "../middleware/user_middleware.js";
import {
  GetStats,
  eventsForCalender,
  getEvents,
  getMembers,
  updateMember,
} from "../controllers/admin_controller.js";

routes.get("/events", getEvents);
routes.get("/events/calendar", protect, eventsForCalender);
routes.get("/users", getMembers);
routes.put("/users/:_id", updateMember);
routes.get("/user_city_stats", GetStats);

export default routes;
