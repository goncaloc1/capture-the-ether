var SimpleERC223Token = artifacts.require("SimpleERC223Token");
var TokenBankChallenge = artifacts.require("TokenBankChallenge");

module.exports = function (deployer, network, accounts) {
  deployer.deploy(SimpleERC223Token);
  deployer.deploy(TokenBankChallenge, accounts[1], { from: accounts[0] });
};