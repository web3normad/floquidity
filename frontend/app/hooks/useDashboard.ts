import { useCallback } from 'react';
import {
    useAccount,
    useWriteContract,
    useReadContract
} from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ADDRESS } from '../utils/constants';
import { CONTRACT_ABI } from '../../ABI/floquidityABI';

export function useDashboardContractInteractions() {
    const { address } = useAccount();

    // Read user strategies
    const {
        data: userStrategies,
        error: strategiesError,
        refetch: refetchStrategies
    } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI[0], 
        functionName: 'getUserStrategies',
        args: [address],
        query: { enabled: !!address }
    });

    // Deposit balance function
    const {
        writeContract,
        isPending: isDepositPending,
        error: depositError
    } = useWriteContract();

    // Execute strategy function
    const {
        writeContract: executeStrategyContract,
        isPending: isExecutePending,
        error: executeStrategyError
    } = useWriteContract();

    // Deposit funds to the contract
    const depositBalance = useCallback((amount: number) => {
        try {
           
            const amountStr = amount.toFixed(18);
            writeContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI[0], 
                functionName: 'depositBalance',
                args: [parseEther(amountStr)]
            });
        } catch (error) {
            console.error('Deposit error:', error);
        }
    }, [writeContract]);

    // Execute a specific investment strategy
    const executeStrategy = useCallback((strategyId: string, amount: number) => {
        try {
           
            const amountStr = amount.toFixed(18);
            executeStrategyContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI[0], 
                functionName: 'executeStrategy',
                args: [
                    strategyId as `0x${string}`, 
                    parseEther(amountStr)
                ]
            });
        } catch (error) {
            console.error('Strategy execution error:', error);
        }
    }, [executeStrategyContract]);

    return {
       
        userStrategies: userStrategies as string[] | undefined,

      
        depositBalance,
        executeStrategy,

       
        strategiesError,
        depositError,
        executeStrategyError,

       
        isDepositPending,
        isExecutePending,

      
        refetchStrategies
    };
}