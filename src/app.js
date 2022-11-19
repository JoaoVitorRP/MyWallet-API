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

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running in port: ${port}`));
