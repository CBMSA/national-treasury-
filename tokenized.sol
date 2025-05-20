// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenizedBond is ERC20, Ownable {
    address public issuer;
    uint256 public maturityDate;
    uint256 public interestRate; // e.g., 5 means 5%
    mapping(address => uint256) public lastClaim;

    constructor(address _issuer, uint256 _maturityDate, uint256 _interestRate) ERC20("SADC Tokenized Bond", "SADCBOND") {
        issuer = _issuer;
        maturityDate = _maturityDate;
        interestRate = _interestRate;
    }

    modifier onlyIssuer() {
        require(msg.sender == issuer, "Only issuer can perform this action");
        _;
    }

    function issue(address to, uint256 amount) external onlyIssuer {
        _mint(to, amount * 10 ** decimals());
        lastClaim[to] = block.timestamp;
    }

    function burn(address from, uint256 amount) external onlyIssuer {
        _burn(from, amount * 10 ** decimals());
    }

    function updateIssuer(address newIssuer) external onlyOwner {
        issuer = newIssuer;
    }

    function claimInterest() external {
        require(block.timestamp < maturityDate, "Bond has matured");
        uint256 balance = balanceOf(msg.sender);
        require(balance > 0, "No bonds held");

        uint256 last = lastClaim[msg.sender];
        require(last < block.timestamp, "Already claimed");

        uint256 duration = block.timestamp - last;
        uint256 yearlyInterest = (balance * interestRate) / 100;
        uint256 interest = (yearlyInterest * duration) / 365 days;

        lastClaim[msg.sender] = block.timestamp;
        payable(msg.sender).transfer(interest);
    }

    function redeem() external {
        require(block.timestamp >= maturityDate, "Bond not yet matured");
        uint256 balance = balanceOf(msg.sender);
        require(balance > 0, "No bonds to redeem");
        _burn(msg.sender, balance);
        payable(msg.sender).transfer(balance);
    }

    receive() external payable {}
}