var Genbby_Token = artifacts.require('GenbbyToken');
var Crowdsale_Phase_1 = artifacts.require('CrowdsalePhase1');
var Test_New_Token = artifacts.require('TestNewToken');
var Test_Buy_Games = artifacts.require('TestBuyGames');

module.exports = function(deployer, network) {
    if (network == 'testrpc') {
        deployer.deploy(Genbby_Token);
        deployer.deploy(Crowdsale_Phase_1, Date.now() / 1000);
        deployer.deploy(Test_New_Token);
        deployer.deploy(Test_Buy_Games);
    }
    else if (network == 'live') {
        deployer.deploy(Genbby_Token);
        deployer.deploy(Crowdsale_Phase_1, Date.UTC(2018, 1, 18) / 1000);
    }
};