// src/components/strategies/ImpermanentLossCalculator.tsx
import React, { useState } from 'react';
import { useImpermanentLossCalculator } from '../../hooks/useImpermanentLossCalculator';
import { Token } from '../../types/ImpermanentLoss';
import { 
  AlertTriangle, 
  Info, 
  TrendingUp, 
  TrendingDown 
} from 'lucide-react';

interface ImpermanentLossCalculatorProps {
  initialTokens: [Token, Token];
}

export const ImpermanentLossCalculator: React.FC<ImpermanentLossCalculatorProps> = ({ 
  initialTokens 
}) => {
  const [tokens, setTokens] = useState<[Token, Token]>(initialTokens);
  const [liquidityAmount, setLiquidityAmount] = useState(0);
  const { calculateImpermanentLoss, loading, error, result } = useImpermanentLossCalculator();



  const handleCalculate = () => {
    calculateImpermanentLoss({
      token0: tokens[0],
      token1: tokens[1],
      initialPrice0: tokens[0].price,
      initialPrice1: tokens[1].price,
      currentPrice0: tokens[0].price, 
      currentPrice1: tokens[1].price, 
      liquidityAmount
    });
  };
  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'Low': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'High': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-[#16213e] rounded-2xl p-6 text-white">
      <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
        Impermanent Loss Calculator
      </h2>

        {/* Token Inputs */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
        {tokens.map((token, index) => (
          <div key={token.symbol} className="bg-[#1a1a2e] p-3 rounded-md">
            <label className="block text-sm mb-2">
              {index === 0 ? 'Token A' : 'Token B'} Price
            </label>
            <input
              type="number"
              value={token.price ?? 0} // Use 0 as fallback
              onChange={(e) => {
                const newTokens = [...tokens];
                newTokens[index] = {
                  ...newTokens[index],
                  price: e.target.value === '' ? 0 : parseFloat(e.target.value)
                };
                setTokens(newTokens as [Token, Token]);
              }}
              className="w-full bg-[#262642] text-white px-3 py-2 rounded-md"
            />
          </div>
        ))}
      </div>

      {/* Liquidity Amount */}
      <div className="mb-4">
        <label className="block text-sm mb-2">Liquidity Amount</label>
        <input
          type="number"
          value={liquidityAmount}
          onChange={(e) => setLiquidityAmount(
            e.target.value === '' ? 0 : parseFloat(e.target.value)
          )}
          className="w-full bg-[#1a1a2e] text-white px-3 py-2 rounded-md"
        />
      </div>

      {/* Calculate Button */}
      <button
        onClick={handleCalculate}
        disabled={loading}
        className={`w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-md 
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Calculating...' : 'Calculate Impermanent Loss'}
      </button>

      {/* Results */}
      {result && (
        <div className="mt-6 bg-[#1a1a2e] p-4 rounded-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Impermanent Loss Analysis</h3>
            <span className={`flex items-center ${getRiskColor(result.potentialRisk)}`}>
              {result.potentialRisk} Risk 
              {result.potentialRisk === 'Low' && <Info className="ml-2" />}
              {result.potentialRisk === 'Medium' && <AlertTriangle className="ml-2" />}
              {result.potentialRisk === 'High' && <AlertTriangle className="ml-2" />}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400">Current Pool Value</p>
              <p className="text-white font-bold">${result.currentValue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400">Hold Value</p>
              <p className="text-white font-bold">${result.holdValue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400">Impermanent Loss</p>
              <p className={`font-bold ${
                result.impermanentLossPercentage < 0 ? 'text-red-400' : 'text-green-400'
              }`}>
                {result.impermanentLossPercentage.toFixed(2)}%
                {result.impermanentLossPercentage < 0 ? (
                  <TrendingDown className="inline ml-2" />
                ) : (
                  <TrendingUp className="inline ml-2" />
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Recommended Action</p>
              <p className="text-white">{result.recommendedAction}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Handling */}
      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};