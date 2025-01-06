pragma solidity ^0.4.26;

contract PredictTheFutureChallengeInterface {
    function lockInGuess(uint8 n) public payable;
    function settle() public;
}