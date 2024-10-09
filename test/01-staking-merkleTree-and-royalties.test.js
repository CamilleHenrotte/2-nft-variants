const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { expect } = require("chai")
const MINTING_PRICE = ethers.parseEther("0.1")
const DISCOUNTED_MINTING_PRICE = ethers.parseEther("0.05")
const DEFAULT_ROYALTY_AMOUNT = ethers.parseEther("0.0025")
const SET_ROYALTY_AMOUNT = ethers.parseEther("0.005")

describe("1- Merkle tree discount, royalties and staking", async () => {
    let deployerSigner, regularUserSigner, userWithDiscountSigner, nftRegularUser, nftUserWithDiscount, nft, nft1Address

    beforeEach(async () => {
        const { deployer, user1: regularUser, user2: userWithDiscount } = await getNamedAccounts()

        deployerSigner = await ethers.getSigner(deployer)
        regularUserSigner = await ethers.getSigner(regularUser)
        userWithDiscountSigner = await ethers.getSigner(userWithDiscount)

        await deployments.fixture(["all"])
        nft1Address = (await deployments.get("NFT1")).address
        nft = await ethers.getContractAt("NFT1", nft1Address, deployerSigner)

        nftRegularUser = nft.connect(regularUserSigner)
        nftUserWithDiscount = nft.connect(userWithDiscountSigner)
    })

    describe("Merkle tree discount", () => {
        it("minting should revert if it is the wrong amount", async () => {
            await expect(nftRegularUser.mint({ value: DISCOUNTED_MINTING_PRICE })).to.be.revertedWith(
                "wrong amount, send 0.1 ETH"
            )
        })
        it("regular user should be able to mint a token for 0.1 ETH", async () => {
            await nftRegularUser.mint({ value: MINTING_PRICE })
            const balanceRegularUser = await nftRegularUser.balanceOf(regularUserSigner.address)
            expect(balanceRegularUser).to.be.equal(1)
            const contractBalance = await ethers.provider.getBalance(nft1Address)
            expect(contractBalance).to.equal(MINTING_PRICE)
        })
        it("regular user should not be able to mint with a discount", async () => {
            await expect(
                nftRegularUser.mintWithDiscount(
                    [
                        "0x68e70e602c1e40c237fd5767c6c84d5e4823c508813c69ddae4e2fbe28669d0b",
                        "0x678a1756e98255e37c4e45d999148104d0bc6882d8ded52c8ef8dacc7f84a60c",
                        "0xe548821e71fc5892ead3ac5a26ea57763a41760c034569496ed284cf7af3d815",
                    ],
                    0,
                    2,
                    { value: DISCOUNTED_MINTING_PRICE }
                )
            ).to.be.revertedWith("Invalid proof")
        })
        it("minting with discount should revert if it is the wrong amount", async () => {
            await expect(
                nftRegularUser.mintWithDiscount(
                    [
                        "0x68e70e602c1e40c237fd5767c6c84d5e4823c508813c69ddae4e2fbe28669d0b",
                        "0x678a1756e98255e37c4e45d999148104d0bc6882d8ded52c8ef8dacc7f84a60c",
                        "0xe548821e71fc5892ead3ac5a26ea57763a41760c034569496ed284cf7af3d815",
                    ],
                    0,
                    2,
                    { value: MINTING_PRICE }
                )
            ).to.be.revertedWith("wrong amount, send 0.05 ETH")
        })
        it("user with discount privileges should be able to mint two token for 0.05 ETH each", async () => {
            await nftUserWithDiscount.mintWithDiscount(
                [
                    "0x68e70e602c1e40c237fd5767c6c84d5e4823c508813c69ddae4e2fbe28669d0b",
                    "0x678a1756e98255e37c4e45d999148104d0bc6882d8ded52c8ef8dacc7f84a60c",
                    "0xe548821e71fc5892ead3ac5a26ea57763a41760c034569496ed284cf7af3d815",
                ],
                0,
                2,
                { value: DISCOUNTED_MINTING_PRICE }
            )
            const balanceUserWithDiscount = await nftUserWithDiscount.balanceOf(userWithDiscountSigner.address)
            expect(balanceUserWithDiscount).to.be.equal(2)
            const contractBalance = await ethers.provider.getBalance(nft1Address)
            expect(contractBalance).to.equal(DISCOUNTED_MINTING_PRICE)
        })
        it("user with discount privileges should not be able to mint anymore once he has minted has used his privilege", async () => {
            await nftUserWithDiscount.mintWithDiscount(
                [
                    "0x68e70e602c1e40c237fd5767c6c84d5e4823c508813c69ddae4e2fbe28669d0b",
                    "0x678a1756e98255e37c4e45d999148104d0bc6882d8ded52c8ef8dacc7f84a60c",
                    "0xe548821e71fc5892ead3ac5a26ea57763a41760c034569496ed284cf7af3d815",
                ],
                0,
                2,
                { value: DISCOUNTED_MINTING_PRICE }
            )
            await expect(
                nftUserWithDiscount.mintWithDiscount(
                    [
                        "0x68e70e602c1e40c237fd5767c6c84d5e4823c508813c69ddae4e2fbe28669d0b",
                        "0x678a1756e98255e37c4e45d999148104d0bc6882d8ded52c8ef8dacc7f84a60c",
                        "0xe548821e71fc5892ead3ac5a26ea57763a41760c034569496ed284cf7af3d815",
                    ],
                    0,
                    2,
                    { value: DISCOUNTED_MINTING_PRICE }
                )
            ).to.be.revertedWith("Discount already claimed")
            const balanceUserWithDiscount = await nftUserWithDiscount.balanceOf(userWithDiscountSigner.address)
            expect(balanceUserWithDiscount).to.be.equal(2)
        })
    })
    describe("Royalties", () => {
        beforeEach(async () => {
            await nftRegularUser.mint({ value: MINTING_PRICE })
        })
        it(" transferFromWithRoyalties should revert if insufficient amount is sent", async () => {
            const [receiver, royaltyAmount] = await nftRegularUser.royaltyInfo(0, MINTING_PRICE)
            expect(receiver).to.equal(deployerSigner.address)
            expect(royaltyAmount).to.equal(DEFAULT_ROYALTY_AMOUNT)

            await expect(
                nftRegularUser.transferFromWithRoyalties(
                    regularUserSigner.address,
                    userWithDiscountSigner.address,
                    0,
                    MINTING_PRICE,
                    { value: ethers.parseEther("0.000005") }
                )
            ).to.be.revertedWith("Insufficient royalty amount")
        })
        it(" transferFromWithRoyalties should send the default royalties to the contract and the owner should be able to withdraw it", async () => {
            const [receiver, royaltyAmount] = await nftRegularUser.royaltyInfo(0, MINTING_PRICE)
            expect(receiver).to.equal(deployerSigner.address)
            expect(royaltyAmount).to.equal(DEFAULT_ROYALTY_AMOUNT)
            await nftRegularUser.transferFromWithRoyalties(
                regularUserSigner.address,
                userWithDiscountSigner.address,
                0,
                MINTING_PRICE,
                { value: DEFAULT_ROYALTY_AMOUNT }
            )
            const contractBalance = await ethers.provider.getBalance(nft1Address)

            expect(contractBalance).to.equal(MINTING_PRICE + DEFAULT_ROYALTY_AMOUNT)
        })
        it("transferFromWithRoyalties should send the set royalties royalties to the owner", async () => {
            await nft.setTokenRoyalty(0, deployerSigner.address, 500)
            const [receiver, royaltyAmount] = await nftRegularUser.royaltyInfo(0, MINTING_PRICE)
            expect(receiver).to.equal(deployerSigner.address)
            expect(royaltyAmount).to.equal(SET_ROYALTY_AMOUNT)
            await nftRegularUser.transferFromWithRoyalties(
                regularUserSigner.address,
                userWithDiscountSigner.address,
                0,
                MINTING_PRICE,
                { value: SET_ROYALTY_AMOUNT }
            )
            const contractBalance = await ethers.provider.getBalance(nft1Address)
            expect(contractBalance).to.equal(MINTING_PRICE + SET_ROYALTY_AMOUNT)
        })
        it("owner should be able to withdraw the funds", async () => {
            const contractBalanceBefore = await ethers.provider.getBalance(nft1Address)
            expect(contractBalanceBefore).to.equal(MINTING_PRICE)
            await nft.withdrawFunds()
            const contractBalanceAfter = await ethers.provider.getBalance(nft1Address)
            expect(contractBalanceAfter).to.equal(0)
        })
    })
    describe("Staking", () => {
        let staking, stakingRegularUser, stakingAddress
        beforeEach(async () => {
            stakingAddress = (await deployments.get("Staking")).address
            staking = await ethers.getContractAt("Staking", stakingAddress, deployerSigner)
            stakingRegularUser = staking.connect(regularUserSigner)
            await nftRegularUser.mint({ value: MINTING_PRICE })
        })
        it("staking contract receives the nft", async () => {
            expect(await nftRegularUser.safeTransferFrom(regularUserSigner.address, stakingAddress, 0)).to.emit(
                "NFTStaked"
            )
            const stakeOwner = await stakingRegularUser.getStakeOwner(0)
            const stakeTimestamp = await stakingRegularUser.getStakeTimestamp(0)
            const ownerOfToken0 = await nftRegularUser.ownerOf(0)
            expect(ownerOfToken0).to.equal(stakingAddress)
            expect(stakeOwner).to.equal(regularUserSigner.address)
            expect(stakeTimestamp).to.be.greaterThan(0)
        })
        it("user claims the rewards after staking for 2 days", async () => {
            expect(await nftRegularUser.safeTransferFrom(regularUserSigner.address, stakingAddress, 0)).to.emit(
                "NFTStaked"
            )
            await ethers.provider.send("evm_increaseTime", [2 * 86400])
            await ethers.provider.send("evm_mine")
            expect(await stakingRegularUser.withdrawRewards(0)).to.emit("RewardsMinted")
        })
        it("user withdraws nft", async () => {
            expect(await nftRegularUser.safeTransferFrom(regularUserSigner.address, stakingAddress, 0)).to.emit(
                "NFTStaked"
            )
            const stakeOwner = await stakingRegularUser.getStakeOwner(0)
            const stakeTimestamp = await stakingRegularUser.getStakeTimestamp(0)
            const ownerOfToken0 = await nftRegularUser.ownerOf(0)
            expect(ownerOfToken0).to.equal(stakingAddress)
            expect(stakeOwner).to.equal(regularUserSigner.address)
            expect(stakeTimestamp).to.be.greaterThan(0)
            expect(await stakingRegularUser.withdrawNft(0)).to.emit("NFTWithdrawn")
            const stakeOwnerAfter = await stakingRegularUser.getStakeOwner(0)
            const stakeTimestampAfter = await stakingRegularUser.getStakeTimestamp(0)
            const ownerOfToken0After = await nftRegularUser.ownerOf(0)
            expect(ownerOfToken0After).to.equal(regularUserSigner.address)
            expect(stakeOwnerAfter).to.equal("0x0000000000000000000000000000000000000000")
            expect(stakeTimestampAfter).to.equal(0)
        })
    })
})
