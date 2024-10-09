// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title NFT2
 * @dev Implementation of an ERC721 token with enumerable capabilities.
 * This contract allows users to mint new NFTs.
 *
 * Inherits from OpenZeppelin's ERC721Enumerable contract for full compatibility with the ERC721 standard.
 */
contract NFT2 is ERC721Enumerable {
    uint256 private _nextTokenId; // Keeps track of the next token ID to mint

    /**
     * @notice Constructor to set the name and symbol of the NFT collection.
     * @param name_ The name of the NFT collection.
     * @param symbol_ The symbol of the NFT collection.
     */
    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {
        _nextTokenId = 1;
        for (uint256 i = 0; i < 100; i++) {
            mint();
        }
    }

    /**
     * @notice Mints a new NFT to the caller's address.
     * @dev Only the contract owner should be allowed to mint NFTs.
     */
    function mint() internal {
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        _mint(msg.sender, tokenId);
    }
}
