
window.addEventListener('load', async () => {
  if (window.ethereum) {
    window.web3 = new Web3(ethereum);
    try {
      await ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      document.getElementById('account').innerText = account;

      // Simulated balance fetch
      const balance = web3.utils.fromWei('100000000000000000000000000000', 'ether');
      document.getElementById('balance').innerText = balance;

      // Handle form submission
      document.getElementById('sendForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const recipient = document.getElementById('recipient').value;
        const amount = document.getElementById('amount').value;
        document.getElementById('statusMessage').innerText = 'Sending...';

        try {
          await web3.eth.sendTransaction({
            from: account,
            to: recipient,
            value: web3.utils.toWei(amount, 'ether')
          });
          document.getElementById('statusMessage').innerText = 'Transaction successful.';
        } catch (error) {
          console.error(error);
          document.getElementById('statusMessage').innerText = 'Transaction failed.';
        }
      });
    } catch (error) {
      console.error('User denied account access');
    }
  } else {
    alert('Please install MetaMask!');
  }
});
