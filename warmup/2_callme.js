const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const Web3Utils = require('web3-utils');
const fs = require('fs');

const mnemonic = fs.readFileSync(".secret").toString().trim();
const infuraProjectId = fs.readFileSync(".infura").toString().trim();

const provider = new HDWalletProvider({
  mnemonic: {
    phrase: mnemonic
  },
  providerOrUrl: `https://ropsten.infura.io/v3/${infuraProjectId}`,
});

const web3 = new Web3(provider);

const abi = [{ "constant": false, "inputs": [], "name": "callme", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "isComplete", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }];
const contractAddress = '0x0Eb4f79af14f59d59E0f8B4980254b43341A7B54';

async function main() {

  try {
    let accounts = await web3.eth.getAccounts();

    // Get account balance
    web3.eth.getBalance(accounts[0], (_, balance) => {
      console.log(Web3Utils.fromWei(balance, 'ether'));
    });

    const contract = new web3.eth.Contract(abi, contractAddress)

    // this won't do since gas will be used
    //contract.methods.callme().call().then(console.log);

    contract.methods.callme().send({ from: accounts[0] }).then(console.log);

    contract.methods.isComplete().call().then(console.log);
  }
  catch (ex) {
    console.log(ex);
  }
  finally {
    provider.engine.stop();
  }
}

main();