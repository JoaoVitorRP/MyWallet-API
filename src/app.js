import express from "express";
import cors from "cors";
import accountsRouter from "./routes/accountsRoutes.js";
import historyRouter from "./routes/historyRoutes.js";
import sessionsRouter from "./routes/sessionsRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(accountsRouter);
app.use(historyRouter);
app.use(sessionsRouter);

app.listen(5000, () => console.log("Server running in port: 5000"));
