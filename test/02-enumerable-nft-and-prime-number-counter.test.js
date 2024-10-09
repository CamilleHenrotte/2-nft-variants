const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { expect } = require("chai")

describe("2- Enumerable nfts and prime number counter", async () => {
    let deployerSigner, userSigner, nft, nftUser, counter, nftAddress

    beforeEach(async () => {
        const { deployer, user1: user } = await getNamedAccounts()

        deployerSigner = await ethers.getSigner(deployer)
        userSigner = await ethers.getSigner(user)

        await deployments.fixture(["all"])
        nftAddress = (await deployments.get("NFT2")).address
        nft = await ethers.getContractAt("NFT2", nftAddress, deployerSigner)
        counterAddress = (await deployments.get("CounterPrimeNumberTokenId")).address
        counter = await ethers.getContractAt("CounterPrimeNumberTokenId", counterAddress, deployerSigner)

        nftUser = nft.connect(userSigner)
    })
    describe(
        "NFT2",
        it(" mints all 100 tokens to the owner", async () => {
            const ownerOfToken1 = await nft.ownerOf(1)
            const ownerOfToken100 = await nft.ownerOf(100)
            expect(ownerOfToken1).to.equal(deployerSigner.address)
            expect(ownerOfToken100).to.equal(deployerSigner.address)
        })
    )
    describe("CounterPrimeNumberTokenId", () => {
        it("should return 25 for the number of prime numbers in the token ids of the owner", async () => {
            const numberOfPrimeNumberTokenIds = await counter.countPrimeNumberTokenId(
                deployerSigner.address,
                nftAddress
            )
            expect(numberOfPrimeNumberTokenIds).to.equal(25)
        })
        it("owner transfers token ids 10, 11, 12, 13, 14 to user the number of prime numbers in the token ids of the user should be 2 ", async () => {
            await nft.transferFrom(deployerSigner.address, userSigner.address, 10)
            await nft.transferFrom(deployerSigner.address, userSigner.address, 11)
            await nft.transferFrom(deployerSigner.address, userSigner.address, 12)
            await nft.transferFrom(deployerSigner.address, userSigner.address, 13)
            await nft.transferFrom(deployerSigner.address, userSigner.address, 14)
            const numberOfPrimeNumberTokenIds = await counter.countPrimeNumberTokenId(userSigner.address, nftAddress)
            expect(numberOfPrimeNumberTokenIds).to.equal(2)
        })
    })
})
