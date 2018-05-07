pragma solidity ^0.4.18;

import './Genbby-Token.sol';

/**
 * @title Crowdsale Phase 1
 * @dev Crowdsale phase 1 smart contract used by https://ico.genbby.com/
 */
contract CrowdsalePhase1 is Pausable {

    using SafeMath for uint256;

    GenbbyToken public token;

    uint256 public start;
    uint256 public finish;
    uint256 public tokens_sold;
    uint256 public constant decimals = 18;
    uint256 public constant factor = 10 ** decimals;
    uint256 public constant total_tokens = 4 * (10 ** 7) * factor; // 80% 5 % total supply

    event TokensGiven(address to, uint256 amount);

    function CrowdsalePhase1(uint256 _start) public {
        start = _start;
        finish = start + 4 weeks;
    }

    /**
     * @dev The `owner` can set the token that uses the crowdsale
     */
    function setToken(address tokenAddress) onlyOwner public {
        token = GenbbyToken(tokenAddress);
    }

    /**
     * @dev Throws if called when the crowdsale is not running 
     */
    modifier whenRunning() {
        require(start <= now && now <= finish);
        _;
    }

    /**
     * @dev Function to give tokens to others users who have bought Genbby tokens
     * @param _to The address that will receive the tokens
     * @param _amount The amount of tokens to give
     * @return A boolean that indicates if the operation was successful
     */
    function giveTokens(address _to, uint256 _amount) onlyOwner whenNotPaused whenRunning public returns (bool) {
        require (tokens_sold.add(_amount) <= total_tokens);
        token.mint(_to, _amount);
        tokens_sold = tokens_sold.add(_amount);
        TokensGiven(_to, _amount);
        return true;
    }

    /*
     * @dev Do not allow direct deposits
     */
    function () public payable {
        revert();
    }

}