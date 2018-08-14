pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol';

/**
* @title StableToken
* @dev It is a basic ERC20 Token with unlimited mint() function.
*/
contract StableToken is StandardToken {
    string public constant name = "Stable Token USD";
    string public constant symbol = "STUSD";
    uint8 public constant decimals = 18;

	event Mint(address indexed to, uint256 amount);

	/**
	* @dev Function to mint new tokens to msg.sender.
	* @return bool - Return true if successful.
	*/
	function mint() public returns(bool) {
		uint amount = 100000000000000000000;
		totalSupply_ = totalSupply_.add(amount);
		balances[msg.sender] = balances[msg.sender].add(amount);
		emit Mint(msg.sender, amount);
		emit Transfer(address(0), msg.sender, amount);
		return true;
	}
}
