const Genbby_Token = artifacts.require('GenbbyToken');
const Crowdsale_Phase_1 = artifacts.require('CrowdsalePhase1');
const BigNumber = web3.BigNumber;

/**
 * Days:
 *  0 -  6 : Round 1
 *    6    : Publicity
 *  7 - 13 : Round 2
 *   13    : Publicity
 * 14 - 20 : Round 3
 *   20    : Publicity
 * 21 - 27 : Round 4 
 */
class Round {

    constructor(start, finish, total_tokens, tokens_sold) {
        this.start = start.toString(10);
        this.finish = finish.toString(10);
        this.total_tokens = total_tokens.toString(10);
        this.tokens_sold = tokens_sold.toString(10);
    }

}

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

    it ('should verify the information of the rounds', async function() {

        const _start = Math.round(Date.now() / 1000);
        const crowdsale = await Crowdsale_Phase_1.new(_start);
        
        let factor = new BigNumber(10 ** 18);
        let crowdale_hard_cap = new BigNumber(10 ** 8).mul(factor);
        let round;
        
        let expected_round_1 = new Round(_start,
                                         _start + days(6),
                                         crowdale_hard_cap.mul(45).div(100).toString(10),
                                         0);
        round = await crowdsale.round1.call();
        let actual_round_1 = new Round(...round);
        assert.deepEqual(actual_round_1, expected_round_1, 'Round 1 information is wrong');

        let expected_round_2 = new Round(new BigNumber(expected_round_1.start).add(days(7)),
                                         new BigNumber(expected_round_1.finish).add(days(7)),
                                         crowdale_hard_cap.mul(20).div(100).toString(10),
                                         0);
        round = await crowdsale.round2.call();
        let actual_round_2 = new Round(...round);
        assert.deepEqual(actual_round_2, expected_round_2, 'Round 2 information is wrong');

        let expected_round_3 = new Round(new BigNumber(expected_round_2.start).add(days(7)),
                                         new BigNumber(expected_round_2.finish).add(days(7)),
                                         crowdale_hard_cap.mul(20).div(100).toString(10),
                                         0);
        round = await crowdsale.round3.call();
        let actual_round_3 = new Round(...round);
        assert.deepEqual(actual_round_3, expected_round_3, 'Round 3 information is wrong');

        let expected_round_4 = new Round(new BigNumber(expected_round_3.start).add(days(7)),
                                         new BigNumber(expected_round_3.finish).add(days(7)),
                                         crowdale_hard_cap.mul(15).div(100).toString(10),
                                         0);
        round = await crowdsale.round4.call();
        let actual_round_4 = new Round(...round);
        assert.deepEqual(actual_round_4, expected_round_4, 'Round 4 information is wrong');

    });

    it ('should verify the correct functionality before round 1', async function() {

        // Simulates that it is one day before the round 1 starts
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

    it ('should verify the correct functionality during round 1', async function() {

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

        let round = await crowdsale.round1.call();
        let round_1 = new Round(...round);
        assert.equal(round_1.tokens_sold, one_GG, 'The tokens sold were not included to the round information');

    });

    it ('should verify the correct functionality before round 2', async function() {

        // Simulates that it has already passed 6 days since the round 1 started
        const _start = Math.round(Date.now() / 1000 - days(6) - 100);
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

    it ('should verify the correct functionality during round 2', async function() {

        // Simulates that it has already passed 8 days since the round 1 started
        const _start = Math.round(Date.now() / 1000 - days(8));
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

        let round = await crowdsale.round2.call();
        let round_2 = new Round(...round);
        assert.equal(round_2.tokens_sold, one_GG, 'The tokens sold were not included to the round information');

    });

    it ('should verify the correct functionality before round 3', async function() {

        // Simulates that it has already passed 13 days since the round 1 started
        const _start = Math.round(Date.now() / 1000 - days(13) - 100);
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

    it ('should verify the correct functionality during round 3', async function() {

        // Simulates that it has already passed 15 days since the round 1 started
        const _start = Math.round(Date.now() / 1000 - days(15));
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

        let round = await crowdsale.round3.call();
        let round_3 = new Round(...round);
        assert.equal(round_3.tokens_sold, one_GG, 'The tokens sold were not included to the round information');

    });

    it ('should verify the correct functionality before round 4', async function() {

        // Simulates that it has already passed 20 days since the round 1 started
        const _start = Math.round(Date.now() / 1000 - days(20) - 100);
        const token = await Genbby_Token.new();
        const crowdsale = await Crowdsale_Phase_1.new(_start);
        const owner = accounts[0];
        const user_1 = accounts[1];
        const factor = new BigNumber(10 ** 18);
        const one_GG = new BigNumber(1).times(factor);
        await token.setMintAgent(crowdsale.address, true, { from : owner });
        await crowdsale.setToken(token.address, { from : owner });

        let n_round = await crowdsale.numberOfRound.call();

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

    it ('should verify the correct functionality during round 4', async function() {

        // Simulates that it has already passed 22 days since the round 1 started
        const _start = Math.round(Date.now() / 1000 - days(22));
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

        let round = await crowdsale.round4.call();
        let round_4 = new Round(...round);
        assert.equal(round_4.tokens_sold, one_GG, 'The tokens sold were not included to the round information');

    });

    it ('should verify the correct functionality after round 4', async function() {

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

        let n_round = await crowdsale.numberOfRound.call();

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