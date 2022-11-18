import { getHistory, postHistory } from "../controllers/historyController.js";
import { Router } from "express";
import { tokenValidation } from "../middlewares/tokenValidationMiddleware.js";

const router = Router();

router.get("/history", tokenValidation, getHistory);

router.post("/history", tokenValidation, postHistory);

export default router;
