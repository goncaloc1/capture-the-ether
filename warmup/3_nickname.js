const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
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

const abi = JSON.parse(fs.readFileSync('3_nickname.json'));
const contractAddress = '0x71c46Ed333C35e4E6c62D32dc7C8F00D125b4fee';

async function main() {
  try {
    let accounts = await web3.eth.getAccounts();

    const contract = new web3.eth.Contract(abi, contractAddress);

    const nickname = 'paleblueeyes';
    const nicknameHex = web3.utils.asciiToHex(nickname);

    // transaction hash was: 0xd7d59537523ec55b3536b2043b99fabcf55795aefbc9b73aa2aad949e883cd68
    contract.methods.setNickname(nicknameHex).send({ from: accounts[0] }).then(console.log).catch(console.warn);
  }
  catch (ex) {
    console.log(ex);
  }
  finally {
    provider.engine.stop();
  }
}

main();