import { postSession, deleteSession } from "../controllers/sessionsController.js";
import { Router } from "express";

const router = Router();

router.post("/sessions", postSession);

router.delete("/sessions", deleteSession);

export default router;