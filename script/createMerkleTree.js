const { StandardMerkleTree } = require("@openzeppelin/merkle-tree")
const fs = require("fs")

async function createMerkleTree() {
    // (1)
    const values = [
        ["0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", "0", "2"],
        ["0x0000000000000000000000000000000000000002", "1", "2"],
        ["0x0000000000000000000000000000000000000003", "2", "2"],
        ["0x0000000000000000000000000000000000000004", "3", "2"],
        ["0x0000000000000000000000000000000000000005", "4", "2"],
        ["0x0000000000000000000000000000000000000006", "5", "2"],
        ["0x0000000000000000000000000000000000000007", "6", "2"],
        ["0x0000000000000000000000000000000000000008", "7", "2"],
    ]

    // (2)
    const tree = StandardMerkleTree.of(values, ["address", "uint256", "uint256"])

    // (3)
    console.log("Merkle Root:", tree.root)

    // (4)
    fs.writeFileSync("tree.json", JSON.stringify(tree.dump()))
}

createMerkleTree()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
