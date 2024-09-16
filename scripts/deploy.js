const hre = require("hardhat");
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

async function main() {
  console.log("Starting deployment process...");

 
  const sampleCreditCards = [
    "1234567890123456",
    "2345678901234567",
    "3456789012345678"
  ];

  console.log("Creating Merkle tree...");
  const leaves = sampleCreditCards.map(card => keccak256(card));
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const root = tree.getRoot();

  console.log("Deploying CreditCardMerkleTree contract...");
  const CreditCardMerkleTree = await hre.ethers.getContractFactory("CreditCardMerkleTree");
  const contract = await CreditCardMerkleTree.deploy('0x' + root.toString('hex'));

  await contract.deployed();

  console.log("CreditCardMerkleTree deployed to:", contract.address);
  console.log("Merkle root:", '0x' + root.toString('hex'));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
