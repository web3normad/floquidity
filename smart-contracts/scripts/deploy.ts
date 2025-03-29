import { viem } from "hardhat";
import { parseEther } from "viem";
import "@nomicfoundation/hardhat-verify";

async function main() {
 
  const client = await viem.getPublicClient();
  

  const [deployer] = await viem.getWalletClients();

  console.log("Deploying contracts with the account:", deployer.account.address);


  const defiNaviDemo = await viem.deployContract("DeFiNaviDemo", []);

  console.log("DeFiNaviDemo deployed to:", defiNaviDemo.address);

 
  try {
    await hre.run("verify:verify", {
        address: defiNaviDemo.address,
        contract: "contracts/DeFiNaviDemo.sol:DeFiNaviDemo",
        constructorArguments: []
      });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.error("Verification failed:", error);
  }
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });