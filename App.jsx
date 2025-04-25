

import { ethers } from 'ethers';
import TreasuryABI from './TreasuryABI.json';

const treasuryContractAddress = "0xYourDeployedContractAddress";

export default function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const prov = new ethers.providers.Web3Provider(window.ethereum);
        const accs = await prov.send("eth_requestAccounts", []);
        const signer = prov.getSigner();
        const contract = new ethers.Contract(treasuryContractAddress, TreasuryABI, signer);

        setProvider(prov);
        setSigner(signer);
        setContract(contract);
        setAccount(accs[0]);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
      if (contract && account) {
        const bal = await contract.getBalance();
        setBalance(ethers.utils.formatEther(bal));
      }
    };
    fetchBalance();
  }, [contract, account]);

  const handleTransfer = async () => {
    try {
      const tx = await contract.transfer(recipient, ethers.utils.parseEther(amount), memo);
      await tx.wait();
      setStatus("Transaction successful!");
      setRecipient('');
      setAmount('');
      setMemo('');
      const bal = await contract.getBalance();
      setBalance(ethers.utils.formatEther(bal));
    } catch (err) {
      setStatus("Transaction failed: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-800">National Treasury DApp Portal</h1>
        <p className="mb-4 text-gray-700">Connected account: <strong>{account}</strong></p>
        <p className="mb-4 text-lg">Balance: <strong>{balance} ZAR</strong></p>
        <input type="text" value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="Recipient address" className="w-full mb-4 p-2 border rounded" />
        <input type="text" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount (in ZAR)" className="w-full mb-4 p-2 border rounded" />
        <input type="text" value={memo} onChange={e => setMemo(e.target.value)} placeholder="Transaction Memo" className="w-full mb-4 p-2 border rounded" />
        <button onClick={handleTransfer} className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900 w-full">Send Funds</button>
        {status && <p className="mt-4 text-center text-sm text-green-700">{status}</p>}
      </div>
    </div>
  );
}


