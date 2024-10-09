const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { expect } = require("chai")

describe("3- Overmint", () => {
    let deployerSigner, userSigner, attacker1, attacker2, attacker1Address, attacker2Address
    let overmint1Address, overmint2Address, overmint1, overmint2, overmint2User

    beforeEach(async () => {
        const { deployer, user1: user } = await getNamedAccounts() // Ensure you have the correct address in getNamedAccounts

        deployerSigner = await ethers.getSigner(deployer)
        userSigner = await ethers.getSigner(user)

        // Deploy the contracts using fixture
        await deployments.fixture(["all"])

        // Get contract addresses
        overmint1Address = (await deployments.get("Overmint1")).address
        overmint2Address = (await deployments.get("Overmint2")).address
        attacker1Address = (await deployments.get("Attacker1")).address
        attacker2Address = (await deployments.get("Attacker2")).address

        // Connect the contracts to signers
        overmint1 = await ethers.getContractAt("Overmint1", overmint1Address, deployerSigner)
        overmint2 = await ethers.getContractAt("Overmint2", overmint2Address, deployerSigner)
        attacker1 = await ethers.getContractAt("Attacker1", attacker1Address, deployerSigner)
        attacker2 = await ethers.getContractAt("Attacker2", attacker2Address, deployerSigner)

        overmint2User = await overmint2.connect(userSigner)
    })

    describe("Overmint1", () => {
        it("expecting success to be true if attack is successful", async () => {
            await attacker1.attack()
            const success = await overmint1.success(attacker1Address)
            expect(success).to.equal(true)
        })
    })

    describe("Overmint2", () => {
        it("expecting success to be true if attack is successful", async () => {
            await overmint2User.mint()
            await overmint2User.mint()
            await overmint2.mint()
            await overmint2.mint()
            await overmint2.mint()
            await overmint2User.transferFrom(userSigner.address, deployerSigner.address, 1)
            await overmint2User.transferFrom(userSigner.address, deployerSigner.address, 2)
            const success = await overmint2.success()
            expect(success).to.be.true
        })
    })
})
