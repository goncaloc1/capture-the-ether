pragma solidity ^0.4.24;

contract Test {
  constructor() public {}

  function testOverflow(uint256 number) public pure returns(uint256) {
    return number * 1 ether;
  }

  function testOverflow2(uint8 number) public pure returns(uint8) {
    return number + 1;
  }

  // if we pass 2**8-1 as parameter (255) result will be 2
  function testOverflow3(uint8 number) public pure returns(uint8) {
    return number + 3;
  }

  // if we pass 2**256-1 as parameter result will be 2
  function testOverflow4(uint256 number) public pure returns(uint256) {
    return number + 3;
  }
}
