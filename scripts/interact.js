const hre = require("hardhat");
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

async function main() {
  const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  console.log("Connecting to CreditCardMerkleTree contract...");
  const CreditCardMerkleTree = await hre.ethers.getContractFactory("CreditCardMerkleTree");
  const contract = await CreditCardMerkleTree.attach(CONTRACT_ADDRESS);

  const sampleCreditCards = [
    "1234567890123456",
    "2345678901234567",
    "3456789012345678"
  ];

  console.log("Recreating Merkle tree...");
  const leaves = sampleCreditCards.map(card => keccak256(card));
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

  async function addCreditCard(cardNumber, expirationDate) {
    console.log(`Adding credit card: ${cardNumber}`);
    const hashedNumber = hre.ethers.utils.keccak256(hre.ethers.utils.toUtf8Bytes(cardNumber));
    const leaf = keccak256(cardNumber);
    const proof = tree.getHexProof(leaf);
    
    try {
      const tx = await contract.addCreditCard(hashedNumber, expirationDate, proof);
      await tx.wait();
      console.log("Credit card added successfully");
    } catch (error) {
      console.error("Failed to add credit card:", error.message);
    }
  }

  async function verifyCreditCard(cardNumber) {
    console.log(`Verifying credit card: ${cardNumber}`);
    const hashedNumber = hre.ethers.utils.keccak256(hre.ethers.utils.toUtf8Bytes(cardNumber));
    const leaf = keccak256(cardNumber);
    const proof = tree.getHexProof(leaf);
    
    try {
      const isValid = await contract.verifyCreditCard(hashedNumber, proof);
      console.log("Credit card is valid:", isValid);
    } catch (error) {
      console.error("Failed to verify credit card:", error.message);
    }
  }

  async function getCreditCardInfo(cardNumber) {
    console.log(`Getting info for credit card: ${cardNumber}`);
    const hashedNumber = hre.ethers.utils.keccak256(hre.ethers.utils.toUtf8Bytes(cardNumber));
    
    try {
      const [expirationDate, owner] = await contract.getCreditCardInfo(hashedNumber);
      console.log("Expiration date:", new Date(expirationDate.toNumber() * 1000).toLocaleDateString());
      console.log("Owner:", owner);
    } catch (error) {
      console.error("Failed to get credit card info:", error.message);
    }
  }

  // Example usage
  await addCreditCard("1234567890123456", Math.floor(Date.now() / 1000) + 31536000); // Expires in 1 year
  await verifyCreditCard("1234567890123456");
  await getCreditCardInfo("1234567890123456");
}

main()
  .then(() => console.log("Interaction complete"))
  .catch((error) => {
    console.error("Interaction failed:", error);
    process.exit(1);
  });
