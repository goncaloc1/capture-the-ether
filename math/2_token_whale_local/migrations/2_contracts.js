var TokenWhaleChallenge = artifacts.require("TokenWhaleChallenge");

module.exports = function (deployer, network, accounts) {
  deployer.deploy(TokenWhaleChallenge, accounts[0]);
};