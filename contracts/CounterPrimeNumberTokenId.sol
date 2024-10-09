// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";

contract CounterPrimeNumberTokenId {
    function countPrimeNumberTokenId(address tokenOwner, address nftAddress) external view returns (uint256 counter) {
        uint256 balance = IERC721Enumerable(nftAddress).balanceOf(tokenOwner);
        counter = 0;

        for (uint256 index = 0; index < balance; index++) {
            uint256 tokenId = IERC721Enumerable(nftAddress).tokenOfOwnerByIndex(tokenOwner, index);
            if (isPrimeNumber(tokenId)) {
                counter++;
            }
        }
    }
    function isPrimeNumber(uint256 integer) internal pure returns (bool) {
        if (integer < 2) return false;
        if (integer == 2) return true;
        if (integer % 2 == 0) return false;
        for (uint256 i = 3; i * i <= integer; i += 2) {
            if (integer % i == 0) {
                return false;
            }
        }
        return true;
    }
}
