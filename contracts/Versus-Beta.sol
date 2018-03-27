pragma solidity ^0.4.18;

import './Genbby-Token.sol';

/**
 * @title Versus Beta
 * @dev A contract that handle the buying of versus games in the platform
 */
contract VersusBeta is Pausable {

    GenbbyToken public token;

    event Buy(address who, uint256 bet);

    /**
     * @dev The `owner` can set the token that uses these contract (Genbby tokens)
     */
    function setToken(address tokenAddress) onlyOwner public {
        token = GenbbyToken(tokenAddress);
    }

    /**
     * @dev Function that handle the buying of a versus game with `bet` amount
     * @param who The buyer
     * @param bet The amount of the bet
     */
    function buy(address who, uint256 bet) onlyOwner whenNotPaused public {
        token.buy(who, bet);
        Buy(who, bet);
    }

    /*
     * @dev Do not allow direct deposits
     */
    function () public payable {
        revert();
    }

}