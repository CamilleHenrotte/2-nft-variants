// SPDX-License-Identifier: MIT
pragma solidity =0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title RewardToken
 * @dev Implementation of a standard ERC20 token with an adjustable initial supply. This contract allows the deployer
 * to mint a fixed amount of tokens at deployment, which are credited to the deployer's address.
 *
 * Inherits from OpenZeppelin's ERC20 contract for full compatibility with the ERC20 standard.
 */
contract RewardToken is ERC20 {
    /**
     * @notice Constructor to initialize the token with a name, symbol, and initial supply.
     * @dev Mints the `initialSupply` to the deployer's address. The `initialSupply` is multiplied by 10^decimals to
     * account for the token's smallest units.
     *
     * @param name_ The name of the token (e.g., "MyToken").
     * @param symbol_ The symbol of the token (e.g., "MTK").
    
     */
    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {}

    function mint(uint256 amount) external {
        _mint(msg.sender, amount);
    }
}
