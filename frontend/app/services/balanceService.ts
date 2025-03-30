import { Address } from 'viem';
import axios from 'axios';

// Define interfaces for Balance Fetching
interface ChainBalanceConfig {
  name: string;
  chainId: number;
  nativeSymbol: string;
  coingeckoId: string;
}

interface BalanceResult {
  name: string;
  chainId: number;
  balanceInNative: string;
  balanceInUSD: number;
  nativeSymbol: string;
}

interface WalletBalancesResult {
  totalValue: number;
  chains: BalanceResult[];
}

// Supported chains configuration
const SUPPORTED_CHAINS: ChainBalanceConfig[] = [
  {
    name: 'Sepolia',
    chainId: 11155111,
    nativeSymbol: 'ETH',
    coingeckoId: 'ethereum'
  },
  {
    name: 'Arbitrum Sepolia',
    chainId: 421614,
    nativeSymbol: 'ETH',
    coingeckoId: 'ethereum'
  },
  {
    name: 'Optimism Sepolia',
    chainId: 11155420,
    nativeSymbol: 'ETH',
    coingeckoId: 'ethereum'
  },
  {
    name: 'Linea Sepolia',
    chainId: 59141,
    nativeSymbol: 'ETH',
    coingeckoId: 'ethereum'
  }
];

// Fetch current ETH price from CoinGecko
async function fetchEthPrice(): Promise<number> {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    return response.data.ethereum.usd;
  } catch (error) {
    console.error('Failed to fetch ETH price:', error);
    return 0;
  }
}

// Function to fetch wallet balances
export async function fetchWalletBalances(address?: Address): Promise<WalletBalancesResult> {
  if (!address) {
    throw new Error('Wallet address is required');
  }

 
  const currentEthPrice = await fetchEthPrice();

 
  const balancePromises = SUPPORTED_CHAINS.map(async (chain) => {
    try {
      
      const mockBalance = Math.random() * 0.1; 
      const balanceInUSD = mockBalance * currentEthPrice;

      return {
        name: chain.name,
        chainId: chain.chainId,
        balanceInNative: mockBalance.toFixed(4),
        balanceInUSD: balanceInUSD,
        nativeSymbol: chain.nativeSymbol
      };
    } catch (error) {
      console.error(`Error fetching balance for ${chain.name}:`, error);
      return {
        name: chain.name,
        chainId: chain.chainId,
        balanceInNative: '0',
        balanceInUSD: 0,
        nativeSymbol: chain.nativeSymbol
      };
    }
  });

  
  const balances = await Promise.all(balancePromises);

 
  const totalValue = balances.reduce((sum, balance) => sum + balance.balanceInUSD, 0);

  return {
    totalValue,
    chains: balances
  };
}