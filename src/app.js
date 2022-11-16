import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

const registerSchema = joi.object({
  name: joi.string().min(3).required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
});

const loginSchema = joi.object({
  email: joi.string().required(),
  password: joi.string().required(),
});

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI);

try {
  await mongoClient.connect();
  const db = mongoClient.db("MyWallet_API");
} catch (err) {
  console.log(err);
}

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashPassword = bcrypt.hashSync(password, 15);

  const { error } = registerSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    res.status(422).send(errors);
    return;
  }

  try {
    const emailAlreadyExists = await db.collection("accounts").findOne({ email });
    if (emailAlreadyExists) {
      res.status(409).send("Este email já se encontra cadastrado!");
      return;
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

  const { error } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    res.status(422).send(errors);
    return;
  }

  const user = db.collection("accounts").findOne({ email });
  if (!user) {
    res.status(404).send("Email invalido!");
    return;
  }

  if (bcrypt.compareSync(password, user.password)) {
    try {
      const token = uuid();

      await db.collection("sessions").insertOne({
        userId: user._id,
        token,
      });
      
      res.send(token);
    } catch (err) {
      res.status(500).send(err);
    }
  } else {
    res.status(409).send("Senha incorreta!");
  }
});

app.listen(5000, () => console.log("Server running in port: 5000"));
