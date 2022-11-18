import { accountSchema } from "../app.js";
import bcrypt from "bcrypt";
import { accountsCollection } from "../database/db.js";

export async function postAccount(req, res) {
  const { name, email, password } = req.body;
  const hashPassword = bcrypt.hashSync(password, 15);

  const { error } = accountSchema.validate(req.body);
  if (error) return res.status(422).send(error.details[0].message);

  try {
    const emailAlreadyExists = await accountsCollection.findOne({ email });
    if (emailAlreadyExists) {
      return res.status(409).send("Este email já se encontra cadastrado!");
    }

    await accountsCollection.insertOne({
      name,
      email,
      password: hashPassword,
    });

    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err);
  }
}
