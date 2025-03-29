'use client'

import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import { ImpermanentLossCalculator } from '../components/strategies/ImpermanentLossCalculator';
import RebalancingStrategyModal from '../components/strategies/RebalancingStrategyModal';
import StrategyDetailsModal from '../components/strategies/StrategyDetailsModal';
import { generateDeFiStrategies, AIGeneratedStrategy, UserPortfolioItem } from '../services/ai';
import { useAccount } from 'wagmi';
import { 
  Cpu, 
  Shield, 
  Filter, 
  ArrowUpRight,
  ZoomIn,
  Calculator,
  RefreshCw,
  Loader2
} from 'lucide-react';

// Define types for chain and risk level
type ChainType = 'all' | 'ethereum' | 'arbitrum' | 'optimism' | 'linea';
type RiskLevelType = 'all' | 'low' | 'medium' | 'high';

// Define type for token in Impermanent Loss Calculator
interface InitialToken {
  symbol: string;
  address: string;
  price: number;
}

// Define types for rebalancing components
interface PortfolioItem {
  token: string;
  amount: number;
  currentAllocation: number;
}

interface RecommendedAllocation {
  token: string;
  idealAllocation: number;
}

// Mock data interface
interface StrategiesData {
  strategies: AIGeneratedStrategy[];
  chains: string[];
  riskLevels: string[];
}

