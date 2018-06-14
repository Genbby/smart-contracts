var Genbby_Token = artifacts.require('GenbbyToken');
var Crowdsale_Phase_1 = artifacts.require('CrowdsalePhase1');
var Airdrop = artifacts.require('Airdrop');
var Test_New_Token = artifacts.require('TestNewToken');
var Genbby_Cash = artifacts.require('GenbbyCash');

module.exports = function(deployer, network) {
    if (network == 'testrpc') {
        deployer.deploy(Genbby_Token);
        deployer.deploy(Crowdsale_Phase_1, Date.now() / 1000);
        deployer.deploy(Airdrop);
        deployer.deploy(Test_New_Token);
        deployer.deploy(Genbby_Cash);
    }
    else if (network == 'testnet') {
        deployer.deploy(Genbby_Token);
        deployer.deploy(Crowdsale_Phase_1, Date.now() / 1000);
    }
    else if (network == 'live') {
        deployer.deploy(Genbby_Token);
        deployer.deploy(Crowdsale_Phase_1, Date.UTC(2018, 4, 19, 13, 0, 0) / 1000);
    }
};
