import express from "express";
import cors from "cors";
import joi from "joi";
import accountsRouter from "./routes/accountsRoutes.js";
import historyRouter from "./routes/historyRoutes.js";
import sessionsRouter from "./routes/sessionsRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(accountsRouter);
app.use(historyRouter);
app.use(sessionsRouter);


export const accountSchema = joi.object({
  name: joi.string().min(3).max(30).required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
});

export const loginSchema = joi.object({
  email: joi.string().required(),
  password: joi.string().required(),
});

export const historySchema = joi.object({
  value: joi.number().precision(2).positive().max(99999999).required(),
  description: joi.string().min(3).max(25).required(),
  type: joi.string().required(),
});

app.listen(5000, () => console.log("Server running in port: 5000"));
