const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

let treasuryBalance = 100000000000.00;

app.get('/api/balance', (req, res) => {
  res.json({ balance: treasuryBalance });
});

app.post('/api/send', (req, res) => {
  const { to, amount } = req.body;
  if (amount > treasuryBalance) {
    return res.status(400).json({ error: 'Insufficient funds in treasury.' });
  }
  treasuryBalance -= amount;
  res.json({ success: true, newBalance: treasuryBalance, to });
});

app.post('/api/convert/fiat', (req, res) => {
  const { amount, currency } = req.body;
  if (amount > treasuryBalance) {
    return res.status(400).json({ error: 'Insufficient treasury funds.' });
  }
  const rate = currency === 'USD' ? 0.054 : 1; // Example: 1 ZAR = 0.054 USD
  const converted = amount * rate;
  treasuryBalance -= amount;
  res.json({ converted, currency, newBalance: treasuryBalance });
});

app.post('/api/convert/etf', (req, res) => {
  const { amount } = req.body;
  if (amount > treasuryBalance) {
    return res.status(400).json({ error: 'Insufficient treasury funds.' });
  }
  const etfUnits = amount / 1000; // Example: 1000 ZAR = 1 ETF unit
  treasuryBalance -= amount;
  res.json({ etfUnits, newBalance: treasuryBalance });
});

app.post('/api/withdraw', (req, res) => {
  const { amount, bankAccount } = req.body;
  if (amount > treasuryBalance) {
    return res.status(400).json({ error: 'Insufficient funds in treasury.' });
  }
  treasuryBalance -= amount;
  res.json({ success: true, bankAccount, withdrawnAmount: amount, newBalance: treasuryBalance });
});

app.listen(port, () => {
  console.log(`Treasury DApp API running on port ${port}`);
});

