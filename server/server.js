
import express from "express";
import cors from "cors";
import Database from "better-sqlite3";

const app = express();
const db = new Database("bank.db");

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY,
    holder_name TEXT NOT NULL,
    balance INTEGER NOT NULL CHECK (balance >= 0)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

db.prepare(`
  INSERT OR IGNORE INTO accounts (id, holder_name, balance)
  VALUES (1, 'Sri Ram', 10000)
`).run();

function getAccount() {
  return db.prepare("SELECT * FROM accounts WHERE id = 1").get();
}

app.get("/api/account", (req, res) => {
  res.json(getAccount());
});

app.get("/api/transactions", (req, res) => {
  const transactions = db
    .prepare("SELECT * FROM transactions ORDER BY id DESC")
    .all();

  res.json(transactions);
});


app.get("/api/transactions/summary", (req, res) => {
  const summary = db.prepare(`
    SELECT
      COUNT(*) AS total_transactions,
      COALESCE(
        SUM(CASE WHEN type = 'deposit' THEN amount ELSE 0 END),
        0
      ) AS total_deposits,
      COALESCE(
        SUM(CASE WHEN type = 'withdraw' THEN amount ELSE 0 END),
        0
      ) AS total_withdrawals
    FROM transactions
  `).get();

  res.json(summary);
});


const transact = db.transaction((type, amount) => {
  const account = getAccount();

  if (type === "withdraw" && account.balance < amount) {
    throw new Error("Insufficient balance");
  }

  const balance =
    type === "deposit"
      ? account.balance + amount
      : account.balance - amount;

  db.prepare("UPDATE accounts SET balance = ? WHERE id = 1")
    .run(balance);

  db.prepare("INSERT INTO transactions (type, amount) VALUES (?, ?)")
    .run(type, amount);

  return getAccount();
});

function transactionHandler(type) {
  return (req, res) => {
    const { amount } = req.body ?? {};

    if (
      typeof amount !== "number" ||
      !Number.isSafeInteger(amount) ||
      amount <= 0
    ) {
      return res.status(400).json({
        error: "Amount must be a positive whole number",
      });
    }

    try {
      const account = transact(type, amount);
      res.json({ message: "Transaction successful", account });
    } catch (error) {
      if (error.message === "Insufficient balance") {
        return res.status(400).json({ error: error.message });
      }

      console.error(error);
      res.status(500).json({ error: "Transaction failed" });
    }
  };
}

app.post("/api/transactions/deposit", transactionHandler("deposit"));
app.post("/api/transactions/withdraw", transactionHandler("withdraw"));

app.listen(5000, () => {
  console.log("Banking API running at http://localhost:5000");
});
