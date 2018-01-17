pragma solidity ^0.4.18;

import './Genbby-Token.sol';

/**
 * @title Test Buy Games
 * @dev A simple test contract that simulates how users will be able to use their Genbby tokens
 * in the platform for playing
 */
contract TestBuyGames is Pausable {

    using SafeMath for uint256;

    uint256 public constant decimals = 18;
    uint256 public constant factor = 10 ** decimals;

    mapping (address => uint256) public testGames;

    GenbbyToken public token;

    /**
     * @dev The `owner` can set the token that uses these contract (Genbby tokens)
     */
    function setToken(address tokenAddress) onlyOwner public {
        token = GenbbyToken(tokenAddress);
    }

    /**
     * @dev Function that let any user to buy a test game that cost 2 GG tokens
     */
    function buyATestGame() whenNotPaused public {
        token.buy(msg.sender, 2 * factor);
        testGames[msg.sender] = testGames[msg.sender].add(1);
    }

    /**
     * @dev Function that its called when a game is played in the platform
     */
    function setPlayedTestGame(address who) onlyOwner whenNotPaused public {
        assert (testGames[who] != 0);
        testGames[who] = testGames[who].sub(1);
    }

    /**
     * @dev Function to check the number of test games that a given address has
     * @param who The address to query of the number of test games that has
     * @return An uint256 specifying the number of test games that `who` has
     */
    function checkNumberOfTestGames(address who) public view returns (uint256) {
        return testGames[who];
    }

    /*
     * @dev Do not allow direct deposits
     */
    function () public payable {
        revert();
    }

}