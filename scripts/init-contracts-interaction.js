var Genbby_Token = artifacts.require('GenbbyToken');
var Crowdsale_Phase_1 = artifacts.require('CrowdsalePhase1');

module.exports = async function callback() {

    const token = await Genbby_Token.deployed();
    const crowdsale = await Crowdsale_Phase_1.deployed();
    const owner = web3.eth.coinbase;

    await token.setMintAgent(owner, true, { from : owner });
    await token.setMintAgent(crowdsale.address, true, { from : owner });
    await crowdsale.setToken(token.address, { from : owner });

    console.log('Successfully done');

}