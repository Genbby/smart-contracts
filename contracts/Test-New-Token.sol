pragma solidity ^0.4.18;

import './Genbby-Token.sol';

/**
 * @title Test New Token
 * @dev A simple test contract that simulates how can a token contract can be upgraded
 */
contract TestNewToken is GenbbyToken {

    address public last_token;

    /**
     * @dev Modifier that checks that `msg.sender` is the address of the last token
     */
    modifier onlyLastToken() {
        require (msg.sender == last_token);
        _;
    }

    /**
     * @dev The `owner` can set the address of the last token
     */
    function setLastToken(address tokenAddress) onlyOwner public {
        last_token = tokenAddress;
    }

    /**
     * @dev Function that the last token can use to move balance of `_owner` to this contract
     */
    function upgradeBalance(address who, uint256 amount) onlyLastToken public {
        balances[who] = balances[who].add(amount);
        totalSupply = totalSupply.add(amount);
    }

    /**
     * @dev Function that the last token can use to move allowance of `owner` to this contract
     */
    function upgradeAllowance(address _owner, address _spender, uint256 amount) onlyLastToken public {
        allowed[_owner][_spender] = allowed[_owner][_spender].add(amount);
    }

}