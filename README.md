# 🎫 OpenTicket DApp

Demo running on the Rinkeby network: [OpenTicket DApp](https://monosux.github.io/open-ticket-dapp/)

## What is it?
OpenTicket it is a dApp based on Ethereum Blockchain that provides an ability to create events and sell tickets for events as ERC721 tokens.

## Use Cases

### Event creator.
A user can create an event: set up a title, description, image, date, price (The price can be set in Ethereum or in USD tokens), availability of seats (limited seats or not, if limited - the number of seats). When the event is created it is showed in the list of events. Other users can buy tickets for this event. All funds from the ticket's sale go to the event creator directly.

### Ticket buyer
A user can see the list of events and can choose and buy a ticket for it. The user can pay by Ethereum or USD tokens depends on event's settings. The user can see the list of all its tickets. The user can send its ticket to another user. All tickets are ERC721 tokens that means that users can do any action available for these type of tokens.

## USD Token
DApp uses test tokens which user can receive on a special page.

## Setup

1. Install packages.
```javascript
yarn install
// or
npm install
```

2. Run the development blockchain.
```javascript
ganache-cli -b 5
```

3. Compile and migrate contracts.
```javascript
truffle compile
truffle migrate
```

4. Run app.
```javascript
yarn run start
// or
npm start
```
