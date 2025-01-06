var Test = artifacts.require("Test");

module.exports = function (deployer, network, accounts) {
  deployer.deploy(Test);
};