// components/strategies/StrategyDetailsModal.tsx
import React from 'react';
import { AIGeneratedStrategy } from '../../services/ai';
import { 
  Cpu, 
  Shield,
  BarChart4,
  Check,
  AlertCircle,
  X
} from 'lucide-react';

interface StrategyDetailsModalProps {
  strategy: AIGeneratedStrategy;
  onClose: () => void;
}

const StrategyDetailsModal: React.FC<StrategyDetailsModalProps> = ({ 
  strategy, 
  onClose 
}) => {
  const getRiskColor = (riskLevel: string) => {
    switch(riskLevel.toLowerCase()) {
      case 'low': return 'text-green-400 border-green-400';
      case 'medium': return 'text-yellow-400 border-yellow-400';
      case 'high': return 'text-red-400 border-red-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getProsAndCons = (strategy: AIGeneratedStrategy) => {
    // This would ideally come from the AI, but for now we'll generate based on risk level
    const pros = [];
    const cons = [];
    
    // Common pros/cons
    pros.push('AI-optimized for current market conditions');
    
    // Risk-based pros/cons
    if (strategy.riskLevel.toLowerCase() === 'low') {
      pros.push('Lower volatility exposure', 'Capital preservation focus', 'Consistent yield generation');
      cons.push('Lower potential returns', 'May underperform in bull markets', 'Less exposure to market upside');
    } else if (strategy.riskLevel.toLowerCase() === 'medium') {
      pros.push('Balanced risk/reward profile', 'Moderate growth potential', 'Some capital protection mechanisms');
      cons.push('Some exposure to market volatility', 'Moderate complexity', 'Requires periodic rebalancing');
    } else {
      pros.push('High yield potential', 'Maximum exposure to market upside', 'Aggressive growth strategy');
      cons.push('Higher volatility exposure', 'Potential for significant drawdowns', 'Requires active management');
    }
    
    // Platform-specific
    if (strategy.platform.toLowerCase().includes('curve')) {
      pros.push('Low slippage for stablecoin swaps');
      cons.push('Exposure to smart contract risk');
    } else if (strategy.platform.toLowerCase().includes('aave')) {
      pros.push('Overcollateralized lending reduces default risk');
      cons.push('Variable interest rates may fluctuate');
    } else if (strategy.platform.toLowerCase().includes('uniswap')) {
      pros.push('High liquidity for major pairs');
      cons.push('Impermanent loss risk during volatility');
    } else if (strategy.platform.toLowerCase().includes('gmx')) {
      pros.push('Reduced MEV exposure');
      cons.push('Higher complexity trading strategy');
    }
    
    return { pros, cons };
  };
  
  const { pros, cons } = getProsAndCons(strategy);
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#16213e] rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">{strategy.name}</h2>
            <p className="text-gray-400">{strategy.platform} • {strategy.chain}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700 rounded-full p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#1a2744] rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3 text-white">Strategy Overview</h3>
            <p className="text-gray-300 mb-4">{strategy.description}</p>
            
            <div className="flex items-center mb-2">
              <BarChart4 className="text-green-400 mr-2 w-5 h-5" />
              <span className="text-green-400 font-bold">{strategy.apy.toFixed(2)}% APY</span>
            </div>
            
            <div className="flex items-center mb-2">
              <Shield className={`mr-2 w-5 h-5 ${getRiskColor(strategy.riskLevel)}`} />
              <span className={`font-semibold ${getRiskColor(strategy.riskLevel)}`}>
                {strategy.riskLevel} Risk Profile
              </span>
            </div>
            
            <div className="flex items-center">
              <Cpu className="text-blue-400 mr-2 w-5 h-5" />
              <span className="text-blue-400">
                AI Confidence: {strategy.aiConfidence}%
              </span>
            </div>
          </div>
          
          <div className="bg-[#1a2744] rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3 text-white">Implementation Details</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Platform: <span className="text-white">{strategy.platform}</span></li>
              <li>• Network: <span className="text-white">{strategy.chain}</span></li>
              <li>• Type: <span className="text-white">
                {strategy.platform.includes('Curve') ? 'Liquidity Provision' : 
                 strategy.platform.includes('Aave') ? 'Lending' : 
                 strategy.platform.includes('Uniswap') ? 'AMM LP' : 
                 strategy.platform.includes('GMX') ? 'Perpetual Trading' : 
                 'Yield Optimization'}
              </span></li>
              <li>• Estimated Gas Cost: <span className="text-white">
                {strategy.chain === 'Ethereum' ? 'Medium-High' : 'Low'}
              </span></li>
              <li>• Optimal Holding Period: <span className="text-white">
                {strategy.riskLevel === 'Low' ? '3+ months' : 
                 strategy.riskLevel === 'Medium' ? '1-3 months' : 
                 '2-4 weeks'}
              </span></li>
            </ul>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#1a2744] rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3 text-green-400">Pros</h3>
            <ul className="space-y-2">
              {pros.map((pro, index) => (
                <li key={index} className="flex items-start">
                  <Check className="text-green-400 mr-2 w-4 h-4 mt-1" />
                  <span className="text-gray-300">{pro}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-[#1a2744] rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3 text-red-400">Cons</h3>
            <ul className="space-y-2">
              {cons.map((con, index) => (
                <li key={index} className="flex items-start">
                  <AlertCircle className="text-red-400 mr-2 w-4 h-4 mt-1" />
                  <span className="text-gray-300">{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <a 
            href="#" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            onClick={(e) => {
              e.preventDefault();
              // This would ideally link to a detailed tutorial page
              alert('Tutorial functionality would be implemented here');
            }}
          >
            View Implementation Guide
          </a>
          
          <button 
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md"
            onClick={() => {
              // This would ideally trigger an implementation action
              alert('Strategy implementation would be triggered here');
              onClose();
            }}
          >
            Deploy Strategy
          </button>
        </div>
      </div>
    </div>
  );
};

export default StrategyDetailsModal;