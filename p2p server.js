const express = require('express');
const bodyParser = require('body-parser');
const oracledb = require('oracledb');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const dbConfig = {
  user: 'CBDC_USER',
  password: 'CBDC_PASS',
  connectString: 'localhost/XEPDB1' // Replace with your actual Oracle connect string
};

// Get user balances
app.get('/api/get-balance', async (req, res) => {
  const phone = req.query.phone;
  try {
    const conn = await oracledb.getConnection(dbConfig);
    const result = await conn.execute(
      `SELECT cbdc_balance, bank_balance, bank_name, bank_account_no FROM cb_users WHERE phone_number = :phone`,
      [phone]
    );
    await conn.close();

    if (result.rows.length === 0) return res.status(404).send({ error: 'User not found' });

    const [cbdc_balance, bank_balance, bank_name, bank_account_no] = result.rows[0];
    res.send({ cbdc_balance, bank_balance, bank_name, bank_account_no });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Database error' });
  }
});

// Validate PIN
app.post('/api/validate-pin', async (req, res) => {
  const { phone, pin } = req.body;
  try {
    const conn = await oracledb.getConnection(dbConfig);
    const result = await conn.execute(
      `SELECT 1 FROM cb_users WHERE phone_number = :phone AND pin_code = :pin`,
      [phone, pin]
    );
    await conn.close();
    res.send({ valid: result.rows.length > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Validation failed' });
  }
});

// Register new user
app.post('/api/register', async (req, res) => {
  const { name, email, office, nationality, phone, bankName, bankAcc, pin } = req.body;
  try {
    const conn = await oracledb.getConnection(dbConfig);
    await conn.execute(
      `INSERT INTO cb_users (full_name, email_address, office_address, nationality, phone_number, bank_name, bank_account_no, pin_code, cbdc_balance, bank_balance)
       VALUES (:name, :email, :office, :nationality, :phone, :bankName, :bankAcc, :pin, 100000, 0)`,
      { name, email, office, nationality, phone, bankName, bankAcc, pin }
    );
    await conn.commit();
    await conn.close();
    res.send({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Registration failed' });
  }
});

// Transfer CBDC to bank
app.post('/api/transfer', async (req, res) => {
  const { phone, amount } = req.body;
  const value = parseFloat(amount);
  if (!value || value <= 0) return res.status(400).send({ error: 'Invalid amount' });

  try {
    const conn = await oracledb.getConnection(dbConfig);
    const result = await conn.execute(
      `SELECT user_id, cbdc_balance, bank_balance FROM cb_users WHERE phone_number = :phone`,
      [phone],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) return res.status(404).send({ error: 'User not found' });

    const { USER_ID: user_id, CBDC_BALANCE: cbdc_balance } = result.rows[0];
    if (cbdc_balance < value) {
      await conn.close();
      return res.status(400).send({ error: 'Insufficient CBDC balance' });
    }

    await conn.execute(
      `UPDATE cb_users SET cbdc_balance = cbdc_balance - :amount, bank_balance = bank_balance + :amount WHERE phone_number = :phone`,
      [value, phone]
    );

    await conn.execute(
      `INSERT INTO cb_transactions (user_id, amount, tx_type) VALUES (:uid, :amount, 'CBDC_TO_BANK')`,
      [user_id, value]
    );

    await conn.commit();
    await conn.close();
    res.send({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Transfer failed' });
  }
});

app.listen(port, () => {
  console.log(`CBDC backend API running on port ${port}`);
});



let localWallet = {
  address: "0xCBM123SADC",
  balance: 1000000000
};

function sendToWalletPlatform(amount) {
  console.log(`Transferred to SADC Wallet Platform: R${amount.toFixed(2)}`);
  localWallet.balance += amount;
}

function deductFromWallet(amount) {
  if (localWallet.balance >= amount) {
    localWallet.balance -= amount;
    console.log(`Deducted R${amount.toFixed(2)} from wallet`);
  } else {
    console.error("Insufficient funds");
  }
}

function getWalletBalance() {
  return localWallet.balance;
}
