var ProxyContract = artifacts.require("ProxyContract");

module.exports = function (deployer, network, accounts) {
  deployer.deploy(ProxyContract);
};