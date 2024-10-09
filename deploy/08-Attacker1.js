const { network } = require("hardhat")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const overmint1Address = (await deployments.get("Overmint1")).address
    const args = [overmint1Address]
    await deploy("Attacker1", {
        from: deployer,
        args: args,
        log: true,
        gasLimit: 6000000,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    log("Attacker1 Deployed!")
    log("----------------------------------------------------")
    log("----------------------------------------------------")
}
module.exports.tags = ["all", "attacker1"]
