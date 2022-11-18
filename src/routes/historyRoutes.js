import { getHistory, postHistory } from "../controllers/historyController.js";
import { Router } from "express";

const router = Router();

router.get("/history", getHistory);

router.post("/history", postHistory);

export default router;
