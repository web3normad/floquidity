import { useCallback } from 'react';
import { 
  useAccount, 
  useWriteContract, 
  useReadContract,
} from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ADDRESS } from '../utils/constants';
import { CONTRACT_ABI } from '../../ABI/floquidityABI';

export function useStrategyContractInteractions() {
  const { address } = useAccount();
  const { 
    writeContract, 
    isPending: isWritePending, 
    error: writeError 
  } = useWriteContract();

  // Read user strategies
  const { 
    data: userStrategies, 
    error: readError, 
    refetch: refetchStrategies 
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getUserStrategies',
    args: [address],
    query: { enabled: !!address }
  });

  // Deposit balance function
  const depositBalance = useCallback((amount: number) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'depositBalance',
      args: [parseEther(amount.toString())]
    });
  }, [writeContract]);

  // Execute strategy function
  const executeStrategy = useCallback((strategyId: string, amount: number) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'executeStrategy',
      args: [strategyId as `0x${string}`, parseEther(amount.toString())]
    });
  }, [writeContract]);

  // Set user risk profile
  const setUserRiskProfile = useCallback((riskTolerance: number, maxRiskExposure: number) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'setUserRiskProfile',
      args: [riskTolerance, parseEther(maxRiskExposure.toString())]
    });
  }, [writeContract]);

  // Register strategy
  const registerStrategy = useCallback((strategyDetails: {
    name: string,
    platform: string,
    chain: string,
    apy: number,
    riskLevel: string,
    aiConfidence: number
  }) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'registerStrategy',
      args: [
        strategyDetails.name, 
        strategyDetails.platform, 
        strategyDetails.chain, 
        strategyDetails.apy, 
        strategyDetails.riskLevel, 
        strategyDetails.aiConfidence
      ]
    });
  }, [writeContract]);

  // Toggle strategy status
  const toggleStrategyStatus = useCallback((strategyId: string, status: boolean) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'toggleStrategyStatus',
      args: [strategyId, status]
    });
  }, [writeContract]);

  return {
    depositBalance,
    executeStrategy,
    setUserRiskProfile,
    registerStrategy,
    toggleStrategyStatus,
    userStrategies,
    isWritePending,
    writeError,
    readError,
    refetchStrategies
  };
}