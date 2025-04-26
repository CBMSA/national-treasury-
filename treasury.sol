const CONTRACT_ABI = [/* ... */];
const CONTRACT_ADDRESS = "0x...";

// Replace this with your Geth node URL
const GETH_NODE_URL = "http://<geth-node-ip>:8545"; // Replace <geth-node-ip> with the actual IP or hostname of your Geth node.

let web3;
let account;

window.addEventListener('load', async () => {
  if (typeof window.ethereum !== 'undefined') {
    web3 = new Web3(window.ethereum);
    try {
      await ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3.eth.getAccounts();
      account = accounts[0];
      document.getElementById('account').innerText = account;

      const balanceWei = await web3.eth.getBalance(account);
      const balance = web3.utils.fromWei(balanceWei, 'ether');
      document.getElementById('balance').innerText = parseFloat(balance).toFixed(2);

      ethereum.on('accountsChanged', () => location.reload());
      ethereum.on('chainChanged', () => location.reload());

    } catch (error) {
      console.error('Wallet connection error:', error);
    }
  } else if (GETH_NODE_URL) {
    // Fallback to Geth node if MetaMask is not available
    web3 = new Web3(new Web3.providers.HttpProvider(GETH_NODE_URL));
    console.log("Connected to Geth node via HTTP provider.");

    // Load account from Geth node
    try {
      const accounts = await web3.eth.getAccounts();
      account = accounts[0];
      document.getElementById('account').innerText = account;

      const balanceWei = await web3.eth.getBalance(account);
      const balance = web3.utils.fromWei(balanceWei, 'ether');
      document.getElementById('balance').innerText = parseFloat(balance).toFixed(2);
    } catch (error) {
      console.error('Error connecting to Geth node:', error);
    }
  } else {
    alert('Web3 wallet or Geth node connection not detected.');
  }
});

// Send funds within blockchain
const sendForm = document.getElementById('sendForm');
sendForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const recipient = document.getElementById('recipient').value;
  const amount = document.getElementById('amount').value;
  const amountWei = web3.utils.toWei(amount, 'ether');

  try {
    const tx = await web3.eth.sendTransaction({
      from: account,
      to: recipient,
      value: amountWei
    });

    document.getElementById('statusMessage').innerText = `Success! TX Hash: ${tx.transactionHash}`;
  } catch (err) {
    document.getElementById('statusMessage').innerText = `Transaction failed: ${err.message}`;
  }
});

// Simulated commercial bank transfer call
async function sendToBankAccount(accountNumber, amountZAR) {
  const response = await fetch("https://api.centralbank.gov.za/treasury/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      fromWallet: account,
      toBankAccount: accountNumber,
      amount: amountZAR
    })
  });

  const result = await response.json();
  console.log(result);
  return result;
}
