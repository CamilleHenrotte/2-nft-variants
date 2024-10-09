const { network } = require("hardhat")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const args = ["", "0xf9cabdf2866fb628f0ec2285e2b084cbc48e5184ecf1b2d925be8088bfd16120"]
    await deploy("NFT1", {
        from: deployer,
        args: args,
        log: true,
        gasLimit: 6000000,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    log("NFT1 Deployed!")
    log("----------------------------------------------------")
    log("----------------------------------------------------")
}
module.exports.tags = ["all", "nft1"]
