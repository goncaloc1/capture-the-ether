var ProxyContract = artifacts.require("ProxyContract");
var GuessTheNewNumberChallenge = artifacts.require("GuessTheNewNumberChallenge");

module.exports = function (deployer, network, accounts) {
  deployer.deploy(GuessTheNewNumberChallenge, { from: accounts[0], value: "1000000000000000000" });
  deployer.deploy(ProxyContract);
};