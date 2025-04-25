const express = require('const express = require('express');
const cors = require('cors');
const { getLatestBlock, getEthBalance, sendEth } = require('./web3Utils'); // Import Web3 utilities

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Treasury balance (example: ZAR)
let treasuryBalance = 100000000000.0; // Example balance

// API Endpoints

// Fetch latest Ethereum block number
app.get('/api/block', async (req, res) => {
  try {
    const blockNumber = await getLatestBlock();
    res.json({ blockNumber });
  } catch (err) {
    res.status(500).json({ error: 'Error retrieving block number', details: err.message });
  }
});

// Get Ethereum balance of a specific address
app.get('/api/eth-balance/:address', async (req, res) => {
  const { address } = req.params;
  try {
    const balance = await getEthBalance(address);
    res.json({ address, balance });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching balance', details: err.message });
  }
});

// Send ETH transaction
app.post('/api/send-eth', async (req, res) => {
  const { from, to, amount, privateKey } = req.body;
  try {
    const receipt = await sendEth(from, to, amount, privateKey);
    res.json({ success: true, transactionHash: receipt.transactionHash });
  } catch (err) {
    res.status(500).json({ error: 'Error sending transaction', details: err.message });
  }
});

// Treasury-specific endpoints

// Get Treasury balance
app.get('/api/treasury-balance', (req, res) => {
  res.json({ balance: treasuryBalance });
});

// Send funds from Treasury
app.post('/api/treasury-send', (req, res) => {
  const { to, amount } = req.body;
  if (amount > treasuryBalance) {
    return res.status(400).json({ error: 'Insufficient funds in treasury.' });
  }
  treasuryBalance -= amount;
  res.json({ success: true, newBalance: treasuryBalance, to });
});

// Convert Treasury funds to fiat (e.g., USD or ZAR)
app.post('/api/convert-fiat', (req, res) => {
  const { amount, currency } = req.body;
  if (amount > treasuryBalance) {
    return res.status(400).json({ error: 'Insufficient treasury funds.' });
  }
  const rate = currency === 'USD' ? 0.054 : 1; // Example conversion rate
  const converted = amount * rate;
  treasuryBalance -= amount;
  res.json({ converted, currency, newBalance: treasuryBalance });
});

// Convert Treasury funds to ETF
app.post('/api/convert-etf', (req, res) => {
  const { amount } = req.body;
  if (amount > treasuryBalance) {
    return res.status(400).json({ error: 'Insufficient treasury funds.' });
  }
  const etfUnits = amount / 1000; // Example: 1000 ZAR = 1 ETF unit
  treasuryBalance -= amount;
  res.json({ etfUnits, newBalance: treasuryBalance });
});

// Withdraw Treasury funds to a bank account
app.post('/api/withdraw', (req, res) => {
  const { amount, bankAccount } = req.body;
  if (amount > treasuryBalance) {
    return res.status(400).json({ error: 'Insufficient funds in treasury.' });
  }
  treasuryBalance -= amount;
  res.json({ success: true, bankAccount, withdrawnAmount: amount, newBalance: treasuryBalance });
});

// Start the server
app.listen(port, () => {
  console.log(`Treasury DApp API running on port ${port}`);
});');
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

