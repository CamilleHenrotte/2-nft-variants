const { network } = require("hardhat");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const args = [];
  await deploy("CounterPrimeNumberTokenId", {
    from: deployer,
    args: args,
    log: true,
    gasLimit: 6000000,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  log("CounterPrimeNumberTokenId Deployed!");
  log("----------------------------------------------------");
  log("----------------------------------------------------");
};
module.exports.tags = ["all", "counterPrimeNumberTokenId"];
