const { network } = require("hardhat");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const args = ["nft2", "nft2"];
  await deploy("NFT2", {
    from: deployer,
    args: args,
    log: true,
    gasLimit: 30000000,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  log("NFT2 Deployed!");
  log("----------------------------------------------------");
  log("----------------------------------------------------");
};
module.exports.tags = ["all", "nft2"];
