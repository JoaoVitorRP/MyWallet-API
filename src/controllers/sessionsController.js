import { loginSchema } from "../schemas/loginSchema.js";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { accountsCollection, sessionsCollection } from "../database/db.js";

export async function postSession(req, res) {
  const { email, password } = req.body;

  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(422).send(error.details[0].message);

  const user = await accountsCollection.findOne({ email });
  if (!user) return res.status(404).send("Email invalido!");

  const alreadyHasAToken = await sessionsCollection.findOne({ userId: user._id });
  if (alreadyHasAToken) {
    sessionsCollection.deleteOne({ userId: user._id });
  }

  if (bcrypt.compareSync(password, user.password)) {
    try {
      const token = uuid();

      await sessionsCollection.insertOne({
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
}

export async function deleteSession(req, res) {
  const token = req.token;

  try {
    await sessionsCollection.deleteOne({ token });
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err);
  }
}
