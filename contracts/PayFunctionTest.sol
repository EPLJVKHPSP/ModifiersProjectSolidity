// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract PayFunctionTest {

    address owner;
    event Paid(address indexed _from, uint _amout, uint _timestamp);

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {
        pay();
    }

    function pay() public payable {
        emit Paid(msg.sender, msg.value, block.timestamp);
    }

    modifier onlyOwner(address _to) {
        require (msg.sender == owner, "you're not a owner!");
        require (_to != address(0), "incorrect address!");
        _;
    }

    function withdraw(address payable _to) external onlyOwner(_to) {
        _to.transfer(address(this).balance);
    }
}