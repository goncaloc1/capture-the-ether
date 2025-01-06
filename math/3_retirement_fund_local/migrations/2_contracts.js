var ProxyContract = artifacts.require("ProxyContract");
var RetirementFundChallenge = artifacts.require("RetirementFundChallenge");

module.exports = function (deployer, network, accounts) {
  deployer.deploy(RetirementFundChallenge, accounts[1], { from: accounts[0], value: "1000000000000000000" });
  deployer.deploy(ProxyContract, { from: accounts[1], value: "1000" });
};