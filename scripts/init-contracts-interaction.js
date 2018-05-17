var Genbby_Token = artifacts.require('GenbbyToken');
var Crowdsale_Phase_1 = artifacts.require('CrowdsalePhase1');
var Airdrop = artifacts.require('Airdrop');
var Versus_Beta = artifacts.require('VersusBeta');

module.exports = async function callback() {

    const token = await Genbby_Token.deployed();
    const crowdsale = await Crowdsale_Phase_1.deployed();
    const airdrop = await Airdrop.deployed();
    const versus_beta = await Versus_Beta.deployed();
    const owner = web3.eth.coinbase;

    await token.setMintAgent(owner, true, { from : owner });
    await token.setMintAgent(crowdsale.address, true, { from : owner });
    await token.setMintAgent(airdrop.address, true, { from: owner })
    await token.setTrustedContract(versus_beta.address, true, { from : owner });
    await token.setTrustedContract(airdrop.address, true, { from: owner });
    await crowdsale.setToken(token.address, { from : owner });
    await airdrop.setToken(token.address, { from: owner });
    await versus_beta.setToken(token.address);

    console.log('Successfully done');

}
