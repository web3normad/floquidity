import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { metaMask } from 'wagmi/connectors';

export function useWeb3() {
  const { 
    connector: activeConnector, 
    isConnected, 
    address, 
    chain 
  } = useAccount();

  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const connectWallet = () => {
    const metaMaskConnector = connectors.find(
      (connector) => connector.id === 'metaMask'
    );

    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector });
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return {
    isConnected,
    address: address ? formatAddress(address) : null,
    fullAddress: address,
    chain,
    connectWallet,
    disconnect,
  };
}