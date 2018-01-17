pragma solidity ^0.4.18;

import './Genbby-Token.sol';

/**
 * @title Crowdsale Phase 1
 * @dev Crowdsale phase 1 smart contract used by http://genbby.com/
 */
contract CrowdsalePhase1 is Pausable {

    using SafeMath for uint256;

    GenbbyToken public token;

    struct Round {
        uint256 start;
        uint256 finish;
        uint256 total_tokens;
        uint256 tokens_sold;
    }

    Round public round1;
    Round public round2;
    Round public round3;
    Round public round4;
    uint256 public constant decimals = 18;
    uint256 public constant factor = 10 ** decimals;
    uint256 public constant crowdsaleHardCap = (10 ** 8) * factor;

    function CrowdsalePhase1(uint256 _startCrowdsale) public {
        round1 = Round(_startCrowdsale, _startCrowdsale + 6 days, crowdsaleHardCap.mul(45).div(100), 0);
        round2 = Round(round1.start + 1 weeks, round1.finish + 1 weeks, crowdsaleHardCap.mul(20).div(100), 0);
        round3 = Round(round2.start + 1 weeks, round2.finish + 1 weeks, crowdsaleHardCap.mul(20).div(100), 0);
        round4 = Round(round3.start + 1 weeks, round3.finish + 1 weeks, crowdsaleHardCap.mul(15).div(100), 0);
    }

    /**
     * @dev The `owner` can set the token that uses the crowdsale
     */
    function setToken(address tokenAddress) onlyOwner public {
        token = GenbbyToken(tokenAddress);
    }

    /**
     * @dev Funtion to determine the number of the current round
     * @return the number of the current round or 0 in if no round is running
     */
    function numberOfRound() public view returns (uint8) {
        if (round1.start <= now && now <= round1.finish) return 1;
        if (round2.start <= now && now <= round2.finish) return 2;
        if (round3.start <= now && now <= round3.finish) return 3;
        if (round4.start <= now && now <= round4.finish) return 4;
        return 0;
    }

    /**
     * @dev Function to give tokens to others users who have boought Genbby tokens
     * @param _to The address that will receive the tokens
     * @param _amount The amount of tokens to give
     * @return A boolean that indicates if the operation was successful
     */
    function giveTokens(address _to, uint256 _amount) onlyOwner whenNotPaused public returns (bool) {
        uint8 n_round = numberOfRound();
        require (n_round != 0);
        if (n_round == 1) require (round1.tokens_sold.add(_amount) <= round1.total_tokens);
        if (n_round == 2) require (round2.tokens_sold.add(_amount) <= round2.total_tokens);
        if (n_round == 3) require (round3.tokens_sold.add(_amount) <= round3.total_tokens);
        if (n_round == 4) require (round4.tokens_sold.add(_amount) <= round4.total_tokens);
        token.mint(_to, _amount);
        if (n_round == 1) round1.tokens_sold = round1.tokens_sold.add(_amount);
        if (n_round == 2) round2.tokens_sold = round2.tokens_sold.add(_amount);
        if (n_round == 3) round3.tokens_sold = round3.tokens_sold.add(_amount);
        if (n_round == 4) round4.tokens_sold = round4.tokens_sold.add(_amount);
        return true;
    }

    /*
     * @dev Do not allow direct deposits
     */
    function () public payable {
        revert();
    }

}