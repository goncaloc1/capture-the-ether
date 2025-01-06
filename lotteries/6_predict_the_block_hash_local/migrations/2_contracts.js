var TestOldHashContract = artifacts.require("TestOldHashContract");

module.exports = function (deployer, network, accounts) {
  deployer.deploy(TestOldHashContract);
};