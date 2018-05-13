const Genbby_Token = artifacts.require('GenbbyToken');
const Crowdsale_Phase_1 = artifacts.require('CrowdsalePhase1');
const BigNumber = web3.BigNumber;

/**
 * Return the number of seconds in a a given number of days
 */
days = function(number_days) {
    return number_days * 24 * 60 * 60;
}

contract('Crowdsale Phase 1', function(accounts) {

    it ('should verify correct ownership functions', async function() {

        const crowdsale = await Crowdsale_Phase_1.new(Date.now() / 1000);

        const owner = accounts[0];
        const actual_owner = await crowdsale.owner.call();
        assert.equal(actual_owner, owner, 'Ownership not properly assigned');

        const new_owner = accounts[1];
        await crowdsale.transferOwnership(new_owner, { from : owner });
        const actual_new_owner = await crowdsale.owner.call();
        assert.equal(actual_new_owner, new_owner, 'Ownership transfer not properly done');

    });

    it ('should verify the properly execution of setting the token', async function() {

        const token = await Genbby_Token.new();
        const crowdsale = await Crowdsale_Phase_1.new(Date.now() / 1000);
        const owner = accounts[0];

        await crowdsale.setToken(token.address, { from : owner });
        const actual_token_address = await crowdsale.token.call();
        assert.equal(actual_token_address, token.address, 'Token not properly assigned');


    });

    it ('should verify the information of the crowdsale', async function() {

        const _start = Math.round(Date.now() / 1000);
        const _finish = _start + days(28);
        const crowdsale = await Crowdsale_Phase_1.new(_start);
        
        let factor = new BigNumber(10 ** 18);
        let hard_cap = new BigNumber(10 ** 9).mul(factor);
        let expected_crowdsale_cap = hard_cap.mul(5).div(100).mul(75).div(100);
        
        let crowdsale_cap = await crowdsale.total_tokens.call();
        assert.equal(expected_crowdsale_cap.toString(10), crowdsale_cap.toString(10), 'Crowdsale cap information is wrong');

        let start = await crowdsale.start.call();
        assert.equal(_start + '', start.toString(10), 'Crwodsale start timestamp is wrong');
        
        let finish = await crowdsale.finish.call();
        assert.equal(_finish + '', finish.toString(10), 'Crowdsale finish timestamp is wrong');

    });

    it ('should verify the correct functionality before the crowdsale starts', async function() {

        // Simulates that it is one day before the crowdsale starts
        const _start = Math.round(Date.now() / 1000 + days(1));
        const token = await Genbby_Token.new();
        const crowdsale = await Crowdsale_Phase_1.new(_start);
        const owner = accounts[0];
        const user_1 = accounts[1];
        const factor = new BigNumber(10 ** 18);
        const one_GG = new BigNumber(1).times(factor);
        await token.setMintAgent(crowdsale.address, true, { from : owner });
        await crowdsale.setToken(token.address, { from : owner });

        try {
            await crowdsale.giveTokens(user_1, one_GG.toString(10), { from : owner });
            assert.fail();
        }
        catch (error) {
            assert.notEqual(error.message, 'assert.fail()', 'The function `giveTokens` works when no round is runnning');
        }
        let total_supply = await token.totalSupply.call();
        assert.equal(total_supply.toString(10), '0', 'The total supply was altered');

    });

    it ('should verify the correct functionality during crowdsale', async function() {

        // Simulates that it has already passed 1 days since the round 1 started
        const _start = Math.round(Date.now() / 1000 - days(1));
        const token = await Genbby_Token.new();
        const crowdsale = await Crowdsale_Phase_1.new(_start);
        const owner = accounts[0];
        const user_1 = accounts[1];
        const factor = new BigNumber(10 ** 18);
        const one_GG = new BigNumber(1).times(factor);
        await token.setMintAgent(crowdsale.address, true, { from : owner });
        await crowdsale.setToken(token.address, { from : owner });

        await crowdsale.giveTokens(user_1, one_GG.toString(10), { from : owner });
        let balance_user_1 = await token.balanceOf.call(user_1);
        assert(balance_user_1.toString(10), one_GG, 'The tokens were not assigned to `user_1`');

        let tokens_sold = await crowdsale.tokens_sold.call();
        assert.equal(tokens_sold.toString(10), one_GG.toString(10), 'The tokens sold were not included to the crowdsale information');

    });

    it ('should verify the correct functionality after the crowdsale ends', async function() {

        // Simulates that it has already passed 30 days since the round 1 started
        const _start = Math.round(Date.now() / 1000 - days(30));
        const token = await Genbby_Token.new();
        const crowdsale = await Crowdsale_Phase_1.new(_start);
        const owner = accounts[0];
        const user_1 = accounts[1];
        const factor = new BigNumber(10 ** 18);
        const one_GG = new BigNumber(1).times(factor);
        await token.setMintAgent(crowdsale.address, true, { from : owner });
        await crowdsale.setToken(token.address, { from : owner });

        try {
            await crowdsale.giveTokens(user_1, one_GG.toString(10), { from : owner });
            assert.fail();
        }
        catch (error) {
            assert.notEqual(error.message, 'assert.fail()', 'The function `giveTokens` works when no round is runnning');
        }
        let total_supply = await token.totalSupply.call();
        assert.equal(total_supply.toString(10), '0', 'The total supply was altered');

    });


    it ('should restrict the use of some functions when the contract is paused', async function() {

        // Simulates that it has already passed 1 days since the round 1 started
        const _start = Math.round(Date.now() / 1000 - days(1));
        const token = await Genbby_Token.new();
        const crowdsale = await Crowdsale_Phase_1.new(_start);
        const owner = accounts[0];
        const user_1 = accounts[1];
        const factor = new BigNumber(10 ** 18);
        const one_GG = new BigNumber(1).times(factor);
        await token.setMintAgent(crowdsale.address, true, { from : owner });
        await crowdsale.setToken(token.address, { from : owner });     

        await crowdsale.pause({ from : owner });

        try {
            await crowdsale.giveTokens(user_1, one_GG.toString(10), { from : owner });
            assert.fail();
        }
        catch (error) {
            assert.notEqual(error.message, 'assert.fail()', 'The function `giveTokens` works when the contract is paused');
        }

    });

    it ('should not allow direct payments', async function() {

        const crowdsale = await Crowdsale_Phase_1.new(Date.now() / 1000);
        const user_1 = accounts[1];

        try {
            await web3.eth.sendTransaction({ from : user_1, to : crowdsale.address, value : web3.toWei(0.0000000001, 'ether') });
            assert.fail();
        }
        catch (error) {
            assert.notEqual(error.message, 'assert.fail()', 'The transaction was not reverted');
        }

    });

});
