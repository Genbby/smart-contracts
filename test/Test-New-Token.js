const Genbby_Token = artifacts.require('GenbbyToken');
const Test_New_Token = artifacts.require('TestNewToken');
const BigNumber = web3.BigNumber;

contract('Test New Token', function(accounts) {

    it ('should verify correct ownership functions', async function() {

        const new_token = await Test_New_Token.new();

        const owner = accounts[0];
        const actual_owner = await new_token.owner.call();
        assert.equal(actual_owner, owner, 'Ownership not properly assigned');

        const new_owner = accounts[1];
        await new_token.transferOwnership(new_owner, { from : owner });
        const actual_new_owner = await new_token.owner.call();
        assert.equal(actual_new_owner, new_owner, 'Ownership transfer not properly done');

    });

    it ('should simulate the properly upgrade of tokens', async function() {

        /**
         * Setting the initial conditions
         */
        const token = await Genbby_Token.new();
        const new_token = await Test_New_Token.new();
        const owner = accounts[0];
        const user_1 = accounts[1];
        const user_2 = accounts[2];
        const factor = new BigNumber(10 ** 18);
        const one_GG = new BigNumber(1).mul(factor);
        await token.setMintAgent(owner, true, { from : owner });
        await token.setTrustedContract(new_token.address, true, { from : owner });
        await new_token.setLastToken(token.address);
        await token.mint(user_1, one_GG.mul(10).toString(10), { from : owner });
        await token.approve(user_2, one_GG.mul(2).toString(10), { from : user_1 });
        let balance_user_1, allowed_user_2;
        let new_balance_user_1, new_allowed_user_2;

        /**
         *                    `token`   `new_token`
         * `user_1`
         * balance          : 10 GG          0 GG
         * allowed          : 0  GG          0 GG
         * `user_2`
         * balance          : 0  GG          0 GG
         * allowed          : 2  GG          0 GG
         */

        await token.pause({ from : owner });
        await token.startUpgrading({ from : owner });
        await token.setUpgradeAgent(new_token.address, { from : owner });

        await token.upgradeBalanceOf(user_1, { from : user_1 });
        balance_user_1 = await token.balanceOf.call(user_1);
        assert.equal(balance_user_1.toString(10), '0', 'The tokens were not reduced from the old contract');

        new_balance_user_1 = await new_token.balanceOf.call(user_1);
        assert.equal(new_balance_user_1.toString(10), one_GG.mul(10).toString(10), 'The tokens were not properly upgraded to the new contract');

        await token.upgradeAllowance(user_1, user_2, { from : user_2 });
        allowed_user_2 = await token.allowance.call(user_1, user_2);
        assert.equal(allowed_user_2.toString(10), '0', 'The allowance was not reduced from the old contract');

        new_allowed_user_2 = await new_token.allowance.call(user_1, user_2);
        assert.equal(new_allowed_user_2, one_GG.mul(2).toString(10), 'The allowed tokens were not properly upgraded to the new contract');

        /**
         *                    `token`   `new_token`
         * `user_1`
         * balance          : 0 GG         10 GG
         * allowed          : 0 GG          0 GG 
         * `user_2`
         * balance          : 0 GG          0 GG
         * allowed          : 0 GG          2 GG
         */
        let total_supply_upgraded = await token.totalSupplyUpgraded.call();
        assert.equal(total_supply_upgraded.toString(10), one_GG.mul(10).toString(10), 'Not all the tokens that were in circulatiion were updated');

        let new_total_supply = await new_token.totalSupply.call();
        assert.equal(total_supply_upgraded.toString(10), new_total_supply.toString(10), 'The total supply was not properly upgrade to the new contract');

    });

    it ('should not allow direct payments', async function() {

        const new_token = await Test_New_Token.new();
        const user_1 = accounts[1];

        try {
            await web3.eth.sendTransaction({ from : user_1, to : new_token.address, value : web3.toWei(0.0000000001, 'ether') });
            assert.fail();
        }
        catch (error) {
            assert.notEqual(error.message, 'assert.fail()', 'The transaction was not reverted');
        }

    });

});