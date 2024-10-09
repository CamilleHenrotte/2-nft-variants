const { network } = require("hardhat");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const args = ["rewardToken", "R"];
  await deploy("RewardToken", {
    from: deployer,
    args: args,
    log: true,
    gasLimit: 3000000,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  log("RewardToken Deployed!");
  log("----------------------------------------------------");
  log("----------------------------------------------------");
};
module.exports.tags = ["all", "rewardToken"];
