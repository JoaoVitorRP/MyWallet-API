import { postSession, deleteSession } from "../controllers/sessionsController.js";
import { Router } from "express";
import { tokenValidation } from "../middlewares/tokenValidationMiddleware.js";

const router = Router();

router.post("/sessions", postSession);

router.delete("/sessions", tokenValidation, deleteSession);

export default router;
