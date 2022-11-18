import { accountsCollection, historyCollection, historySchema, sessionsCollection } from "../app.js";
import dayjs from "dayjs";

export async function getHistory(req, res) {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");
  if (!token) return res.status(400).send("Missing bearer token");

  const session = await sessionsCollection.findOne({ token });
  if (!session) return res.status(404).send("Could not find a session with this token");

  const user = await accountsCollection.findOne({ _id: session.userId });
  if (!user) return res.status(404).send("Could not find the user");

  try {
    const history = await historyCollection.find({ from: user.email }).sort({ time: -1 }).toArray();
    history?.forEach((h) => {
      delete h.from;
      delete h.time;
      delete h._id;
    });
    res.send(history);
  } catch (err) {
    res.status(500).send(err);
  }
}

export async function postHistory(req, res) {
  const { authorization } = req.headers;
  const { value, description, type } = req.body;

  const token = authorization?.replace("Bearer ", "");
  if (!token) return res.status(400).send("Missing bearer token");

  const session = await sessionsCollection.findOne({ token });
  if (!session) return res.status(404).send("Could not find a session with this token");

  const user = await accountsCollection.findOne({ _id: session.userId });
  if (!user) return res.status(404).send("Could not find the user");

  const { error } = historySchema.validate(req.body, { convert: false });
  if (error) return res.status(422).send(error.details[0].message);

  try {
    await historyCollection.insertOne({
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
}
