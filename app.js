const express = require('express');
const Web3 = require('web3');
const { v4: uuid } = require('uuid');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());

// Connect to local Ethereum node or testnet
const web3 = new Web3('http://localhost:8545'); // Replace with Infura/Alchemy for mainnet

// In-memory store for accounts (simulate DB)
let accounts = {};

// Initialize National Treasury Wallet
const NATIONAL_TREASURY = web3.eth.accounts.create();
accounts[NATIONAL_TREASURY.address] = {
  ...NATIONAL_TREASURY,
  balance: web3.utils.toWei('100000000000.00', 'ether'), // 100 billion ZAR
};

// Create New CBDC Wallet
app.post('/api/account/create', (req, res) => {
  const { name, idNumber, institution } = req.body;
  const wallet = web3.eth.accounts.create();
  accounts[wallet.address] = {
    ...wallet,
    balance: web3.utils.toWei('100.00', 'ether'), // 100 ZAR grant
    name,
    idNumber,
    institution,
  };
  res.status(201).json({
    message: 'CBDC wallet created',
    address: wallet.address,
    privateKey: wallet.privateKey,
    balance: '100.00 ZAR',
  });
});

// Get Account Balance
app.get('/api/account/balance/:address', (req, res) => {
  const { address } = req.params;
  if (!accounts[address]) return res.status(404).json({ error: 'Account not found' });

  const balance = web3.utils.fromWei(accounts[address].balance, 'ether');
  res.status(200).json({ address, balance: `${balance} ZAR` });
});

// Transfer CBDC
app.post('/api/tx/transfer', (req, res) => {
  const { from, to, amount } = req.body;
  if (!accounts[from] || !accounts[to]) {
    return res.status(404).json({ error: 'Invalid from/to address' });
  }

  const weiAmount = web3.utils.toWei(amount.toString(), 'ether');
  if (BigInt(accounts[from].balance) < BigInt(weiAmount)) {
    return res.status(400).json({ error: 'Insufficient funds' });
  }

  // Transfer funds
  accounts[from].balance = (BigInt(accounts[from].balance) - BigInt(weiAmount)).toString();
  accounts[to].balance = (BigInt(accounts[to].balance) + BigInt(weiAmount)).toString();

  res.status(200).json({
    message: `Transferred ${amount} ZAR`,
    from,
    to,
    txID: uuid(),
  });
});

// Default route
app.get('/', (req, res) => {
  res.send('CBDC API for National Treasury is running.');
});

// Run Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`CBDC API running on port ${PORT}`));
