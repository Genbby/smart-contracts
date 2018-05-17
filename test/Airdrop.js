const Genbby_Token = artifacts.require('GenbbyToken');
const Airdrop = artifacts.require('Airdrop');
const BigNumber = web3.BigNumber;

contract('Airdrop', function(accounts) {

    it ('should verify correct ownership functions', async function() {

        const airdrop = await Airdrop.new();

        const owner = accounts[0];
        const actual_owner = await airdrop.owner.call();
        assert.equal(actual_owner, owner, 'Ownership not properly assigned');

        const new_owner = accounts[1];
        await airdrop.transferOwnership(new_owner, { from : owner });
        const actual_new_owner = await airdrop.owner.call();
        assert.equal(actual_new_owner, new_owner, 'Ownership transfer not properly done');

    });

    it ('should verify the properly execution of setting the token', async function() {

        const token = await Genbby_Token.new();
        const airdrop = await Airdrop.new();
        const owner = accounts[0];

        await airdrop.setToken(token.address, { from : owner });
        const actual_token_address = await airdrop.token.call();
        assert.equal(actual_token_address, token.address, 'Token not properly assigned');

    });

    it ('should verify the information of the airdrop', async function() {
        
        let factor = new BigNumber(10 ** 18);
        let hard_cap = new BigNumber(10 ** 9).mul(factor);
        let expected_airdrop_cap = hard_cap.mul(5).div(100).mul(1).div(100);
        const airdrop = await Airdrop.new();

        let airdrop_cap = await airdrop.total_tokens.call();
        assert.equal(expected_airdrop_cap.toString(10), airdrop_cap.toString(10), 'Airdrop cap information is wrong');

    });

    it ('should verify the correct functionality of the airdrop', async function() {

        const token = await Genbby_Token.new();
        const airdrop = await Airdrop.new();
        const owner = accounts[0];
        const user_1 = accounts[1];
        const factor = new BigNumber(10 ** 18);
        const one_GG = new BigNumber(1).times(factor);
        await token.setMintAgent(airdrop.address, true, { from : owner });
        await airdrop.setToken(token.address, { from : owner });

        await airdrop.drop(user_1, one_GG.times(25).toString(10), { from : owner });
        let balance_user_1 = await token.balanceOf.call(user_1);
        assert(balance_user_1.toString(10), one_GG.times(25).toString(10), 'The tokens were not assigned to `user_1`');

        let tokens_sold = await airdrop.tokens_sold.call();
        assert.equal(tokens_sold.toString(10), one_GG.times(25).toString(10), 'The tokens sold were not included to the airdrop information');

    });


    it ('should restrict the use of some functions when the contract is paused', async function() {

        const token = await Genbby_Token.new();
        const airdrop = await Airdrop.new();
        const owner = accounts[0];
        const user_1 = accounts[1];
        const factor = new BigNumber(10 ** 18);
        const one_GG = new BigNumber(1).times(factor);
        await token.setMintAgent(airdrop.address, true, { from : owner });
        await airdrop.setToken(token.address, { from : owner });     

        await airdrop.pause({ from : owner });

        try {
            await airdrop.drop(user_1, one_GG.toString(10), { from : owner });
            assert.fail();
        }
        catch (error) {
            assert.notEqual(error.message, 'assert.fail()', 'The function `drop` works when the contract is paused');
        }

    });

    it ('should not allow direct payments', async function() {

        const airdrop = await Airdrop.new();
        const user_1 = accounts[1];

        try {
            await web3.eth.sendTransaction({ from : user_1, to : airdrop.address, value : web3.toWei(0.0000000001, 'ether') });
            assert.fail();
        }
        catch (error) {
            assert.notEqual(error.message, 'assert.fail()', 'The transaction was not reverted');
        }

    });

});
