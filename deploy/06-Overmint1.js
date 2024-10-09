const { network } = require("hardhat")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const args = []
    await deploy("Overmint1", {
        from: deployer,
        args: args,
        log: true,
        gasLimit: 6000000,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    log("Overmint1 Deployed!")
    log("----------------------------------------------------")
    log("----------------------------------------------------")
}
module.exports.tags = ["all", "overmint1"]
