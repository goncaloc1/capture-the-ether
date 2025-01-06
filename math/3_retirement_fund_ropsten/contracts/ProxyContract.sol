pragma solidity ^0.4.26;

contract ProxyContract {
  constructor() public payable {
    require(msg.value == 1000 wei);
  }

  function destroy(address to) public {
    selfdestruct(to);
  }
}
