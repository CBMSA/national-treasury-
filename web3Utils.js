const Web3 = require('web3');

// Replace <geth-node-ip> with your Geth node's IP or hostname
const web3 = new Web3('http://<geth-node-ip>:8545');

// Get the latest block number
async function getLatestBlock() {
  try {
    return await web3.eth.getBlockNumber();
  } catch (err) {
    throw new Error(`Failed to fetch latest block: ${err.message}`);
  }
}

// Get Ethereum balance of a wallet
async function getEthBalance(address) {
  try {
    const balance = await web3.eth.getBalance(address);
    return web3.utils.fromWei(balance, 'ether'); // Convert Wei to Ether
  } catch (err) {
    throw new Error(`Failed to fetch balance for address ${address}: ${err.message}`);
  }
}

// Send an ETH transaction
async function sendEth(from, to, amount, privateKey) {
  try {
    const amountInWei = web3.utils.toWei(amount.toString(), 'ether');

    // Create and sign the transaction
    const tx = {
      from,
      to,
      value: amountInWei,
      gas: 21000, // Standard gas limit for ETH transfer
    };
    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);

    // Send the transaction
    return await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  } catch (err) {
    throw new Error(`Failed to send ETH from ${from} to ${to}: ${err.message}`);
  }
}

module.exports = {
  getLatestBlock,
  getEthBalance,
  sendEth,
};