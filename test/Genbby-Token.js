const Genbby_Token = artifacts.require('GenbbyToken');
const BigNumber = web3.BigNumber;

/**
 * The contracts the Genbby Token uses that are from https://github.com/OpenZeppelin/zeppelin-solidity
 * are not tested here because they are already well tested in the repository mentionated
 */
contract('Genbby Token', function(accounts) {

    it ('should verify correct ownership functions', async function() {

        const token = await Genbby_Token.new();

        const owner = accounts[0];
        const actual_owner = await token.owner.call();
        assert.equal(actual_owner, owner, 'Ownership not properly assigned');

        const new_owner = accounts[1];
        await token.transferOwnership(new_owner, { from : owner });
        const actual_new_owner = await token.owner.call();
        assert.equal(actual_new_owner, new_owner, 'Ownership transfer not properly done');

    });

    it ('should verify the token information', async function () {

        const token = await Genbby_Token.new();
        const owner = accounts[0];

        const expected_name = 'Genbby Token';
        const expected_symbol = 'GG';
        const expected_decimals = 18;
        const expected_factor = new BigNumber(10 ** 18).toString(10);
        const expected_hard_cap = new BigNumber(10 ** 9).times(expected_factor).toString(10);
        const expected_contact_information = 'http://genbby.com/';

        const actual_name = await token.name.call();
        const actual_symbol = await token.symbol.call();
        const actual_decimals = await token.decimals.call();
        const actual_factor = await token.factor.call();
        const actual_hard_cap = await token.hard_cap.call();
        const actual_contact_information = await token.contactInformation.call();

        assert.equal(actual_name, expected_name, 'Wrong token name');
        assert.equal(actual_symbol, expected_symbol, 'Wrong token symbol');
        assert.equal(actual_decimals.toString(10), expected_decimals, 'Wrong token decimals');
        assert.equal(actual_factor.toString(10), expected_factor, 'Wrong token factor');
        assert.equal(actual_hard_cap.toString(10), expected_hard_cap, 'Wrong token hard cap');
        assert.equal(actual_contact_information, expected_contact_information, 'Wrong token contact information');

        const expected_new_contact_information = 'example@genbby.com';
        await token.setContactInformation(expected_contact_information, { from : owner });
        const actual_new_contact_information = await token.contactInformation.call();
        assert(actual_new_contact_information, expected_new_contact_information, 'The contact information was not properly updated');

        const expected_new_name = 'New Genbby Token';
        const expected_new_symbol = 'New GG';
        await token.setTokenInformation(expected_new_name, expected_new_symbol, { from : owner });
        const actual_new_name = await token.name.call();
        const actual_new_symbol = await token.symbol.call();
        assert.equal(actual_new_name, expected_new_name, 'The token name was not properly updated');
        assert.equal(actual_new_symbol, expected_new_symbol, 'The token symbol was not properly updated');

    });

    it ('should verify the correct functionality of Upgradable Token contract', async function() {

        const token = await Genbby_Token.new();
        const owner = accounts[0];
        const user_1 = accounts[1];
        const user_2 = accounts[2];
        let upgrading;

        upgrading = await token.upgrading.call();
        assert(!upgrading, 'The initial state of `upgrading` is Wrong');

        await token.setUpgradeAgent(token.address, { from : owner });
        const upgrade_agent = await token.upgradeAgent.call();
        assert.equal(upgrade_agent, token.address, 'Upgrade agent not properly assigned');

        try {
            await token.upgradeBalanceOf(user_1, { from : user_1 });
            assert.fail();
        }
        catch (error) {
            assert.notEqual(error.message, 'assert.fail()', 'It was possible to upgrade balance of `user_1` when the token was not upgrading');
        }

        try {
            await token.upgradeAllowance(user_1, user_1, { from : user_1 });
            assert.fail();
        }
        catch (error) {
            assert.notEqual(error.message, 'assert.fail()', 'It was possible to upgrade allowance of `user_1` when the token was not upgrading');
        }

        await token.pause({ from : owner });
        await token.startUpgrading({ from : owner });
        upgrading = await token.upgrading.call();
        assert(upgrading, 'The state of the variable `upgrading` was not updated');

        // Test of the functions `upgradeBalanceOf` and `upgradeAllowance` are in the test file `Test-New-Token.js`

        await token.stopUpgrading({ from : owner });
        upgrading = await token.upgrading.call();
        assert(!upgrading, 'The state of the variable `upgrading` was not updated');

    });

    it ('should verify the correct functionality of Platform Token contract', async function() {

        const token = await Genbby_Token.new();
        const owner = accounts[0];
        let result;

        await token.setTrustedContract(token.address, true, { from : owner });
        result = await token.isATrustedContract.call(token.address);
        assert(result, 'The token contract was not properly assigned as a trusted contract');
        
        await token.setTrustedContract(token.address, false, { from : owner });
        result = await token.isATrustedContract.call(token.address);
        assert(!result, 'The token contract was not properly assigned as a trusted contract');

        // Test of the function `buy` is in the test file `Test-New-Games.js`

    });

    it ('should verify the correct functionality of Platform Token contract', async function() {

        const token = await Genbby_Token.new();
        const owner = accounts[0];
        const user_1 = accounts[1];
        const factor = new BigNumber(10 ** 18);
        const one_GG = new BigNumber(1).mul(factor).toString(10);
        let result;

        try {
            await token.mint(user_1, one_GG, { from : owner });
            assert.fail();
        }
        catch (error) {
            assert.notEqual(error.message, 'assert.fail()', 'An address that is not allowed to mint tokens could mint tokens');
        }

        await token.setMintAgent(owner, true, { from : owner });
        result = await token.isMintAgent.call(owner);
        assert(result, 'The mint agent stated was not properly changed');

        await token.mint(user_1, one_GG, { from : owner });
        const balance_user_1 = await token.balanceOf.call(user_1);
        assert.equal(balance_user_1, one_GG, 'The tokens were not properly assigned');

        total_supply = await token.totalSupply.call();
        assert.equal(total_supply, one_GG, 'The total supply was not properly updated')

        try {
            const hard_cap = await token.hard_cap.call();
            await token.mint(user_1, hard_cap, { from : owner });
            assert.fail();
        }
        catch (error) {
            assert.notEqual(error.message, 'assert.fail()', 'There have been minted more tokens that the hard cap');
        }

        await token.setMintAgent(owner, false, { from : owner });
        result = await token.isMintAgent.call(owner);
        assert(!result, 'The mint agent state was not properly changed');


    });


    it ('should not allow direct payments', async function() {

        const token = await Genbby_Token.new();
        const user_1 = accounts[1];

        try {
            await web3.eth.sendTransaction({ from : user_1, to : token.address, value : web3.toWei(0.0000000001, 'ether') });
            assert.fail();
        }
        catch (error) {
            assert.notEqual(error.message, 'assert.fail()', 'The transaction was not reverted');
        }

    });   

});