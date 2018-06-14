pragma solidity ^0.4.18;

import './Genbby-Token.sol';

/**
 * @title Genbby Cash
 * @dev A contract that handle the buying of Genbby cash in the platform
 */
contract GenbbyCash is Pausable {

    GenbbyToken public token;

    event Cash(address who, uint256 bet);

    /**
     * @dev The `owner` can set the token that uses these contract (Genbby tokens)
     */
    function setToken(address tokenAddress) onlyOwner public {
        token = GenbbyToken(tokenAddress);
    }

    /**
     * @dev Function that handle the decrement of Genbby Tokens equivalent for the buying of 'bet' Genbby Cash
     * @param who The buyer
     * @param bet The amount of the bet
     */
    function cash(address who, uint256 bet) onlyOwner whenNotPaused public {
        token.buy(who, bet);
        Cash(who, bet);
    }

    /*
     * @dev Do not allow direct deposits
     */
    function () public payable {
        revert();
    }

}
