
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api";

type Account = {
  id: number;
  holder_name: string;
  balance: number;
};

type Transaction = {
  id: number;
  type: "deposit" | "withdraw";
  amount: number;
  created_at: string;
};

type Summary = {
  total_transactions: number;
  total_deposits: number;
  total_withdrawals: number;
};

function formatMoney(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function App() {
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadData() {
    try {
      const responses = await Promise.all([
        fetch(`${API}/account`),
        fetch(`${API}/transactions`),
        fetch(`${API}/transactions/summary`),
      ]);

      if (responses.some((response) => !response.ok)) {
        throw new Error("Unable to load account information.");
      }

      const [accountData, transactionData, summaryData] =
        await Promise.all(responses.map((response) => response.json()));

      setAccount(accountData as Account);
      setTransactions(transactionData as Transaction[]);
      setSummary(summaryData as Summary);
    } catch {
      setError(true);
      setMessage("Cannot connect to backend. Please check your server.");
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleTransaction(type: "deposit" | "withdraw") {
    const value = Number(amount);

    if (!Number.isSafeInteger(value) || value <= 0) {
      setError(true);
      setMessage("Please enter a positive whole amount.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API}/transactions/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: value }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Transaction failed.");
      }

      setError(false);
      setMessage(data.message || "Transaction successful!");
      setAmount("");
      await loadData();
    } catch (err) {
      setError(true);
      setMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#home">
          <span className="brand-icon">₹</span>
          <span>
            <strong>MiniBank</strong>
            <small>Simple. Secure. Smart.</small>
          </span>
        </a>

        <div className="profile">
          <span className="online-dot" />
          <span>Demo Account</span>
        </div>
      </header>

      <main id="home">
        <section className="welcome">
          <div>
            <span className="eyebrow">YOUR PERSONAL BANKING DASHBOARD</span>
            <h1>Welcome back, {account?.holder_name || "User"}!</h1>
            <p>Manage your money and keep track of your transactions.</p>
          </div>
          <div className="welcome-symbol" aria-hidden="true">↗</div>
        </section>

        <section className="balance-card">
          <div className="balance-content">
            <span className="balance-label">
              <span className="wallet-icon">▣</span>
              Available Balance
            </span>

            <h2>{account ? formatMoney(account.balance) : "Loading..."}</h2>

            <p>
              Account ID: {account?.id ?? "—"}
              <span className="balance-separator">•</span>
              Indian Rupee (INR)
            </p>
          </div>

          <div className="balance-art" aria-hidden="true">
            <span>₹</span>
            <i />
            <i />
            <i />
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon blue">↕</span>
            <div>
              <p>Total Transactions</p>
              <h3>{summary?.total_transactions ?? "—"}</h3>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon green">↓</span>
            <div>
              <p>Total Deposits</p>
              <h3 className="green-text">
                {summary ? formatMoney(summary.total_deposits) : "Loading..."}
              </h3>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon red">↑</span>
            <div>
              <p>Total Withdrawals</p>
              <h3 className="red-text">
                {summary ? formatMoney(summary.total_withdrawals) : "Loading..."}
              </h3>
            </div>
          </div>
        </section>

        {message && (
          <div className={`message ${error ? "message-error" : "message-success"}`}>
            <span>{error ? "!" : "✓"}</span>
            <p>{message}</p>
            <button onClick={() => setMessage("")} aria-label="Close message">
              ×
            </button>
          </div>
        )}

        <section className="section-heading">
          <div>
            <span className="eyebrow">QUICK ACTIONS</span>
            <h2>Manage your money</h2>
          </div>
          <span className="secure-label">● Connected to your backend</span>
        </section>

        <section className="action-grid">
          <div className="panel action-panel">
            <div className="action-heading">
              <span className="action-icon deposit-icon">↓</span>
              <div>
                <h3>Deposit Money</h3>
                <p>Add money to your account</p>
              </div>
            </div>

            <label htmlFor="deposit-amount">Enter amount</label>
            <div className="amount-input">
              <span>₹</span>
              <input
                id="deposit-amount"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 1000"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>

            <button
              className="action-button deposit-button"
              disabled={loading}
              onClick={() => void handleTransaction("deposit")}
            >
              {loading ? "Processing..." : "Deposit Money"}
              <span>→</span>
            </button>
          </div>

          <div className="panel action-panel">
            <div className="action-heading">
              <span className="action-icon withdraw-icon">↑</span>
              <div>
                <h3>Withdraw Money</h3>
                <p>Withdraw from your available balance</p>
              </div>
            </div>

            <label htmlFor="withdraw-amount">Enter amount</label>
            <div className="amount-input">
              <span>₹</span>
              <input
                id="withdraw-amount"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 500"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>

            <button
              className="action-button withdraw-button"
              disabled={loading}
              onClick={() => void handleTransaction("withdraw")}
            >
              {loading ? "Processing..." : "Withdraw Money"}
              <span>→</span>
            </button>
          </div>
        </section>

        <section className="panel history-panel">
          <div className="history-heading">
            <div>
              <span className="eyebrow">YOUR ACCOUNT ACTIVITY</span>
              <h2>Recent Transactions</h2>
            </div>
            <button
              className="refresh-button"
              disabled={loading}
              onClick={() => void loadData()}
            >
              ↻ Refresh
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="empty-state">
              <span>↕</span>
              <p>No transactions yet. Make your first deposit!</p>
            </div>
          ) : (
            <div className="transaction-list">
              {transactions.map((transaction) => (
                <div className="transaction-row" key={transaction.id}>
                  <span className={`transaction-icon ${transaction.type}`}>
                    {transaction.type === "deposit" ? "↓" : "↑"}
                  </span>

                  <div className="transaction-details">
                    <strong>
                      {transaction.type === "deposit" ? "Deposit" : "Withdrawal"}
                    </strong>
                    <span>Transaction #{transaction.id}</span>
                  </div>

                  <div className="transaction-right">
                    <strong className={`transaction-amount ${transaction.type}`}>
                      {transaction.type === "deposit" ? "+" : "−"}
                      {formatMoney(transaction.amount)}
                    </strong>
                    <span>{transaction.created_at}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="history-footer">
            Showing {transactions.length} transaction
            {transactions.length === 1 ? "" : "s"}
          </div>
        </section>

        <footer className="footer">
          <strong>MiniBank</strong>
          <span>Built with React, TypeScript, Express &amp; SQLite</span>
          <span>Educational demo — not a real banking service</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
