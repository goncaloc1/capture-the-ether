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

const abi = JSON.parse(fs.readFileSync("./abi/3_guess_the_random_number.json"));
const contractAddress = "0xc5091c2A0BAfb9FeB313e0e654BcF8B302Fd5531";
const contractTransactionHash =
  "0x0d5e155a10747f61899351f01e312e23699aad89499fc94ed8214c9c78de949f";

async function main() {
  try {
    const accounts = await web3.eth.getAccounts();

    const { blockNumber } = await web3.eth.getTransaction(
      contractTransactionHash
    );
    const { timestamp } = await web3.eth.getBlock(blockNumber);
    const previousBlockHash = (await web3.eth.getBlock(blockNumber - 1)).hash;

    /**
     * Will calculate the sha3 of given input parameters in the same way solidity would.
     * This means arguments will be ABI converted and tightly packed before being hashed.
     */
    const keccak256Result = web3.utils.soliditySha3(
      previousBlockHash,
      timestamp
    );

    /**
     * In Solidity we have: `uint8(keccak256(block.blockhash(block.number - 1), now))`
     * We have keccak256Result which is a hex string. The uint8 conversion is in practice
     * the last 8 bits of that string converted to decimal.
     */
    const uint8Hex = keccak256Result.substr(keccak256Result.length - 2);
    const uint8Dec = parseInt(uint8Hex, 16);

    /**
     * Alternative solution: `answer` variable in solidity contract is public therefore
     * we could inspect the contract state changes in etherscan (Transaction details -> State tab)
     */

    // solution: 69
    console.log(`Solution is ${uint8Dec}`);

    for (let number = 0; number < 256; number++) {
      if (number == uint8Dec) {
        const contract = new web3.eth.Contract(abi, contractAddress);

        const amountToSend = Web3Utils.toWei("1", "ether");
        contract.methods
          .guess(number)
          .send({ from: accounts[0], value: amountToSend })
          .then((result) => {
            console.log(result);

            contract.methods.isComplete().call().then(console.log);
          })
          .catch(console.warn);
      }
    }
  } catch (ex) {
    console.log(ex);
  } finally {
    provider.engine.stop();
  }
}

main();
