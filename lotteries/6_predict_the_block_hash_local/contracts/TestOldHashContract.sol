pragma solidity ^0.4.26;

contract TestOldHashContract {
  constructor() public {}

  function test(uint256 blockNumber) public view returns(bytes32) {

    bytes32 hash = blockhash(blockNumber);

    return hash;
  }
}
