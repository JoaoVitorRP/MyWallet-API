import { historySchema } from "../schemas/historySchema.js";
import dayjs from "dayjs";
import { historyCollection } from "../database/db.js";

export async function getHistory(req, res) {
  const user = req.user;

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
  const { value, description, type } = req.body;

  const user = req.user;

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
