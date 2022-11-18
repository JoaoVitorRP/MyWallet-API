import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import joi from "joi";
import { postAccount } from "./controllers/accountsController.js";
import { deleteSession, postSession } from "./controllers/sessionsController.js";
import { getHistory, postHistory } from "./controllers/historyController.js";

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

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

try {
  await mongoClient.connect();
  db = mongoClient.db("MyWallet_API");
} catch (err) {
  console.log(err);
}

export const accountsCollection = db.collection("accounts");
export const sessionsCollection = db.collection("sessions");
export const historyCollection = db.collection("history");

app.post("/accounts", postAccount);

app.post("/sessions", postSession);

app.get("/history", getHistory);

app.post("/history", postHistory);

app.delete("/sessions", deleteSession);

app.listen(5000, () => console.log("Server running in port: 5000"));
