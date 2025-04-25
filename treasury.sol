

// File: Treasury.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Treasury {
    address public admin;
    uint256 public totalBalance;

    event Transferred(address indexed to, uint256 amount, string memo);

    constructor() {
        admin = msg.sender;
        totalBalance = 100_000_000_000 ether; // 100 Billion ZAR
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    function getBalance() public view returns (uint256) {
        return totalBalance;
    }

    function transfer(address to, uint256 amount, string memory memo) public onlyAdmin {
        require(amount <= totalBalance, "Insufficient funds");
        totalBalance -= amount;
        payable(to).transfer(amount);
        emit Transferred(to, amount, memo);
    }

    receive() external payable {
        totalBalance += msg.value;
    }
}

const CONTRACT_ABI = [/* ... */];
const CONTRACT_ADDRESS = "0x...";

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
  } else {
    alert('Web3 wallet not detected. Please install MetaMask.');
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