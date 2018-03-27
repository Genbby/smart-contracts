const Genbby_Token = artifacts.require('GenbbyToken');
const Versus_Beta = artifacts.require('VersusBeta');
const BigNumber = web3.BigNumber;

contract('Test Buy Games', function(accounts) {

    it ('should verify correct ownership functions', async function() {

        const versus_beta = await Versus_Beta.new();

        const owner = accounts[0];
        const actual_owner = await versus_beta.owner.call();
        assert.equal(actual_owner, owner, 'Ownership not properly assigned');

        const new_owner = accounts[1];
        await versus_beta.transferOwnership(new_owner, { from : owner });
        const actual_new_owner = await versus_beta.owner.call();
        assert.equal(actual_new_owner, new_owner, 'Ownership transfer not properly done');

    });

    it ('should verify the properly execution of setting the token', async function() {

        const token = await Genbby_Token.new();
        const versus_beta = await Versus_Beta.new();
        const owner = accounts[0];

        await versus_beta.setToken(token.address, { from : owner });
        const actual_token_address = await versus_beta.token.call();
        assert.equal(actual_token_address, token.address, 'Token not properly assigned');

    });

    it ('should verify the properly interaction between this contract, the token and the platform', async function() {

        /**
         * Setting the initial conditions
         */
        const token = await Genbby_Token.new();
        const versus_beta = await Versus_Beta.new();
        const owner = accounts[0];
        await versus_beta.setToken(token.address);
        await token.setMintAgent(owner, true, { from : owner });
        await token.setTrustedContract(versus_beta.address, true, { from : owner });
        const user_1 = accounts[1];
        const factor = new BigNumber(10 ** 18);
        const one_GG = new BigNumber(1).mul(factor);
        let balance_user_1, user_1_test_games;

        /**
         * Assign 1 Genbby token to `user_1`
         */
        await token.mint(user_1, one_GG.toString(10), { from : owner });

        /**
         * Verify that `user_1` received 1 Genbby token
         */
        balance_user_1 = await token.balanceOf.call(user_1);
        assert.equal(balance_user_1.toString(10), one_GG.toString(10), 'Tokens were not received');

        /**
         * Try to buy a versus game with 2 GG of bet
         * Balance user_1 : 1 GG
         * The balance of `user_1` shouldn't be reduced
         */
        try {
            await versus_beta.buy(user_1, one_GG.mul(2).toString(10), { from : owner });
            assert.fail();
        }
        catch (error) {
            assert.notEqual(error.message, 'assert.fail()', 'A users did a bet with more than his balance allows him');
        }
        balance_user_1 = await token.balanceOf.call(user_1);
        assert.equal(balance_user_1.toString(10), one_GG.toString(10), 'GG tokens of a user were reduced after a failed call of a the function `buy_games`');

        /**
         * `user_1` buy a versus game with bet of 1GG
         * Balance user_1 : 1 GG
         * The balance of `user_1` should be decreased in 1GG
         */

        await versus_beta.buy(user_1, one_GG.toString(10), { from : owner });
        balance_user_1 = await token.balanceOf.call(user_1);
        assert.equal(balance_user_1.toString(10), '0', 'Tokens were not spended');

    });

    it ('should not allow direct payments', async function() {

        const versus_beta = await Versus_Beta.new();
        const user_1 = accounts[1];

        try {
            await web3.eth.sendTransaction({ from : user_1, to : buy_games.address, value : web3.toWei(0.0000000001, 'ether') });
            assert.fail();
        }
        catch (error) {
            assert.notEqual(error.message, 'assert.fail()', 'The transaction was not reverted');
        }

    });

});