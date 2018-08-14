var OpenEvents = artifacts.require("OpenEvents");
var StableToken = artifacts.require("StableToken");

module.exports = function(deployer) {
	deployer.deploy(StableToken).then(function() {
		return deployer.deploy(OpenEvents, StableToken.address);
	});
};
