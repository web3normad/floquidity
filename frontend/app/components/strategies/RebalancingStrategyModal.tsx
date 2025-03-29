import React, { useState, useEffect } from 'react';
import { PlayCircle, RefreshCw, AlertCircle } from 'lucide-react';


interface RebalancingStrategyModalProps {
  currentPortfolio: Array<{
    token: string;
    amount: number;
    currentAllocation: number;
  }>;
  recommendedAllocation: Array<{
    token: string;
    idealAllocation: number;
  }>;
  onRebalance: (newAllocation: Array<{token: string, amount: number}>) => void;
}

const RebalancingStrategyModal: React.FC<RebalancingStrategyModalProps> = ({
  currentPortfolio,
  recommendedAllocation,
  onRebalance
}) => {
  const [potentialRebalancing, setPotentialRebalancing] = useState<Array<{
    token: string;
    currentAmount: number;
    currentAllocation: number;
    recommendedAllocation: number;
    amountToAdjust: number;
    direction: 'buy' | 'sell'
  }>>([]);

  const [totalPortfolioValue, setTotalPortfolioValue] = useState<number>(0);
  const [rebalancingCost, setRebalancingCost] = useState<number>(0);

  useEffect(() => {
    // Calculate total portfolio value
    const totalValue = currentPortfolio.reduce((sum, asset) => 
      sum + (asset.amount * asset.currentAllocation), 0);
    setTotalPortfolioValue(totalValue);

    // Compute rebalancing strategy
    const rebalancingStrategy = currentPortfolio.map(asset => {
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
    }).filter(Boolean);

    // Estimate rebalancing transaction costs (simulated)
    const estimatedCost = rebalancingStrategy.reduce((sum, strategy) => 
      sum + (strategy.amountToAdjust * 0.001), 0);  
    setRebalancingCost(estimatedCost);

    setPotentialRebalancing(rebalancingStrategy as any);
  }, [currentPortfolio, recommendedAllocation]);

  const handleRebalance = () => {
    const newAllocation = potentialRebalancing.map(strategy => ({
      token: strategy.token,
      amount: strategy.direction === 'buy' 
        ? strategy.currentAmount + (strategy.amountToAdjust / strategy.currentAllocation)
        : strategy.currentAmount - (strategy.amountToAdjust / strategy.currentAllocation)
    }));

    onRebalance(newAllocation);
  };

  return (
    <div className="bg-[#1a1a2e] rounded-2xl p-6 text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <RefreshCw className="mr-2 text-cyan-400" />
          Portfolio Rebalancing
        </h2>
        <div className="text-sm text-gray-400">
          Total Value: ${totalPortfolioValue.toLocaleString()}
        </div>
      </div>

      <div className="space-y-4">
        {potentialRebalancing.map(strategy => (
          <div 
            key={strategy.token} 
            className="bg-[#262642] rounded-xl p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{strategy.token}</p>
              <p className="text-sm text-gray-400">
                Current: {strategy.currentAllocation.toFixed(2)}% → 
                Recommended: {strategy.recommendedAllocation.toFixed(2)}%
              </p>
            </div>
            <div className={`font-bold ${
              strategy.direction === 'buy' ? 'text-green-400' : 'text-red-400'
            }`}>
              {strategy.direction === 'buy' ? '+' : '-'}
              ${strategy.amountToAdjust.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-[#262642] rounded-xl p-4 flex justify-between items-center">
        <div className="flex items-center text-yellow-400">
          <AlertCircle className="mr-2" />
          <p>Estimated Rebalancing Cost</p>
        </div>
        <p className="font-bold text-red-400">
          ${rebalancingCost.toFixed(2)}
        </p>
      </div>

      <button 
        onClick={handleRebalance}
        className="mt-4 w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-xl flex items-center justify-center"
      >
        <PlayCircle className="mr-2" />
        Execute Rebalancing
      </button>
    </div>
  );
};

export default RebalancingStrategyModal;