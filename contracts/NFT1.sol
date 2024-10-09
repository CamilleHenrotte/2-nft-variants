// SPDX-License-Identifier: MIT
pragma solidity =0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {BitMaps} from "@openzeppelin/contracts/utils/structs/BitMaps.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title NFT1
 * @dev An ERC721 contract with added functionality for minting, discounts using Merkle proofs, and royalties (ERC2981).
 *      Includes features like time-limited discounts, withdrawal of funds, and token transfers with royalty payments.
 *      Based on OpenZeppelin's ERC721, Ownable2Step, and ERC2981 standards.
 */
contract NFT1 is ERC721, Ownable2Step, ERC2981 {
    uint256 public constant MAX_SUPPLY = 1000;
    uint96 public constant ROYALTY_FEE_NUMERATOR = 250; // 2.5% royalty fee
    uint256 public constant MINTING_PRICE = 0.1 ether;
    uint256 public constant DISCOUNTED_MINTING_PRICE = 0.05 ether;

    uint256 public tokenIdCounter;
    bytes32 public immutable merkleRoot; // Root of Merkle tree used for airdrop verification

    string private baseTokenURI;
    BitMaps.BitMap private airdropList;

    // Events
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event Minted(address indexed nftOwner);

    /**
     * @notice Constructor that initializes the NFT1 contract.
     * @param baseURI The base URI for token metadata.
     * @param merkleRoot_ The Merkle root used for airdrop/discount verification.
     */
    constructor(string memory baseURI, bytes32 merkleRoot_) ERC721("NFT1", "NFT1") {
        baseTokenURI = baseURI;
        merkleRoot = merkleRoot_;
        tokenIdCounter = 0;
        _setDefaultRoyalty(msg.sender, ROYALTY_FEE_NUMERATOR); // Setting the default royalty fee to the deployer
    }

    /**
     * @notice Withdraw all the funds from the contract to the owner's address.
     * @dev Only callable by the owner of the contract. Emits a FundsWithdrawn event.
     */
    function withdrawFunds() external onlyOwner {
        uint256 contractBalance = address(this).balance;
        require(contractBalance > 0, "no funds to withdraw");
        (bool success, ) = payable(msg.sender).call{value: contractBalance}("");
        require(success, "fund transfer failed");
        emit FundsWithdrawn(msg.sender, contractBalance);
    }

    /**
     * @notice Transfer an NFT along with royalty payment to the rightful receiver.
     * @param from The address sending the NFT.
     * @param to The address receiving the NFT.
     * @param tokenId The ID of the token being transferred.
     * @param salesPrice The sale price of the NFT.
     * @dev Ensures that the royalty payment is made before the transfer.
     */
    function transferFromWithRoyalties(address from, address to, uint256 tokenId, uint256 salesPrice) external payable {
        (, uint256 royaltyAmount) = royaltyInfo(tokenId, salesPrice);
        require(msg.value >= royaltyAmount, "Insufficient royalty amount");
        transferFrom(from, to, tokenId); // Perform the actual token transfer

        uint256 excess = msg.value - royaltyAmount;
        if (excess > 0) {
            (bool refundSuccess, ) = msg.sender.call{value: excess}(""); // Refund excess ETH to sender
            require(refundSuccess, "Refund failed");
        }
    }

    /**
     * @notice Set a custom royalty for a specific token.
     * @param tokenId The ID of the token.
     * @param receiver The address that should receive the royalty.
     * @param feeNumerator The royalty percentage, represented as a numerator out of 10,000.
     */
    function setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator) external onlyOwner {
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
    }

    /**
     * @notice Mint a new NFT.
     * @dev Requires sending 0.1 ETH. Only mints if the supply limit hasn't been reached.
     */
    function mint() public payable {
        require(msg.value == MINTING_PRICE, "wrong amount, send 0.1 ETH");
        _mint();
    }

    /**
     * @notice Mint an NFT with a discount using a valid Merkle proof.
     * @param proof The Merkle proof of eligibility for the discount.
     * @param index The index in the Merkle tree.
     * @param amount The number of tokens to mint.
     * @dev Requires sending 0.05 ETH for the discounted mint price.
     */
    function mintWithDiscount(bytes32[] calldata proof, uint256 index, uint256 amount) public payable {
        require(msg.value == DISCOUNTED_MINTING_PRICE, "wrong amount, send 0.05 ETH");
        require(!BitMaps.get(airdropList, index), "Discount already claimed");
        _verifyProof(proof, index, amount, msg.sender);
        BitMaps.setTo(airdropList, index, true);
        for (uint256 i = 0; i < amount; i++) {
            _mint();
        }
    }

    /**
     * @notice Set a new base URI for the token metadata.
     * @param baseURI The new base URI.
     */
    function setBaseURI(string memory baseURI) public onlyOwner {
        baseTokenURI = baseURI;
    }

    /**
     * @dev Returns the base URI for token metadata.
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    /**
     * @notice Get the total number of minted tokens.
     * @return The total supply of tokens.
     */
    function totalSupply() public view returns (uint256) {
        return tokenIdCounter;
    }

    /**
     * @notice Override to include support for ERC2981 interface.
     * @param interfaceId The interface identifier.
     * @return Whether the contract supports the specified interface.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Internal function to update ownership and royalty receiver when transferring ownership.
     * @param newOwner The new owner of the contract.
     */
    function _transferOwnership(address newOwner) internal override {
        super._transferOwnership(newOwner);
        _setDefaultRoyalty(newOwner, ROYALTY_FEE_NUMERATOR); // Update default royalty receiver to new owner
    }

    /**
     * @dev Verify the Merkle proof for an address, index, and amount.
     * @param proof The Merkle proof.
     * @param index The index of the leaf in the Merkle tree.
     * @param amount The amount of tokens associated with the proof.
     * @param addr The address being verified.
     */
    function _verifyProof(bytes32[] memory proof, uint256 index, uint256 amount, address addr) private view {
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(addr, index, amount))));
        require(MerkleProof.verify(proof, merkleRoot, leaf), "Invalid proof");
    }

    /**
     * @dev Internal function to mint a new token.
     * Emits a Minted event when successful.
     */
    function _mint() internal {
        require(tokenIdCounter < MAX_SUPPLY, "the supply limit of 1000 is reached");
        uint256 tokenId = tokenIdCounter;
        tokenIdCounter += 1;
        _safeMint(msg.sender, tokenId);
        emit Minted(msg.sender);
    }
}
