const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const Web3Utils = require('web3-utils');
const fs = require('fs');

const mnemonic = fs.readFileSync("../.secret").toString().trim();
const infuraProjectId = fs.readFileSync("../.infura").toString().trim();

const provider = new HDWalletProvider({
  mnemonic: {
    phrase: mnemonic
  },
  providerOrUrl: `https://ropsten.infura.io/v3/${infuraProjectId}`,
});

const web3 = new Web3(provider);

const abi = JSON.parse(fs.readFileSync('./abi/1_guess_the_number.json'));
const contractAddress = '0x79Fa8f31a9C61B42fC867608594Acad711824Da5';

async function main() {
  try {
    let accounts = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(abi, contractAddress);

    const amountToSend = Web3Utils.toWei('1', "ether");
    contract.methods.guess(42).send({ from: accounts[0], value: amountToSend }).then(result => {
      console.log(result);

      contract.methods.isComplete().call().then(console.log);
    }).catch(console.warn);
  }
  catch (ex) {
    console.log(ex);
  }
  finally {
    provider.engine.stop();
  }
}

main();