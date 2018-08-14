var HDWalletProvider = require("truffle-hdwallet-provider");
var config = require("./config.json");

module.exports = {
	networks: {
		development: {
			host: "localhost",
			port: 8545,
			network_id: "*"
		},
		rinkeby: {
			provider: function () {
				return new HDWalletProvider(config.wallet, "https://rinkeby.infura.io/" + config.infura)
			},
			network_id: 4,
			gas: 7000000,
			solc: {
				optimizer: {
					enabled: true,
					runs: 200
				}
			}
		}
	}
};
