import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import joi from "joi";
import bcrypt from "bcrypt";

const registerSchema = joi.object({
  name: joi.string().min(3).required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
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
      hashPassword,
    });

    res.sendStatus(201);
  } catch (err) {
    res.sendStatus(500);
  }
});

app.listen(5000, () => console.log("Server running in port: 5000"));
