const hre = require("hardhat");

async function main() {
  console.log("Deploying Referral contract...");
  
  // Get the contract factory
  const Referral = await hre.ethers.getContractFactory("Referral");
  
  // Deploy the contract
  const referral = await Referral.deploy(); 
  
  await referral.waitForDeployment();
  
  const referralAddress = await referral.getAddress();
  
  console.log("Referral Contract with Self Protocol (Anti-Sybil) deployed to:", referralAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
