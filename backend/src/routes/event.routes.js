import express from "express";
import { logEvent, getEvents } from "../controllers/event.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.post("/log", logEvent);
router.get("/", verifyJWT, authorizeRoles('admin'), getEvents);

export default router;
