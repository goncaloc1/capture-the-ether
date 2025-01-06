/**
 * SOLUTION
 *
 * The block hashes are not available for all blocks for scability reasons. You can only
 * access the hashes of the most recent 256 blocks, all other values will be zero.
 *
 * Just used this code to prove hash would really be zero after waiting 256 blocks.
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

const abi = JSON.parse(
  fs.readFileSync("./6_predict_the_block_hash_local/build/contracts/TestOldHashContract.json")
).abi;

// replace contract addresses accordingly after running `truffle migrate --reset`
const testContractAddress = "0x43F57C80b1A19452a4AFf8CA57Fa21E68AA9485E";

async function main() {
  try {
    const latestBlockNumber = await web3.eth.getBlockNumber();

    const proxyContract = new web3.eth.Contract(abi, testContractAddress);
    proxyContract.methods
      .test(latestBlockNumber)
      .call()
      .then(console.log);

    proxyContract.methods
      .test(latestBlockNumber - 256)
      .call()
      .then(console.log);

    proxyContract.methods
      .test(latestBlockNumber - 257)
      .call()
      .then(console.log);

  } catch (ex) {
    console.warn(ex);
  } finally {
    provider.engine.stop();
  }
}

main();
