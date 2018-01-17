const Genbby_Token = artifacts.require('GenbbyToken');
const Test_Buy_Games = artifacts.require('TestBuyGames');
const BigNumber = web3.BigNumber;

contract('Test Buy Games', function(accounts) {

    it ('should verify correct ownership functions', async function() {

        const buy_games = await Test_Buy_Games.new();

        const owner = accounts[0];
        const actual_owner = await buy_games.owner.call();
        assert.equal(actual_owner, owner, 'Ownership not properly assigned');

        const new_owner = accounts[1];
        await buy_games.transferOwnership(new_owner, { from : owner });
        const actual_new_owner = await buy_games.owner.call();
        assert.equal(actual_new_owner, new_owner, 'Ownership transfer not properly done');

    });

    it ('should verify the properly execution of setting the token', async function() {

        const token = await Genbby_Token.new();
        const buy_games = await Test_Buy_Games.new();
        const owner = accounts[0];

        await buy_games.setToken(token.address, { from : owner });
        const actual_token_address = await buy_games.token.call();
        assert.equal(actual_token_address, token.address, 'Token not properly assigned');

    });

    it ('should verify the properly interaction between this contract, the token and the platform', async function() {

        /**
         * Setting the initial conditions
         */
        const token = await Genbby_Token.new();
        const buy_games = await Test_Buy_Games.new();
        const owner = accounts[0];
        await buy_games.setToken(token.address);
        await token.setMintAgent(owner, true, { from : owner });
        await token.setTrustedContract(buy_games.address, true, { from : owner });
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
         * Try to buy a test game that costs 2 GG
         * Balance user_1 : 1 GG
         * The balance of `user_1` shouldn't be reduced
         */
        try {
            await buy_games.buyATestGame({ from : user_1 });
            assert.fail();
        }
        catch (error) {
            assert.notEqual(error.message, 'assert.fail()', 'A users bought more than his balances allows him');
        }
        balance_user_1 = await token.balanceOf.call(user_1);
        assert.equal(balance_user_1.toString(10), one_GG.toString(10), 'GG tokens of a user were reduced after a failed call of a the function `buy_games`');

        /**
         * Give 2 GG to `user_1` to be able to buy a test game of 2 GG without problems
         * Balance user_1 : 1 GG
         * The balance of `user_1` should be increased in 2 GG and aster buying the the game reduced in 2 GG
         * `user_1` should have 1 test game
         */
        await token.mint(user_1, one_GG.mul(2).toString(10), { from : owner });
        balance_user_1 = await token.balanceOf.call(user_1);
        assert.equal(balance_user_1.toString(10), one_GG.mul(3).toString(10), 'Tokens were not received');

        await buy_games.buyATestGame({ from : user_1 });
        balance_user_1 = await token.balanceOf.call(user_1);
        assert.equal(balance_user_1.toString(10), one_GG.toString(10), 'Tokens were not spended');

        user_1_test_games = await buy_games.checkNumberOfTestGames.call(user_1);
        assert.equal(user_1_test_games.toString(10), '1', 'Test games were not given to `user_1`');

        /**
         * Simulates that `user_1` has already played a test game
         * Balance user_1 : 1 GG
         * The balance of the `user_1` shouldn't be reduced but its number of test games available should be reduced in 1
         */
        await buy_games.setPlayedTestGame(user_1, { from : owner });
        balance_user_1 = await token.balanceOf.call(user_1);
        assert.equal(balance_user_1.toString(10), one_GG.toString(10), 'Tokens were spended when they were supposed not to');

        user_1_test_games = await buy_games.checkNumberOfTestGames.call(user_1);
        assert.equal(user_1_test_games.toString(10), '0', 'Test games were not properly reduced');

    });

    it ('should verify the impossibility of using some functions when the contract is paused', async function() {

        /**
         * Setting the initial conditions
         */
        const token = await Genbby_Token.new();
        const buy_games = await Test_Buy_Games.new();
        const owner = accounts[0];
        await buy_games.setToken(token.address);
        await token.setMintAgent(owner, true, { from : owner });
        await token.setTrustedContract(buy_games.address, true, { from : owner });
        const user_1 = accounts[1];
        const factor = new BigNumber(10 ** 18);
        const ten_GG = new BigNumber(10).mul(factor);
        let balance_user_1, user_1_test_games;
        await token.mint(user_1, ten_GG.toString(10), { from : owner });
        await buy_games.buyATestGame({ from : user_1 });

        /**
         * Current state
         * balance user_1 : 8 GG
         * test games user_1 : 1
         */
         await buy_games.pause({ from : owner });

        /**
         * Now that Test Buy Games smart contract is paused, nobody should be able to use `buyATestGame` and `setPlayedTestGame`
         * And the balance and number of test games of `user_1` shouldn't be reduced
         */
        try {
            await buy_games.buyATestGame({ from : user_1 });
            assert.fail();
        }
        catch(error) {
            assert.notEqual(error.message, 'assert.fail()', 'It was possible to use `buyATestGame`');
        }

        try {
            await buy_games.setPlayedTestGame({ from : owner });
            assert.fail();
        }
        catch(error) {
            assert.notEqual(error.message, 'assert.fail()', 'It was possible to use `setPlayedTestGame`');
        }

        balance_user_1 = await token.balanceOf.call(user_1);
        assert.equal(balance_user_1.toString(10), ten_GG.div(10).mul(8).toString(10), 'GG tokens of `user_1` were reduced');

        user_1_test_games = await buy_games.checkNumberOfTestGames.call(user_1);
        assert.equal(user_1_test_games.toString(10), '1', 'Number of test games of `user_1` were reduced');

    });

    it ('should not allow direct payments', async function() {

        const buy_games = await Test_Buy_Games.new();
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