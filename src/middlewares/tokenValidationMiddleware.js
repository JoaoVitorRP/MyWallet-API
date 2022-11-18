import { accountsCollection, sessionsCollection } from "../database/db.js";

export async function tokenValidation(req, res, next) {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");
  if (!token) return res.status(400).send("Missing bearer token");

  const session = await sessionsCollection.findOne({ token });
  if (!session) return res.status(404).send("Could not find a session with this token");

  const user = await accountsCollection.findOne({ _id: session.userId });
  if (!user) return res.status(404).send("Could not find the user");

  req.token = token;
  req.user = user;

  next();
}
