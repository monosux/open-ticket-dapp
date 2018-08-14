const StableToken = artifacts.require("StableToken");

contract('StableToken', function(accounts) {
	it('User should has 0 balance at beginning', async () => {
		let instance = await StableToken.deployed();
		let balance = await instance.balanceOf(accounts[0]);
		assert.equal(balance.toNumber(), 0, 'Balance greater then 0');
	});

	it('Should mint tokens', async () => {
		let instance = await StableToken.deployed();
		await instance.mint({from: accounts[0]});
		let balance = await instance.balanceOf(accounts[0]);
		let zero_balance = await instance.balanceOf(accounts[1]);

		assert.equal(balance.toNumber(), 100000000000000000000, 'Balance is wrong');
		assert.equal(zero_balance.toNumber(), 0, 'Balance is wrong');
	});

	it('Should transfer tokens', async () => {
		let instance = await StableToken.deployed();
		await instance.transfer(accounts[1], 100000000000000000000, {from: accounts[0]});

		let balance_old = await instance.balanceOf(accounts[0]);
		let balance_new = await instance.balanceOf(accounts[1]);

		assert.equal(balance_old.toNumber(), 0, 'Balance is wrong');
		assert.equal(balance_new.toNumber(), 100000000000000000000, 'Balance is wrong');
	});

	it('Should not transfer tokens', async () => {
		let instance = await StableToken.deployed();

		let err = null;

		try {
			await instance.transfer(accounts[1], 100000000000000000000, {from: accounts[0]});
		} catch (error) {
			err = error;
		}

		assert.ok(err instanceof Error, 'Token transfered');
	});

	it('Should approve and transfer tokens', async () => {
		let instance = await StableToken.deployed();

		await instance.approve(accounts[2], 1, {from: accounts[1]});
		await instance.transferFrom(accounts[1], accounts[3], 1, {from: accounts[2]});

		let balance_init = await instance.balanceOf(accounts[1]);
		let balance_middle = await instance.balanceOf(accounts[2]);
		let balance_final = await instance.balanceOf(accounts[3]);

		assert.equal(balance_middle.toNumber(), 0, 'Balance is wrong');
		assert.equal(balance_final.toNumber(), 1, 'Balance is wrong');
		assert.equal(balance_init.toNumber(), (100000000000000000000 - 1), 'Balance is wrong');
	});
});
