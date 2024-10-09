const { StandardMerkleTree } = require("@openzeppelin/merkle-tree")
const fs = require("fs")

async function loadMerkleTreeAndGetProof() {
    // (1) Load the Merkle tree from a JSON file
    const tree = StandardMerkleTree.load(JSON.parse(fs.readFileSync("tree.json")))

    // (2) Iterate over the entries in the tree
    for (const [i, v] of tree.entries()) {
        if (v[0] === "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC") {
            // (3) Get and display the proof for the entry
            const proof = tree.getProof(i)
            console.log("Value:", v)
            console.log("Proof:", proof)
        }
    }
}

// Call the function
loadMerkleTreeAndGetProof()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
