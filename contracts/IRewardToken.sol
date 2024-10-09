// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface IRewardToken {
    /**
     * @notice Mints `amount` tokens to the `account`.
     * @param amount The number of tokens to mint.
     */
    function mint(uint256 amount) external;
}
