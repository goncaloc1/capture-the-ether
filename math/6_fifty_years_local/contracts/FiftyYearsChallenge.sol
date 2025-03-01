pragma solidity ^0.4.21;

contract FiftyYearsChallenge {
    struct Contribution {
        uint256 amount;
        uint256 unlockTimestamp;
    }
    Contribution[] queue;
    uint256 head;

    address owner;

    constructor(address player) public payable {
        require(msg.value == 1 ether);

        owner = player;
        queue.push(Contribution(msg.value, now + 50 years));
    }

    function isComplete() public view returns (bool) {
        return address(this).balance == 0;
    }

    function getLength() public view returns (uint256) {
      return queue.length;
    }

    function getAmount(uint256 index) public view returns (uint256) {
      return queue[index].amount;
    }

    function getTimestamp(uint256 index) public view returns (uint256) {
      return queue[index].unlockTimestamp;
    }

    function getNow() public view returns (uint256) {
      return now;
    }

    function getHead() public view returns (uint256) {
      return head;
    }

    function upsert(uint256 index, uint256 timestamp) public payable {
        require(msg.sender == owner);

        if (index >= head && index < queue.length) {
            // Update existing contribution amount without updating timestamp.
            // NOTE: couldn't find anything about this but it seems we just have function
            // scope, `contribution` variable isn't scoped to condition.
            Contribution storage contribution = queue[index];
            contribution.amount += msg.value;
        }
        else {
            // Append a new contribution. Require that each contribution unlock
            // at least 1 day after the previous one.
            require(timestamp >= queue[queue.length - 1].unlockTimestamp + 1 days);

            contribution.amount = msg.value;
            contribution.unlockTimestamp = timestamp;
            queue.push(contribution);
        }
    }

    function withdraw(uint256 index) public {
        require(msg.sender == owner);
        require(now >= queue[index].unlockTimestamp);

        // Withdraw this and any earlier contributions.
        uint256 total = 0;
        for (uint256 i = head; i <= index; i++) {
            total += queue[i].amount;

            // Reclaim storage.
            delete queue[i];
        }

        // Move the head of the queue forward so we don't have to loop over
        // already-withdrawn contributions.
        head = index + 1;

        msg.sender.transfer(total);
    }

    // for testing total calculation
    function withdraw2(uint256 index) public view returns(uint256) {
        require(msg.sender == owner);
        require(now >= queue[index].unlockTimestamp);

        // Withdraw this and any earlier contributions.
        uint256 total = 0;
        for (uint256 i = head; i <= index; i++) {
            total += queue[i].amount;

            // Reclaim storage.
            // delete queue[i];
        }

        // Move the head of the queue forward so we don't have to loop over
        // already-withdrawn contributions.
        // head = index + 1;

        return total;
    }
}