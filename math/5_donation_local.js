/**
 * INSTRUCTIONS
 *
 * 1. Used Remix on this one, quicker.
 *
 * SOLUTION
 *
 * The code line `Donation donation` has a problem. When defining structs one should always
 * define the location, either memory or storage. When omitted, storage is assumed. Therefore
 * we're creating a pointer to memory. Whatever we pass as etherAmount will be in fact saved
 * to slot 1. slot 0 will have the timestamp.
 * `scale` is not being calculated correctly either.
 * Basically we can pass out our address as parameter to donate and transaction value:
 * const donateScale = 10n ** 18n * 10n ** 18n;
 * BigInt('0x98be944f0CCBeDEC9D41a1F7F9f99B032fE834bb') / donateScale = 872016658270
 *
 * If my address is '0x98be944f0CCBeDEC9D41a1F7F9f99B032fE834bb' value will be 872016658270
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


async function main() {
  try {


    console.log(10 ** 18);
    console.log(BigInt('0x98be944f0CCBeDEC9D41a1F7F9f99B032fE834bb'));
    console.log(872016658270);


    const donateScale = 10n ** 18n * 10n ** 18n;
    console.log(BigInt('0x98be944f0CCBeDEC9D41a1F7F9f99B032fE834bb') / donateScale)

  } catch (ex) {
    console.log(ex);
  } finally {
    provider.engine.stop();
  }
}

main();
