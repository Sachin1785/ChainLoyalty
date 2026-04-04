const hre = require("hardhat");

async function main() {
  // Default to 'monad-testnet' if no network is specified
  const network = hre.network.name || 'monad-testnet';
  if (network !== 'monad-testnet') {
    console.warn(`Warning: You are deploying to '${network}', not 'monad-testnet'.`);
  }
  console.log(`Deploying contracts to ${network} network...`);
  
  // Get the contract factories
  const LoyaltyPoints = await hre.ethers.getContractFactory("LoyaltyPoints");
  const LoyaltyBadge = await hre.ethers.getContractFactory("LoyaltyBadge");
  const RewardVault = await hre.ethers.getContractFactory("RewardVault");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy LoyaltyPoints
  console.log("Deploying LoyaltyPoints...");
  const loyaltyPoints = await LoyaltyPoints.deploy(
    "ChainLoyalty Points", 
    "CLP",                 
    0,                     
    false,                 
    deployer.address,      
    deployer.address       
  );
  await loyaltyPoints.waitForDeployment();
  const loyaltyPointsAddress = await loyaltyPoints.getAddress();
  console.log("✅ LoyaltyPoints deployed to:", loyaltyPointsAddress);

  // 2. Deploy LoyaltyBadge
  console.log("Deploying LoyaltyBadge...");
  const loyaltyBadge = await LoyaltyBadge.deploy(
    "ChainLoyalty Badge",  
    "CLB",                 
    deployer.address,      
    deployer.address       
  );
  await loyaltyBadge.waitForDeployment();
  const loyaltyBadgeAddress = await loyaltyBadge.getAddress();
  console.log("✅ LoyaltyBadge deployed to:", loyaltyBadgeAddress);

  // 3. Deploy RewardVault
  console.log("Deploying RewardVault...");
  const rewardVault = await RewardVault.deploy(
    deployer.address,      
    deployer.address,      
    loyaltyPointsAddress   
  );
  await rewardVault.waitForDeployment();
  const rewardVaultAddress = await rewardVault.getAddress();
  console.log("✅ RewardVault deployed to:", rewardVaultAddress);
  
  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log(`Network: ${network}`);
  console.log(`LoyaltyPoints: ${loyaltyPointsAddress}`);
  console.log(`LoyaltyBadge: ${loyaltyBadgeAddress}`);
  console.log(`RewardVault: ${rewardVaultAddress}`);

  console.log("\n📋 Add these to your .env file:");
  console.log(`LOYALTY_POINTS_ADDRESS="${loyaltyPointsAddress}"`);
  console.log(`LOYALTY_BADGE_ADDRESS="${loyaltyBadgeAddress}"`);
  console.log(`REWARD_VAULT_ADDRESS="${rewardVaultAddress}"`);

  // Write addresses to a file
  const fs = require('fs');
  const path = require('path');
  const outputPath = path.join(__dirname, 'deployed_contracts.txt');
  const output = [
    `# Deployment summary for network: ${network}`,
    `LoyaltyPoints: ${loyaltyPointsAddress}`,
    `LoyaltyBadge: ${loyaltyBadgeAddress}`,
    `RewardVault: ${rewardVaultAddress}`,
    `Deployed at: ${new Date().toISOString()}`,
    ''
  ].join('\n');
  fs.appendFileSync(outputPath, output);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});