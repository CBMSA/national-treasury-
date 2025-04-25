

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

