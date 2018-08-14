const OpenEvents = artifacts.require("OpenEvents");

contract('OpenEvents', function(accounts) {
	const eventTemplate = {
		name: "Test Event",
		time: new Date() / 1000 | 0,
		price: 1,
		token: false,
		limited: false,
		sold: 0,
		ipfs: "ipfs"
	}

	it('Should create an event', async () => {
		let instance = await OpenEvents.deployed();

		await instance.createEvent(
			eventTemplate.name,
			(eventTemplate.time + 100000),
			eventTemplate.price,
			eventTemplate.token,
			eventTemplate.limited,
			eventTemplate.sold,
			eventTemplate.ipfs,
			{from: accounts[0]}
		);

		let events = await instance.eventsOf(accounts[0]);
		let events_count = await instance.getEventsCount();
		let event = await instance.getEvent(events[0]);

		assert.equal(event[0], eventTemplate.name, 'Event has a wrong name');
		assert.equal(events_count.toNumber(), 1, 'Events have a wrong count');
		assert.equal(event[8], accounts[0], 'Event has a wrong owner');
	});

	it('Should not create an event because of the time', async () => {
		let instance = await OpenEvents.deployed();

		let err = null;

		try {
			await instance.createEvent(
				eventTemplate.name,
				(eventTemplate.time - 100000),
				eventTemplate.price,
				eventTemplate.token,
				eventTemplate.limited,
				eventTemplate.sold,
				eventTemplate.ipfs,
				{from: accounts[0]}
			);
		} catch (error) {
			err = error;
		}

		assert.ok(err instanceof Error, 'Event created');
	});

	it('Should not return an event', async () => {
		let instance = await OpenEvents.deployed();

		let err = null;

		try {
			await instance.getEvent(1);
		} catch (error) {
			err = error;
		}

		assert.ok(err instanceof Error, 'Event found');
	});

	it('Should return an event', async () => {
		let instance = await OpenEvents.deployed();

		await instance.createEvent(
			eventTemplate.name,
			(eventTemplate.time + 100000),
			(eventTemplate.price * 2),
			eventTemplate.token,
			eventTemplate.limited,
			eventTemplate.sold,
			eventTemplate.ipfs,
			{from: accounts[0]}
		);

		let event = await instance.getEvent(1);

		assert.equal(event[0], eventTemplate.name, 'Event has a wrong name');
	});

	it('Should buy a ticket', async () => {
		let instance = await OpenEvents.deployed();

		await instance.buyTicket(1, {value: (eventTemplate.price * 2), from: accounts[1]});
		let event = await instance.getEvent(1);
		let tickets = await instance.ticketsOf(accounts[1]);
		let ticket = await instance.getTicket(tickets[0]);

		assert.equal(event[6].toNumber(), 1, 'Event has a wrong amount of sold tickets');
		assert.equal(ticket[0].toNumber(), 1, 'Ticket has a wrong event ID');
	});

	it('Should not buy a ticket because of the price', async () => {
		let instance = await OpenEvents.deployed();

		let err = null;

		try {
			await instance.buyTicket(1, {value: eventTemplate.price, from: accounts[1]});
		} catch (error) {
			err = error;
		}

		assert.ok(err instanceof Error, 'Ticket bought');
	});

	it('Should send a ticket', async () => {
		let instance = await OpenEvents.deployed();

		await instance.safeTransferFrom(accounts[1], accounts[2], 0, {from: accounts[1]});
		let tickets_old_user = await instance.ticketsOf(accounts[1]);
		let tickets_new_user = await instance.ticketsOf(accounts[2]);

		assert.equal(tickets_old_user.length, 0, 'Sender has more then 0 tickets');
		assert.equal(tickets_new_user.length, 1, 'Recipient has less then 1 tickets');
	});

	it('Should not send a ticket', async () => {
		let instance = await OpenEvents.deployed();

		let err = null;

		try {
			await instance.safeTransferFrom(accounts[1], accounts[2], 0, {from: accounts[1]});
		} catch (error) {
			err = error;
		}

		assert.ok(err instanceof Error, 'Ticket send');
	});

});

