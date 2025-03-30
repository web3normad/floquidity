import React, { useState, useEffect } from 'react';
import { PlayCircle, RefreshCw, AlertCircle, X, Shield } from 'lucide-react';
import { rebalancingService } from '../../services/rebalancingService';

interface RebalancingStrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPortfolio: Array<{
    token: string;
    amount: number;
    allocation: number;
  }>;
  riskTolerance: 'low' | 'medium' | 'high';
  onRebalance: (newAllocation: Array<{token: string, amount: number}>) => void;
}

interface RebalancingStrategy {
  currentPortfolio: Array<{
    token: string;
    amount: number;
    allocation: number;
  }>;
  recommendedAllocation: Array<{
    token: string;
    idealAllocation: number;
  }>;
  rebalancingCost: number;
  potentialTaxImplications: number;
}

const RebalancingStrategyModal: React.FC<RebalancingStrategyModalProps> = ({
  isOpen,
  onClose,
  currentPortfolio,
  riskTolerance,
  onRebalance
}) => {
  const [strategy, setStrategy] = useState<RebalancingStrategy | null>(null);
  const [potentialRebalancing, setPotentialRebalancing] = useState<Array<{
    token: string;
    currentAmount: number;
    currentAllocation: number;
    recommendedAllocation: number;
    amountToAdjust: number;
    direction: 'buy' | 'sell'
  }>>([]);

  const [totalPortfolioValue, setTotalPortfolioValue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getRiskColor = (riskLevel: string) => {
    switch(riskLevel.toLowerCase()) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  
  useEffect(() => {
    if (!isOpen || !currentPortfolio.length) return;

    const generateStrategy = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        
        const strategyData = await rebalancingService.generateRebalancingStrategy(
          currentPortfolio, 
          riskTolerance
        );
        
        setStrategy(strategyData);
        
      
        const totalValue = currentPortfolio.reduce((sum, asset) => 
          sum + (asset.amount * asset.allocation), 0);
        setTotalPortfolioValue(totalValue);
        
      
        const rebalancingActions = currentPortfolio.map(asset => {
          const recommendedAsset = strategyData.recommendedAllocation.find(
            rec => rec.token === asset.token
          );

          if (!recommendedAsset) return null;

          const currentValue = asset.amount * asset.allocation;
          const recommendedValue = totalValue * (recommendedAsset.idealAllocation / 100);
          
          const amountToAdjust = Math.abs(recommendedValue - currentValue);
          const direction = recommendedValue > currentValue ? 'buy' : 'sell';

          return {
            token: asset.token,
            currentAmount: asset.amount,
            currentAllocation: (asset.allocation / totalValue) * 100, 
            recommendedAllocation: recommendedAsset.idealAllocation,
            amountToAdjust,
            direction
          };
        }).filter(Boolean);
        
        setPotentialRebalancing(rebalancingActions as any);
      } catch (err) {
        console.error('Error generating rebalancing strategy:', err);
        setError('Failed to generate rebalancing strategy. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    generateStrategy();
  }, [isOpen, currentPortfolio, riskTolerance]);

  const handleRebalance = async () => {
    if (!strategy) return;
    
    try {
      
      const newAllocation = potentialRebalancing.map(rebalancing => ({
        token: rebalancing.token,
        amount: rebalancing.direction === 'buy' 
          ? rebalancing.currentAmount + (rebalancing.amountToAdjust / rebalancing.currentAllocation * 100)
          : rebalancing.currentAmount - (rebalancing.amountToAdjust / rebalancing.currentAllocation * 100)
      }));

     
      onRebalance(newAllocation);
      
      
      onClose();
    } catch (err) {
      console.error('Error executing rebalancing:', err);
      setError('Failed to execute rebalancing. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#16213e] rounded-2xl p-6 text-white w-full max-w-2xl relative">
       
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <RefreshCw className="mr-2 text-cyan-400" />
            Portfolio Rebalancing
          </h2>
          <div className="flex items-center">
            <Shield className={`mr-2 w-5 h-5 ${getRiskColor(riskTolerance)}`} />
            <span className={`font-semibold ${getRiskColor(riskTolerance)}`}>
              {riskTolerance.charAt(0).toUpperCase() + riskTolerance.slice(1)} Risk Profile
            </span>
          </div>
        </div>
        
        <div className="text-sm text-gray-400 mb-4">
          Total Portfolio Value: ${totalPortfolioValue.toLocaleString()}
        </div>

        {isLoading ? (
          <div className="py-8 text-center">
            <RefreshCw className="animate-spin mx-auto mb-2 text-cyan-400" size={32} />
            <p>Generating optimal rebalancing strategy...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center text-red-400">
            <AlertCircle className="mx-auto mb-2" size={32} />
            <p>{error}</p>
            <button 
              onClick={() => setIsLoading(true)}
              className="mt-4 px-4 py-2 bg-[#1a2744] rounded-lg hover:bg-[#243256]"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
              {potentialRebalancing.map(rebalancing => (
                <div 
                  key={rebalancing.token} 
                  className="bg-[#1a2744] rounded-xl p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{rebalancing.token}</p>
                    <p className="text-sm text-gray-400">
                      Current: {rebalancing.currentAllocation.toFixed(2)}% → 
                      Recommended: {rebalancing.recommendedAllocation.toFixed(2)}%
                    </p>
                  </div>
                  <div className={`font-bold ${
                    rebalancing.direction === 'buy' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {rebalancing.direction === 'buy' ? '+' : '-'}
                    ${rebalancing.amountToAdjust.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-[#1a2744] rounded-xl p-4 flex justify-between items-center">
                <div className="flex items-center text-yellow-400">
                  <AlertCircle className="mr-2" />
                  <p>Estimated Rebalancing Cost</p>
                </div>
                <p className="font-bold text-red-400">
                  ${strategy?.rebalancingCost.toFixed(2)}
                </p>
              </div>
              
              <div className="bg-[#1a2744] rounded-xl p-4 flex justify-between items-center">
                <div className="flex items-center text-yellow-400">
                  <AlertCircle className="mr-2" />
                  <p>Potential Tax Implications</p>
                </div>
                <p className="font-bold text-red-400">
                  ${strategy?.potentialTaxImplications.toFixed(2)}
                </p>
              </div>
            </div>

            <button 
              onClick={handleRebalance}
              className="mt-4 w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-xl flex items-center justify-center"
            >
              <PlayCircle className="mr-2" />
              Execute Rebalancing
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RebalancingStrategyModal;