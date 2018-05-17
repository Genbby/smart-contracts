pragma solidity ^0.4.18;

import './Genbby-Token.sol';

/**
 * @title Airdrop
 * @dev Airdrop smart contract used by https://ico.genbby.com/
 */
contract Airdrop is Pausable {

    using SafeMath for uint256;

    GenbbyToken public token;

    uint256 public tokens_sold;
    uint256 public constant decimals = 18;
    uint256 public constant factor = 10 ** decimals;
    uint256 public constant total_tokens = 500000 * factor; // 1% 5 % hard cap

    event Drop(address to, uint256 amount);

    /**
     * @dev The `owner` can set the token that uses the crowdsale
     */
    function setToken(address tokenAddress) onlyOwner public {
        token = GenbbyToken(tokenAddress);
    }

    /**
     * @dev Function to give tokens to Airdrop participants
     * @param _to The address that will receive the tokens
     * @param _amount The amount of tokens to give
     * @return A boolean that indicates if the operation was successful
     */
    function drop(address _to, uint256 _amount) onlyOwner whenNotPaused public returns (bool) {
        require (tokens_sold.add(_amount) <= total_tokens);
        token.mint(_to, _amount);
        tokens_sold = tokens_sold.add(_amount);
        Drop(_to, _amount);
        return true;
    }

    /*
     * @dev Do not allow direct deposits
     */
    function () public payable {
        revert();
    }

}
