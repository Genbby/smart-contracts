# Genbby Smart Contracts

Please, do not send ETH directly to any Genbby smart contract address. Instead, use any method described in our [official page](http://genbby.com/ "Genbby")

### Download
- [NPM](https://www.npmjs.com/get-npm)

Clone the repository  
Open a terminal, go to where you've cloned the repository an run the following commands:

### Instalations (just the first time you use it)
```bash
npm install
```


### Running a private test blockchain (keep it running for the following commands)
```bash
testrpc
```

In another terminal, go the location where you've clone this repository and run the following commands:

### To compile the contracts
```bash
truffle compile
```

### To migrate the contracts
```bash
truffle migrate --network testrpc
```

### To run all the tests
```bash
truffle test --network testrpc
```

### To run an specific test
```bash
truffle test ./test/Genbby-Token.js --network testrpc
truffle test ./test/Crowdsale-Phase-1.js --network testrpc
truffle test ./test/Test-New-Token.js --network testrpc
truffle test ./test/Test-Buy-Games.js --network testrpc
```

### To get the addresses of the deployed contracts
```bash
truffle exec ./scripts/get-contracts-deployed-addresses.js --network testrpc
```

### To init the interaction between the token and the crowdsale
```bash
truffle exec ./scripts/init-contracts-interaction.js --network testrpc
```

Moreover, if you want to simulate interactions with our contracts, you can copy them in [Remix](https://remix.ethereum.org "Remix") and easily interact with them
