import { postAccount } from "../controllers/accountsController.js";
import { Router } from "express";

const router = Router();

router.post("/accounts", postAccount);

export default router;
