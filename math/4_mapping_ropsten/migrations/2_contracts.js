var MappingChallenge = artifacts.require("MappingChallenge");

module.exports = function (deployer, network, accounts) {
  deployer.deploy(MappingChallenge);
};