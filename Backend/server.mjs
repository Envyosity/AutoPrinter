import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import axios from "axios";
import cron from "node-cron";
import notifier from "node-notifier";
const { Pool } = pkg;
import print from "./print.cjs";
const { printTransfers } = print;

const app = express();
app.use(cors(), express.json());
dotenv.config();

const pool = new Pool({
  user: process.env.USER,
  password: process.env.PASSWORD,
  host: process.env.HOST,
  port: process.env.PORT,
  database: process.env.DB,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client:", err);
});

const executeQuery = async (query, params = []) => {
  try {
    const { rows } = await pool.query(query, params);
    return rows;
  } catch (err) {
    console.error("Database query error:", err);
    throw err;
  }
};

let lastTransferId = null;

app.get("/getLatestTransfer", async (req, res) => {
  try {
    //const sqlddl = ddl
    const result = await executeQuery(sqlddl);

    let transferId = result[0].id;

    lastTransferId != transferId || lastTransferId == null
      ? ((async () => {
          await printTransfers(result);
        })(),
        (lastTransferId = transferId))
      : null;

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
  }
});

app.post("/printById", async (req, res) => {
  try {
    const { transferenciaId } = req.body;
    //const sqlddl = ddl
    const result = await executeQuery(sqlddl, [transferenciaId]);

    result.length == 0 ? res.status(200) : await printTransfers(result);

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
  }
});

cron.schedule("*/10 * * * * *", async () => {
  try {
    await axios.get(
      `http://localhost:${process.env.NEXT_PUBLIC_SERVER_CLIENT_PORT}/getLatestTransfer`
    );
  } catch (error) {
    notifier.notify({
      title: "Erro Interno",
      message: "Abra a aplicação novamente",
      sound: true,
      wait: true,
    });
    console.log(error);
    process.exit(0);
  }
});

app.listen(process.env.NEXT_PUBLIC_SERVER_CLIENT_PORT, () => {
  console.log(
    `Server is running on http://localhost:${process.env.NEXT_PUBLIC_SERVER_CLIENT_PORT}`
  );
});
