const chai = require('chai');
const { ethers } = require("hardhat");
const { solidity } = require("ethereum-waffle");

chai.use(solidity);
const { expect } = chai;

describe("PayFunctionTest", function () {
  let owner
  let other_addr
  let demo

  //creating 2 account and var payments, also a "demo" to use a contract as variable

  //kajdii test budet otdelnim contractom and with different txid
  beforeEach(async function() { //proverka pered kajdim testom
    [owner, other_addr] = await ethers.getSigners() //polu4aem signerov, to est' adresses/wallets

    const PayFunctionTest = await ethers.getContractFactory("PayFunctionTest", owner) //nazvanie contracta kotorii budet zaprinten
    demo = await PayFunctionTest.deploy() //this variable to use contract as a simple variable
    await demo.deployed()
    console.log(demo.address) //printing the adress of smartcontract
  })

  //now I'm writing simulation of sendMoney() to already deployed contract for simplicity and testing
  async function sendMoney(sender) {
    const amount = 1000
    const txData = {
      to: demo.address,
      value: amount
    }

    const tx = await sender.sendTransaction(txData);
    await tx.wait();
    return [tx, amount]
  }

  //checking deployment
  it("should be deployed", async function() {
    console.log("success!")
  })

  it("should send money", async function() {
    const [sendMoneyTx, amount] = await sendMoney(other_addr)
    console.log(sendMoneyTx)

    //checking if balance of the contract was changed (Waffle Code)
    await expect(() => sendMoneyTx)
      .to.changeEtherBalance(demo, amount)

    //checking if our Event works properly (all the inputs are correct)
    const timestamp = (
      await ethers.provider.getBlock(sendMoneyTx.blockNumber) //I get current block here at the moment of trans
    ).timestamp

    await expect(sendMoneyTx)
      .to.emit(demo, "Paid")
      .withArgs(other_addr.address, amount, timestamp) //timestamp I got before
  })
  
  //checking if balances are changing after transactions
  it("should allow owner to withdraw funds", async function() {
    const [_, amount] =  await sendMoney(other_addr) //jdu poka wallet2 will send funds, _ - tx and it doesn't matter

    const tx = await demo.withdraw(owner.address) //withdrawal using owner's address

    await expect(() => tx)
      .to.changeEtherBalances([demo, owner], [-amount, +amount])
    //here I expect changes in demo.address/owner addresses and the amounts (1. -amount, 2. + amount)
  })

  it("should only owner to withdraw funds", async function() {

    await sendMoney(other_addr) //jdu poka wallet2 will send funds, _ - tx and it doesn't matter

    await expect (
      //this thing with connect is saying that i'm using wallet2 (without it by default I will use
      //wallet 1 (creator of contract) and I will not able to check if this test is working)
      demo.connect(other_addr).withdraw(other_addr.address)
    ).to.be.revertedWith("youre not a owner!!")
  })

})