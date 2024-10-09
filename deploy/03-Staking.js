const { network } = require("hardhat");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const nft1Address = (await deployments.get("NFT1")).address;
  const rewardTokenAddress = (await deployments.get("RewardToken")).address;
  const args = [nft1Address, rewardTokenAddress];
  await deploy("Staking", {
    from: deployer,
    args: args,
    log: true,
    gasLimit: 3000000,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  log("Staking Deployed!");
  log("----------------------------------------------------");
  log("----------------------------------------------------");
};
module.exports.tags = ["all", "staking"];
