# Genbby Smart Contracts

Please, do not send ETH directly to any Genbby smart contract address. Instead, use any method described in our [official page](http://genbby.com/ "Genbby")

You can see the deployed contracts here:
* [Genbby Token](https://etherscan.io/address/0x0906896a7ecfc7a3309e88ece89d6bb761380746)
* [Crowdsale](https://etherscan.io/address/0x979b0e3110a54e2c69265a27fc3afbc5269ff13e)
* [Airdrop](https://etherscan.io/address/0x4d4377ef856e89cbf76f8e994ab3065445d82f4f)

### Requisites
- [NPM](https://www.npmjs.com/get-npm)
- [Truffle](http://truffleframework.com/docs/getting_started/installation)
- [TestRPC](https://www.npmjs.com/package/ethereumjs-testrpc)

Clone the repository, open a terminal and go to where you've cloned the repository an run the following commands:

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
truffle test ./test/Airdrop.js --network testrpc
truffle test ./test/Test-New-Token.js --network testrpc
truffle test ./test/Genbby-Cash.js --network testrpc
```

### To init the interaction between the token and the crowdsale
```bash
truffle exec ./scripts/init-contracts-interaction.js --network testrpc
```

### To get the addresses of the deployed contracts
```bash
truffle exec ./scripts/get-contracts-deployed-addresses.js --network testrpc
```

Moreover, if you want to simulate interactions with our contracts, you can copy them in [Remix](https://remix.ethereum.org "Remix") and easily interact with them
