import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";


import "@nomicfoundation/hardhat-verify";


import "dotenv/config";


const config: HardhatUserConfig & { 
  etherscan?: {
    apiKey?: Record<string, string>;
    customChains?: Array<{
      network: string;
      chainId: number;
      urls: {
        apiURL: string;
        browserURL: string;
      }
    }>;
  };
} = {
  solidity: "0.8.28",
  networks: {
    linea_sepolia: {
      url: "https://rpc.sepolia.linea.build/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 59141
    },
    linea_mainnet: {
      url: "https://rpc.linea.build/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 59144
    }
  },
  etherscan: {
    apiKey: {
      linea_sepolia: process.env.LINEASCAN_API_KEY || "",
      linea_mainnet: process.env.LINEASCAN_API_KEY || ""
    },
    customChains: [
      {
        network: "linea_sepolia",
        chainId: 59141,
        urls: {
          apiURL: "https://api-sepolia.lineascan.build/api",
          browserURL: "https://sepolia.lineascan.build/"
        }
      },
      {
        network: "linea_mainnet",
        chainId: 59144,
        urls: {
          apiURL: "https://api.lineascan.build/api",
          browserURL: "https://lineascan.build/"
        }
      }
    ]
  }
};

export default config;