// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC721Receiver} from "@openzeppelin/contracts/interfaces/IERC721Receiver.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IRewardToken} from "./IRewardToken.sol";

/**
 * @title Staking Contract for ERC721 Tokens
 * @dev Allows users to stake their NFTs and withdraw them later. Implements IERC721Receiver to receive NFTs.
 */
contract Staking is IERC721Receiver {
    struct Stake {
        uint256 timestamp;
        address originalOwner;
    }

    address public immutable nft;
    address public immutable rewardToken;

    mapping(uint256 => Stake) public stakes;

    event NFTStaked(address indexed owner, uint256 indexed tokenId, uint256 timestamp);
    event NFTWithdrawn(address indexed owner, uint256 indexed tokenId);
    event RewardsMinted(address indexed owner, uint256 amount, uint256 indexed tokenId);

    /**
     * @notice Constructor to set the NFT contract address.
     * @param nft_ The address of the ERC721 NFT contract that will be used for staking.
     */
    constructor(address nft_, address rewardToken_) {
        nft = nft_;
        rewardToken = rewardToken_;
    }

    /**
     * @notice Handles the receipt of an ERC721 token.
     * @dev This function is called whenever an ERC721 token is transferred to this contract via `safeTransferFrom`.
     * It will store the stake information in the `stakes` mapping.
     * @param from The previous owner of the NFT (the address that staked the NFT).
     * @param id The token ID of the NFT being staked.
     * @return The selector to confirm that the NFT has been received.
     */
    function onERC721Received(address, address from, uint256 id, bytes calldata) external override returns (bytes4) {
        require(msg.sender == nft, "Staking: Incorrect NFT contract");
        stakes[id].originalOwner = from;
        stakes[id].timestamp = block.timestamp;
        emit NFTStaked(from, id, stakes[id].timestamp);

        return this.onERC721Received.selector;
    }

    /**
     * @notice Allows the original owner to withdraw their staked NFT.
     * @dev Only the original owner of the NFT can withdraw it. The stake is deleted upon withdrawal.
     * @param id The token ID of the staked NFT.
     */
    function withdrawNft(uint256 id) external {
        Stake storage stake = stakes[id];
        require(stake.originalOwner == msg.sender, "Staking: Not the original owner");

        delete stakes[id];
        IERC721(nft).transferFrom(address(this), msg.sender, id);
        emit NFTWithdrawn(msg.sender, id);
    }

    /**
     * @notice Allows the original owner to withdraw their staking rewards.
     * @dev Rewards are minted based on the duration the NFT was staked.
     * @param id The token ID of the staked NFT.
     */
    function withdrawRewards(uint256 id) external {
        Stake storage stake = stakes[id];
        require(stake.originalOwner == msg.sender, "Staking: Not the original owner");
        require(stake.timestamp != 0, "NFT is not staked");

        uint256 durationInSeconds = block.timestamp - stake.timestamp;
        uint256 durationInDays = durationInSeconds / 60 / 60 / 24;

        if (durationInDays >= 1) {
            uint256 tokenAmount = durationInDays * 10 ether;
            IRewardToken(rewardToken).mint(tokenAmount);
            emit RewardsMinted(msg.sender, tokenAmount, id);
            stake.timestamp = block.timestamp;
        }
    }

    function getStakeTimestamp(uint256 id) public view returns (uint256) {
        Stake memory stake = stakes[id];
        return stake.timestamp;
    }
    function getStakeOwner(uint256 id) public view returns (address) {
        Stake memory stake = stakes[id];
        return stake.originalOwner;
    }
}
