import { useState, useCallback } from 'react';

interface Asset {
  token: string;
  amount: number;
  currentAllocation: number;
}

interface RecommendedAllocation {
  token: string;
  idealAllocation: number;
}

export const useRebalancingStrategy = () => {
  const [rebalancingStrategy, setRebalancingStrategy] = useState<{
    potentialRebalancing: Array<{
      token: string;
      currentAmount: number;
      currentAllocation: number;
      recommendedAllocation: number;
      amountToAdjust: number;
      direction: 'buy' | 'sell';
    }>;
    totalPortfolioValue: number;
    rebalancingCost: number;
  }>({
    potentialRebalancing: [],
    totalPortfolioValue: 0,
    rebalancingCost: 0
  });

  const calculateRebalancingStrategy = useCallback(
    (
      currentPortfolio: Asset[], 
      recommendedAllocation: RecommendedAllocation[]
    ) => {
      // Calculate total portfolio value
      const totalValue = currentPortfolio.reduce((sum, asset) => 
        sum + (asset.amount * asset.currentAllocation), 0);

      // Compute rebalancing strategy
      const potentialRebalancing = currentPortfolio.map(asset => {
        const recommendedAsset = recommendedAllocation.find(
          rec => rec.token === asset.token
        );

        if (!recommendedAsset) return null;

        const currentValue = asset.amount * asset.currentAllocation;
        const recommendedValue = totalValue * (recommendedAsset.idealAllocation / 100);
        
        const amountToAdjust = Math.abs(recommendedValue - currentValue);
        const direction = recommendedValue > currentValue ? 'buy' : 'sell';

        return {
          token: asset.token,
          currentAmount: asset.amount,
          currentAllocation: asset.currentAllocation,
          recommendedAllocation: recommendedAsset.idealAllocation,
          amountToAdjust,
          direction
        };
      }).filter(Boolean) as any;

      // Estimate rebalancing transaction costs (simulated)
      const rebalancingCost = potentialRebalancing.reduce((sum, strategy) => 
        sum + (strategy.amountToAdjust * 0.001), 0);  // 0.1% transaction fee

      const strategyData = {
        potentialRebalancing,
        totalPortfolioValue: totalValue,
        rebalancingCost
      };

      setRebalancingStrategy(strategyData);

      return strategyData;
    }, 
    []
  );

  const executeRebalancing = useCallback(
    (newAllocation: Array<{token: string, amount: number}>) => {
      // Placeholder for actual rebalancing logic
      // In a real-world scenario, this would interact with smart contracts
      console.log('Executing rebalancing:', newAllocation);
      return newAllocation;
    },
    []
  );

  return { 
    rebalancingStrategy, 
    calculateRebalancingStrategy,
    executeRebalancing 
  };
};