const AIStrategies: React.FC = () => {
  const [selectedChain, setSelectedChain] = useState<ChainType>('all');
  const [isRebalancingModalOpen, setIsRebalancingModalOpen] = useState(false);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<RiskLevelType>('all');
  const [isImpermanentLossModalOpen, setIsImpermanentLossModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [strategies, setStrategies] = useState<AIGeneratedStrategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<AIGeneratedStrategy | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [useMockData, setUseMockData] = useState(false);
  
  const { address, isConnected } = useAccount();

  // Preset tokens for Impermanent Loss Calculator
  const initialTokens: InitialToken[] = [
    {
      symbol: 'ETH',
      address: '0x...',
      price: 2000
    },
    {
      symbol: 'USDC',
      address: '0x...',
      price: 1
    }
  ];

  // Mock user portfolio for demo
  const mockUserPortfolio: UserPortfolioItem[] = [
    { token: 'ETH', amount: 5, chain: 'Ethereum' },
    { token: 'USDC', amount: 10000, chain: 'Arbitrum' },
    { token: 'WBTC', amount: 0.25, chain: 'Optimism' },
    { token: 'AAVE', amount: 20, chain: 'Ethereum' }
  ];

  // Open strategy details modal
  const openStrategyDetails = (strategy: AIGeneratedStrategy) => {
    setSelectedStrategy(strategy);
    setIsDetailsModalOpen(true);
  };

  // Function to fetch strategies from AI
  const fetchAIStrategies = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // For hackathon, you can use mock data if API isn't ready
      // In production, this would fetch real portfolio data
      const userPortfolio = mockUserPortfolio;
      
      const riskMap: Record<RiskLevelType, 'low' | 'medium' | 'high'> = {
        'all': 'medium',
        'low': 'low',
        'medium': 'medium',
        'high': 'high'
      };
      
      if (useMockData) {
        // Use mock data for testing or if OpenAI API key is not configured
        console.log('Using mock data for strategies');
        setTimeout(() => {
          setStrategies(strategiesData.strategies);
          setIsLoading(false);
        }, 1000); // Simulate loading
        return;
      }
      
      const aiStrategies = await generateDeFiStrategies({
        userPortfolio,
        riskTolerance: riskMap[selectedRiskLevel],
        investmentGoal: 'Maximize yield while maintaining liquidity'
      });
      
      if (aiStrategies && aiStrategies.length > 0) {
        setStrategies(aiStrategies);
      } else {
        throw new Error('No strategies returned from AI');
      }
    } catch (err) {
      console.error('Failed to generate AI strategies:', err);
      setError('Failed to generate AI strategies. Please try again or check your API key.');
      
      // Only use fallback if we have an error
      setStrategies(strategiesData.strategies);
      
      // Set flag to use mock data on subsequent requests to avoid repeated errors
      setUseMockData(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for AI strategies (fallback)
  const strategiesData: StrategiesData = {
    strategies: [
      {
        name: 'Curve 3Pool Yield Optimizer',
        platform: 'Curve Finance',
        chain: 'Ethereum',
        apy: 6.45,
        riskLevel: 'Low',
        description: 'AI-driven liquidity provision strategy maximizing stable coin yields with minimal volatility.',
        aiConfidence: 92
      },
      {
        name: 'Aave V3 USDC Lending',
        platform: 'Aave',
        chain: 'Arbitrum',
        apy: 4.87,
        riskLevel: 'Low',
        description: 'Intelligent lending strategy targeting optimal USDC lending rates across multiple markets.',
        aiConfidence: 88
      },
      {
        name: 'Uniswap V3 ETH/USDC Dynamic',
        platform: 'Uniswap',
        chain: 'Optimism',
        apy: 12.34,
        riskLevel: 'Medium',
        description: 'Advanced AI-powered concentrated liquidity strategy adapting to market volatility.',
        aiConfidence: 85
      },
      {
        name: 'GMX Perpetual Hedging',
        platform: 'GMX',
        chain: 'Arbitrum',
        apy: 18.65,
        riskLevel: 'High',
        description: 'Sophisticated AI-managed perpetual trading strategy with dynamic risk management.',
        aiConfidence: 79
      }
    ],
    chains: ['All', 'Ethereum', 'Arbitrum', 'Optimism', 'Linea'],
    riskLevels: ['All', 'Low', 'Medium', 'High']
  };

  // Effect to fetch strategies when filters change
  useEffect(() => {
    fetchAIStrategies();
  }, [selectedChain, selectedRiskLevel]);

  // Filter strategies based on selected chain and risk level
  const filteredStrategies = strategies.filter(strategy => 
    (selectedChain === 'all' || strategy.chain.toLowerCase() === selectedChain.toLowerCase()) &&
    (selectedRiskLevel === 'all' || strategy.riskLevel.toLowerCase() === selectedRiskLevel.toLowerCase())
  );

  const getRiskColor = (riskLevel: string) => {
    switch(riskLevel.toLowerCase()) {
      case 'low': return 'text-green-400 border-green-400';
      case 'medium': return 'text-yellow-400 border-yellow-400';
      case 'high': return 'text-red-400 border-red-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1020] via-[#16213e] to-[#1a1a2e] text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <section className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
            AI Strategy Engine
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Leverage cutting-edge AI to discover, analyze, and optimize your DeFi yield strategies across multiple chains.
          </p>
        </section>

        {/* Wallet Connection Notice */}
        {!isConnected && (
          <div className="bg-blue-500/20 rounded-lg p-4 mb-8 text-center">
            <p className="text-blue-400">Connect your wallet to get personalized AI strategy recommendations</p>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center items-center mb-8">
            <Loader2 className="animate-spin text-cyan-400 mr-2" />
            <span className="text-cyan-400">Generating intelligent strategies for you...</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 rounded-lg p-4 mb-8 text-center">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={fetchAIStrategies}
              className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Utility Buttons */}
        <div className='flex justify-center space-x-4 mb-8'>
          {/* Impermanent Loss Calculator Button */}
          <button 
            onClick={() => setIsImpermanentLossModalOpen(true)}
            className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-md"
          >
            <Calculator className="mr-2" /> Impermanent Loss Calculator
          </button>

          {/* Rebalancing Button */}
          <button 
            onClick={() => setIsRebalancingModalOpen(true)}
            className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-md"
          >
            <RefreshCw className="mr-2" /> Portfolio Rebalancing
          </button>
        </div>

        {/* Impermanent Loss Calculator Modal */}
        {isImpermanentLossModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-2xl">
              <button 
                onClick={() => setIsImpermanentLossModalOpen(false)}
                className="absolute top-2 right-2 text-white bg-red-500 hover:bg-red-600 rounded-full p-2"
              >
                Close
              </button>
              <ImpermanentLossCalculator initialTokens={initialTokens} />
            </div>
          </div>
        )}

        {/* Rebalancing Modal */}
        {isRebalancingModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-2xl">
              <button 
                onClick={() => setIsRebalancingModalOpen(false)}
                className="absolute top-2 right-2 text-white bg-red-500 hover:bg-red-600 rounded-full p-2"
              >
                Close
              </button>
              <RebalancingStrategyModal 
                currentPortfolio={[
                  // Example portfolio data
                  { token: 'ETH', amount: 10, currentAllocation: 50 },
                  { token: 'USDC', amount: 5000, currentAllocation: 50 }
                ]}
                recommendedAllocation={[
                  // Example recommended allocation
                  { token: 'ETH', idealAllocation: 60 },
                  { token: 'USDC', idealAllocation: 40 }
                ]}
                onRebalance={(newAllocation) => {
                  // Handle rebalancing logic
                  console.log('New Portfolio Allocation:', newAllocation);
                  setIsRebalancingModalOpen(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Strategy Details Modal */}
        {isDetailsModalOpen && selectedStrategy && (
          <StrategyDetailsModal 
            strategy={selectedStrategy}
            onClose={() => setIsDetailsModalOpen(false)}
          />
        )}

        {/* Filters */}
        <div className="flex justify-center space-x-4 mb-8">
          <div className="flex items-center space-x-2">
            <Filter className="text-cyan-400" />
            <select 
              value={selectedChain} 
              onChange={(e) => setSelectedChain(e.target.value as ChainType)}
              className="bg-[#16213e] text-white px-4 py-2 rounded-md"
            >
              {strategiesData.chains.map(chain => (
                <option key={chain.toLowerCase()} value={chain.toLowerCase()}>
                  {chain}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Shield className="text-blue-400" />
            <select 
              value={selectedRiskLevel} 
              onChange={(e) => setSelectedRiskLevel(e.target.value as RiskLevelType)}
              className="bg-[#16213e] text-white px-4 py-2 rounded-md"
            >
              {strategiesData.riskLevels.map(level => (
                <option key={level.toLowerCase()} value={level.toLowerCase()}>
                  {level} Risk
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* AI Personalization Summary */}
        {isConnected && !isLoading && !error && (
          <div className="bg-blue-500/10 rounded-lg p-4 mb-8">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">AI Strategy Insights</h3>
            <p className="text-gray-300">
              Based on your portfolio composition, current market conditions, and selected risk tolerance, 
              our AI has identified {filteredStrategies.length} optimal strategies for you.
            </p>
          </div>
        )}

        {/* Strategies Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStrategies.map((strategy, index) => (
            <div 
              key={index} 
              className="bg-[#16213e] rounded-2xl p-6 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{strategy.name}</h3>
                  <p className="text-gray-400 text-sm">{strategy.platform}</p>
                </div>
                <span 
                  className={`border ${getRiskColor(strategy.riskLevel)} px-2 py-1 rounded-full text-xs font-bold`}
                >
                  {strategy.riskLevel} Risk
                </span>
              </div>

              <p className="text-gray-300 mb-4">{strategy.description}</p>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-green-400 font-bold text-lg">{strategy.apy.toFixed(2)}% APY</p>
                  <div className="flex items-center text-blue-400 text-sm">
                    <Cpu className="w-4 h-4 mr-1" />
                    AI Confidence: {strategy.aiConfidence}%
                  </div>
                </div>
                <button 
                  onClick={() => openStrategyDetails(strategy)}
                  className="text-cyan-400 hover:text-cyan-500 flex items-center"
                >
                  Strategy Details <ArrowUpRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {!isLoading && filteredStrategies.length === 0 && (
          <div className="text-center py-12">
            <ZoomIn className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
            <p className="text-xl text-gray-300">
              No strategies found matching your current filters.
            </p>
          </div>
        )}

        {/* Refresh Strategies Button */}
        <div className="mt-8 text-center">
          <button
            onClick={fetchAIStrategies}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md flex items-center mx-auto"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : <RefreshCw className="mr-2" />}
            Regenerate AI Strategies
          </button>
        </div>
      </main>
    </div>
  );
};

export default AIStrategies;