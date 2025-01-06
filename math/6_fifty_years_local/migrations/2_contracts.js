var FiftyYearsChallenge = artifacts.require("FiftyYearsChallenge");
var ProxyContract = artifacts.require("ProxyContract");

module.exports = function (deployer, network, accounts) {
  deployer.deploy(FiftyYearsChallenge, accounts[0], { from: accounts[0], value: "1000000000000000000" });
  deployer.deploy(ProxyContract, { from: accounts[1], value: "2" });
};