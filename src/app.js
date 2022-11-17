import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";

const registerSchema = joi.object({
  name: joi.string().min(3).max(30).required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
});

const loginSchema = joi.object({
  email: joi.string().required(),
  password: joi.string().required(),
});

const historySchema = joi.object({
  value: joi.number().positive().required(),
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

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashPassword = bcrypt.hashSync(password, 15);

  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(422).send(error.details[0].message);

  try {
    const emailAlreadyExists = await db.collection("accounts").findOne({ email });
    if (emailAlreadyExists) {
      return res.status(409).send("Este email já se encontra cadastrado!");
    }

    await db.collection("accounts").insertOne({
      name,
      email,
      password: hashPassword,
    });

    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(422).send(error.details[0].message);

  const user = await db.collection("accounts").findOne({ email });
  if (!user) return res.status(404).send("Email invalido!");

  const alreadyHasAToken = await db.collection("sessions").findOne({ userId: user._id });
  if (alreadyHasAToken) {
    db.collection("sessions").deleteOne({ userId: user._id });
  }

  if (bcrypt.compareSync(password, user.password)) {
    try {
      const token = uuid();

      await db.collection("sessions").insertOne({
        userId: user._id,
        token,
      });

      res.send({ name: user.name, token });
    } catch (err) {
      res.status(500).send(err);
    }
  } else {
    res.status(401).send("Senha incorreta!");
  }
});

app.get("/history", async (req, res) => {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");
  if (!token) return res.status(400).send("Missing bearer token");

  const session = await db.collection("sessions").findOne({ token });
  if (!session) return res.status(404).send("Could not find a session with this token");

  const user = await db.collection("accounts").findOne({ _id: session.userId });
  if (!user) return res.status(404).send("Could not find the user");

  try {
    const history = await db.collection("history").find({ from: user.email }).sort({ time: -1 }).toArray();
    res.send(history);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post("/history", async (req, res) => {
  const { authorization } = req.headers;
  const { value, description, type } = req.body;

  const token = authorization?.replace("Bearer ", "");
  if (!token) return res.status(400).send("Missing bearer token");

  const session = await db.collection("sessions").findOne({ token });
  if (!session) return res.status(404).send("Could not find a session with this token");

  const user = await db.collection("accounts").findOne({ _id: session.userId });
  if (!user) return res.status(404).send("Could not find the user");

  const { error } = historySchema.validate(req.body);
  if (error) return res.status(422).send(error.details[0].message);

  try {
    await db.collection("history").insertOne({
      from: user.email,
      date: dayjs().format("DD/MM"),
      value,
      description,
      type,
      time: Date.now(),
    });
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(5000, () => console.log("Server running in port: 5000"));
