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

const abi = JSON.parse(fs.readFileSync('./abi/2_guess_the_secret_number.json'));
const contractAddress = '0xe703C3D63d643339edCC878b7f376C0Fb1FB3047';

async function main() {
  try {
    const accounts = await web3.eth.getAccounts();

    for (let number = 0; number < 256; number++) {
      if (web3.utils.soliditySha3({ type: 'uint8', value: number }) == '0xdb81b4d58595fbbbb592d3661a34cdca14d7ab379441400cbfa1b78bc447c365') {
        // solution: 170
        console.log(`Solution is ${number}`);

        const contract = new web3.eth.Contract(abi, contractAddress);

        const amountToSend = Web3Utils.toWei('1', "ether");
        contract.methods.guess(number).send({ from: accounts[0], value: amountToSend }).then(result => {
          console.log(result);

          contract.methods.isComplete().call().then(console.log);
        }).catch(console.warn);
      }
    }
  }
  catch (ex) {
    console.log(ex);
  }
  finally {
    provider.engine.stop();
  }
}

main();