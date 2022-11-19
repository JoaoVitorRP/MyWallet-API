import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

try {
  await mongoClient.connect();
  db = mongoClient.db("MyWallet_API");
  console.log("Connected to MongoDB");
} catch (err) {
  console.log(err);
}

export const accountsCollection = db.collection("accounts");
export const sessionsCollection = db.collection("sessions");
export const historyCollection = db.collection("history");
