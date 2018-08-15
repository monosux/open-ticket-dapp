pragma solidity ^0.4.24;

import './OpenTicket.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'openzeppelin-solidity/contracts/lifecycle/Pausable.sol';
import 'openzeppelin-solidity/contracts/lifecycle/Destructible.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

/**
* @title OpenEvents
* @dev It is a main contract that provides ability to create events, view information about events and buy tickets.
*/
contract OpenEvents is OpenTicket, Pausable, Destructible {
	using SafeMath for uint;

	address tokenAddress;

	struct OpenEvent {
		address owner;
		string name;
		uint time;
		uint price;
		bool token;
		bool limited;
		uint seats;
		uint sold;
		string ipfs;
	}

	OpenEvent[] private openEvents;

	// Mapping from owner to list of owned events IDs.
	mapping(address => uint256[]) private ownedEvents;

	event CreatedEvent(address indexed owner, uint eventId);
	event SoldTicket(address indexed buyer, uint indexed eventId, uint ticketId);

	/**
	* @dev Constructor sets the USD Token address that will be used for buying tickets.
	* @param _token address - The address of the token contract.
	*/
	constructor(address _token) public {
		tokenAddress = _token;
	}

	/**
	* @dev Throws if events time is in the past.
	* @param _time uint - Time of event.
	*/
    modifier goodTime(uint _time) {
        require(_time > now);
        _;
    }

	/**
	* @dev Throws if event does not exist.
	* @param _id uint - Event ID.
	*/
    modifier eventExist(uint _id) {
        require(_id < openEvents.length);
        _;
    }

	/**
	* @dev Function changes the USD Token address.
	* @param _token address - The address of the token contract.
	* @notice Requires that the msg.sender is contract owner.
	*/
	function chengeToken(address _token) public onlyOwner() {
		tokenAddress = _token;
	}

	/**
	* @dev Function creates the event.
	* @param _name string - The name of the event.
	* @param _time uint - The time of the event. Should be in the future.
	* @param _price uint - The ticket price.
	* @param _token bool - If true the price will be in tokens, else the price will be in ethereum.
	* @param _limited bool - If true event has limited seats.
	* @param _seats uint - If event has limited seats, says how much tickets can be sold.
	* @param _ipfs string - The IPFS hash containing additional information about the event.
	* @notice Requires that the events time is in the future.
	* @notice Requires that the contract is not paused.
	*/
	function createEvent(
		string _name,
		uint _time,
		uint _price,
		bool _token,
		bool _limited,
		uint _seats,
		string _ipfs
	)
		goodTime(_time)
		whenNotPaused()
		public
	{
		OpenEvent memory _event = OpenEvent({
			owner: msg.sender,
			name: _name,
			time: _time,
			price: _price,
			token: _token,
			limited: _limited,
			seats: _seats,
			sold: 0,
			ipfs: _ipfs
		});
		uint _eventId = openEvents.push(_event).sub(1);
		ownedEvents[msg.sender].push(_eventId);
		emit CreatedEvent(msg.sender, _eventId);
	}

	/**
	* @dev Function to show all events of the specified address.
	* @param _owner address - The address to query the events of.
	* @return uint[] - Array of events IDs.
	*/
	function eventsOf(address _owner) public view returns(uint[]) {
		return ownedEvents[_owner];
	}

	/**
	* @dev Function to show information about the event.
	* @param _id uint - Event ID.
	* @return name string - The name of the event.
	* @return time uint - The time of the event.
	* @return price uint - The price of the event.
	* @return token bool - If true the price is in tokens, else the price is in ethereum.
	* @return limited bool - If true event has limited seats.
	* @return seats uint - If event has limited seats, show how much tickets can be sold.
	* @return sold uint - Number of sold tickets.
	* @return ipfs string - The IPFS hash containing additional information about event.
	* @return owner address - The owner of the event.
	* @notice Requires that the events exist.
	*/
	function getEvent(uint _id)
		public
		view
		eventExist(_id)
	returns(
		string name,
		uint time,
		uint price,
		bool token,
		bool limited,
		uint seats,
		uint sold,
		string ipfs,
		address owner
	) {
		OpenEvent memory _event = openEvents[_id];
		return(
			_event.name,
			_event.time,
			_event.price,
			_event.token,
			_event.limited,
			_event.seats,
			_event.sold,
			_event.ipfs,
			_event.owner
		);
	}

	/**
	* @dev Function returns number of all events.
	* @return uint - Number of events.
	*/
	function getEventsCount() public view returns(uint) {
		return openEvents.length;
	}

	/**
	* @dev Function to buy ticket to specific event.
	* @param _eventId uint - The ID of event.
	* @notice Requires that the events exist.
	* @notice Requires that the events time is in the future.
	* @notice Requires that the contract is not paused.
	* @notice Reverts if event has limited seats and an amount of sold tickets bigger then the number of seats.
	* @notice Reverts if ticket price is in ethereum and msg.value smaller then the ticket price.
	* @notice Reverts if ticket price is in tokens and token.transferFrom() does not return true.
	*/
	function buyTicket(uint _eventId)
		public
		payable
		eventExist(_eventId)
		goodTime(openEvents[_eventId].time)
		whenNotPaused()
	{
		OpenEvent memory _event = openEvents[_eventId];

		if (_event.limited) require(_event.seats > _event.sold);

		if (!_event.token) {
			require(msg.value >= _event.price);
			_event.owner.transfer(_event.price);
		} else {
			if (!ERC20(tokenAddress).transferFrom(msg.sender, _event.owner, _event.price)) {
				revert();
			}
		}

		uint seat = _event.sold.add(1);
		openEvents[_eventId].sold = seat;

		Ticket memory _ticket = Ticket({
			event_id: _eventId,
			seat: seat
		});

		uint _ticketId = tickets.push(_ticket).sub(1);
        _mint(msg.sender, _ticketId);
		emit SoldTicket(msg.sender, _eventId, _ticketId);
	}
}
