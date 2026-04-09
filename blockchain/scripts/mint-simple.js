const hre = require("hardhat");
const SimpleBadgeABI = require("../../backend/lib/abis/SimpleBadge.json");

async function main() {
  // Address from contract.txt
  const contractAddress = "0x377d6eB8787d3AD3fDba74Fb8c3B019F1A14c749";

  console.log(`Attaching to SimpleBadge at ${contractAddress}...`);
  
  // Get the default signer from Hardhat config
  const [signer] = await hre.ethers.getSigners();
  
  if (!signer) {
    console.error("No signer found. Make sure your hardhat.config.js has accounts configured.");
    return;
  }

  // Create a contract instance
  const simpleBadge = new hre.ethers.Contract(contractAddress, SimpleBadgeABI.abi, signer);
  
  // The parameters for the safeMint function
  const toAddress = "0xE9356DB88faE28a221D4476239E65F0610BEf8D7";
  const tokenUri = "ipfs://QmYourMetadataHashHere"; // Placeholder URI

  console.log(`Minting NFT to ${toAddress} with URI: ${tokenUri}...`);
  try {
    const tx = await simpleBadge.safeMint(toAddress, tokenUri);
    console.log(`Transaction sent: ${tx.hash}`);

    console.log("Waiting for confirmation...");
    const receipt = await tx.wait();
    
    console.log(`NFT minted successfully!`);
    console.log(`Block number: ${receipt.blockNumber}`);
  } catch (error) {
    console.error("Error minting the NFT:", error.reason || error.message || error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
