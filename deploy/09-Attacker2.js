const { network } = require("hardhat")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const overmint2Address = (await deployments.get("Overmint2")).address
    const args = [overmint2Address]
    await deploy("Attacker2", {
        from: deployer,
        args: args,
        log: true,
        gasLimit: 6000000,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    log("Attacker2 Deployed!")
    log("----------------------------------------------------")
    log("----------------------------------------------------")
}
module.exports.tags = ["all", "attacker2"]
