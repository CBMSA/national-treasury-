// Backend (app.js)
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

app.listen(port, () => {
  console.log(`Treasury DApp API running on port ${port}`);
});

// Frontend (App.jsx)
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function App() {
  const [balance, setBalance] = useState(0);
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3001/api/balance')
      .then(res => setBalance(res.data.balance));
  }, []);

  const handleSend = () => {
    axios.post('http://localhost:3001/api/send', { to, amount: parseFloat(amount) })
      .then(res => {
        setMessage(`Sent R${amount} to ${to}`);
        setBalance(res.data.newBalance);
        setAmount('');
        setTo('');
      })
      .catch(err => {
        setMessage(err.response?.data?.error || 'Error occurred');
      });
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px', fontFamily: 'Segoe UI' }}>
      <h1>National Treasury DApp</h1>
      <p><strong>Balance:</strong> R{balance.toLocaleString()}</p>
      <input type="text" placeholder="Recipient (e.g., Wallet ID)" value={to} onChange={e => setTo(e.target.value)} style={{ width: '100%', marginBottom: '10px' }} />
      <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} style={{ width: '100%', marginBottom: '10px' }} />
      <button onClick={handleSend} style={{ width: '100%', padding: '10px', background: '#00509e', color: 'white', border: 'none', borderRadius: '5px' }}>Send</button>
      {message && <p style={{ marginTop: '10px', color: 'green' }}>{message}</p>}
    </div>
  );
}