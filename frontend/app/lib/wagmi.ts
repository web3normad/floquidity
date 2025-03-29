import { createConfig, http } from 'wagmi'
import { sepolia, arbitrumSepolia, optimismSepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

// Custom Linea Sepolia configuration
const lineaSepolia = {
  id: 59141,
  name: 'Linea Sepolia Testnet',
  network: 'linea-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.sepolia.linea.build'],
    },
    public: {
      http: ['https://rpc.sepolia.linea.build'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'Linea Sepolia Scan', 
      url: 'https://sepolia.lineascan.build' 
    },
  },
}

export const config = createConfig({
  chains: [sepolia, arbitrumSepolia, optimismSepolia, lineaSepolia],
  connectors: [
    injected(),
  ],
  transports: {
    [sepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [optimismSepolia.id]: http(),
    [lineaSepolia.id]: http(),
  },
})