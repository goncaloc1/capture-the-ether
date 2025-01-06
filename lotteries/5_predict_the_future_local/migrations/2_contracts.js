var ProxyContract = artifacts.require("ProxyContract");
var PredictTheFutureChallenge = artifacts.require("PredictTheFutureChallenge");

module.exports = function (deployer, network, accounts) {
  deployer.deploy(PredictTheFutureChallenge, { from: accounts[0], value: "1000000000000000000" });
  deployer.deploy(ProxyContract);
};