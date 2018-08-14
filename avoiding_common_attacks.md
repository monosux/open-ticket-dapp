# Avoiding Common Attacks

To avoid potential contract vulnerabilities this project uses open sourced and well-known contracts by **OpenZeppelin**. For example: ERC20, ERC721, SafeMath etc.

* To avoid *Race Conditions* attacks contract uses transfer() function to send ethereum. It protects from fallback functions. Also all internal work done only after transfer() function done.

* To avoid *Integer Overflow and Underflow* attacks contract uses SafeMath library for all calculations.

