"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  TrendingUp,
  RefreshCw,
  ChevronDown,
  ArrowUpRight,
  UploadCloud,
  PlayCircle,
} from "lucide-react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { injected } from "wagmi/connectors";
import { useCallback } from "react";
import { parseEther } from "viem";

import { fetchWalletBalances } from '../services/balanceService';


// Contract interaction hook
import { useDashboardContractInteractions } from "../hooks/useDashboard";

// Contract constants
import { CONTRACT_ADDRESS } from "../utils/constants";
import { CONTRACT_ABI } from "../../ABI/floquidityABI";

// Layout Components
import Navbar from "../components/layout/Navbar";

// Type definitions for Portfolio Data
interface ChainData {
  name: string;
  value: number;
  color: string;
  chainId: number;
}

interface StrategyData {
  id: string;
  name: string;
  apy: number;
  platform: string;
}

interface PortfolioData {
  totalValue: number;
  chains: ChainData[];
  topStrategies: StrategyData[];
}

const Dashboard: React.FC = () => {
  const [activeChain, setActiveChain] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyData | null>(
    null
  );
  const [isDepositPending, setIsDepositPending] = useState(false);

  // Wagmi hooks
  const { address, isConnected, chain: currentChain } = useAccount();
  const { connect, connectors } = useConnect({
    connector: injected(),
  });
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  // Contract interactions hook
  const {
    userStrategies,
    depositBalance,
    executeStrategy,
    strategiesError,
    depositError,
    executeStrategyError,
    refetchStrategies,
  } = useDashboardContractInteractions();

  // Initial Portfolio Data
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    totalValue: 0,
    chains: [
      { name: "Sepolia", value: 0, color: "bg-blue-500", chainId: 11155111 },
      {
        name: "Arbitrum Sepolia",
        value: 0,
        color: "bg-green-500",
        chainId: 421614,
      },
      {
        name: "Optimism Sepolia",
        value: 0,
        color: "bg-purple-500",
        chainId: 11155420,
      },
      { name: "Linea Sepolia", value: 0, color: "bg-pink-500", chainId: 59141 },
    ],
    topStrategies: [
      { id: "0x1", name: "Curve 3Pool", apy: 6.45, platform: "Curve Finance" },
      { id: "0x2", name: "Aave V3 USDC", apy: 4.87, platform: "Aave" },
      {
        id: "0x3",
        name: "Uniswap V3 ETH/USDC",
        apy: 12.34,
        platform: "Uniswap",
      },
    ],
  });

  // Fetch balances across different chains
  const fetchPortfolioBalances = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      const balanceData = await fetchWalletBalances(address);

      // Update portfolio data with fetched balances
      const updatedChains = portfolioData.chains.map((chain) => {
        const fetchedChainData = balanceData.chains.find(
          (fetchedChain) => fetchedChain.name === chain.name
        );

        return {
          ...chain,
          value: fetchedChainData ? fetchedChainData.balanceInUSD : 0,
        };
      });

      setPortfolioData((prev) => ({
        ...prev,
        totalValue: balanceData.totalValue,
        chains: updatedChains,
      }));
    } catch (error) {
      console.error("Failed to fetch portfolio balances", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Change Network
  const handleNetworkChange = async (chainId: number) => {
    try {
     
      if (currentChain?.id !== chainId) {
        await switchChain({ chainId });
      }
    } catch (error) {
      console.error("Failed to switch network", error);
      alert(`Failed to switch to the selected network. Please try again.`);
    }
  };

  // Wallet Connection
  const connectWallet = () => {
    const injectedConnector = connectors.find(
      (connector) => connector.id === "injected"
    );

    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };

  // Refresh Portfolio
  const refreshPortfolio = () => {
    fetchPortfolioBalances();
    refetchStrategies();
  };

  // Handle Deposit
  const handleDeposit = async () => {
    if (!depositAmount) return;
    
    try {
      setIsDepositPending(true);
      const amountToDeposit = parseFloat(depositAmount);
      await depositBalance(amountToDeposit);
      setDepositAmount(''); // Clear input after deposit
    } catch (error) {
      console.error('Deposit failed', error);
    } finally {
      setIsDepositPending(false);
    }
  };

  // Handle Strategy Execution
  const handleStrategyExecution = async () => {
    if (!selectedStrategy || !depositAmount) return;

    try {
      const amountToInvest = parseFloat(depositAmount);
      await executeStrategy(selectedStrategy.id, amountToInvest);
      setDepositAmount(""); // Clear input after execution
      setSelectedStrategy(null); // Reset selected strategy
    } catch (error) {
      console.error("Strategy execution failed", error);
    }
  };

  // Fetch balances on connection and chain change
  useEffect(() => {
    if (isConnected) {
      fetchPortfolioBalances();
    }
  }, [isConnected, address, currentChain]);

  // Update strategies when user strategies are fetched
  useEffect(() => {
    if (userStrategies) {
      console.log("User Strategies:", userStrategies);
    }
  }, [userStrategies]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1020] via-[#16213e] to-[#1a1a2e] text-white">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        {/* Wallet Connection */}
        {!isConnected ? (
          <div className="mb-8 flex justify-center">
            <button
              onClick={connectWallet}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-xl flex items-center space-x-2 transition-all"
            >
              <Wallet className="w-5 h-5" />
              <span>Connect Wallet</span>
            </button>
          </div>
        ) : (
          <div className="mb-4 flex justify-between items-center">
            <div className="text-gray-300">
              Connected: {address?.substring(0, 6)}...
              {address?.substring(address.length - 4)}
              {currentChain && ` on ${currentChain.name}`}
            </div>
            <div className="flex space-x-4">
              <button
                onClick={refreshPortfolio}
                disabled={isLoading}
                className={`text-cyan-400 hover:text-cyan-300 flex items-center ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                {isLoading ? "Refreshing..." : "Refresh Portfolio"}
              </button>
              <button
                onClick={() => disconnect()}
                className="text-red-400 hover:text-red-300 flex items-center"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Portfolio Overview */}
          <div className="md:col-span-2 bg-[#16213e] rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
                Portfolio Overview
              </h2>
              <select
                value={activeChain}
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  setActiveChain(selectedValue);

                  if (selectedValue === "all") {
                    return;
                  }

                  const selectedChain = portfolioData.chains.find(
                    (chain) => chain.name.toLowerCase() === selectedValue
                  );

                  if (selectedChain) {
                    handleNetworkChange(selectedChain.chainId);
                  }
                }}
                className="bg-[#1a1a2e] text-white px-3 py-1 rounded-md"
              >
                <option value="all">All Chains</option>
                {portfolioData.chains.map((chain) => (
                  <option key={chain.name} value={chain.name.toLowerCase()}>
                    {chain.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Total Portfolio Value */}
              <div className="bg-[#1a1a2e] rounded-xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">
                      Total Portfolio Value
                    </p>
                    <h3 className="text-3xl font-bold text-white">
                      ${portfolioData.totalValue.toLocaleString()}
                    </h3>
                  </div>
                  <Wallet className="w-10 h-10 text-cyan-400" />
                </div>
                <div className="flex items-center text-green-400">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  <span>+3.45% (24h)</span>
                </div>

                {/* Deposit Section */}
                <div className="mt-4">
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="Enter deposit amount"
                      className="w-full bg-[#262642] text-white px-3 py-2 rounded-md"
                    />
                    <button
                      onClick={handleDeposit}
                      disabled={isDepositPending}
                      className={`bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md flex items-center ${
                        isDepositPending ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isDepositPending ? "Depositing..." : "Deposit"}
                    </button>
                  </div>
                  {depositError && (
                    <p className="text-red-400 text-sm mt-2">
                      Deposit Error: {depositError.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Chain Distribution */}
              <div className="bg-[#1a1a2e] rounded-xl p-5">
                <p className="text-gray-400 text-sm mb-4">Chain Distribution</p>
                <div className="space-y-2">
                  {portfolioData.chains.map((chain) => (
                    <div key={chain.name} className="flex items-center">
                      <div
                        className={`w-3 h-3 ${chain.color} rounded-full mr-3`}
                      ></div>
                      <div className="flex justify-between w-full">
                        <span>{chain.name}</span>
                        <span>${chain.value.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Strategies */}
          <div className="bg-[#16213e] rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
                Top Strategies
              </h2>
              <button className="text-gray-400 hover:text-white">
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {portfolioData.topStrategies.map((strategy) => (
                <div
                  key={strategy.id}
                  className={`bg-[#1a1a2e] rounded-xl p-4 hover:bg-[#262642] transition-colors ${
                    selectedStrategy?.id === strategy.id
                      ? "border-2 border-cyan-500"
                      : ""
                  }`}
                  onClick={() => setSelectedStrategy(strategy)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{strategy.name}</h3>
                      <p className="text-gray-400 text-sm">
                        {strategy.platform}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold">
                        {strategy.apy}% APY
                      </p>
                      <button
                        className="text-blue-400 text-sm flex items-center"
                        onClick={() => {
                          setSelectedStrategy(strategy);
                        }}
                      >
                        Select <ArrowUpRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Strategy Execution Section */}
              {selectedStrategy && (
                <div className="mt-4 bg-[#262642] rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Execute {selectedStrategy.name} Strategy
                  </h3>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="Enter strategy amount"
                      className="w-full bg-[#1a1a2e] text-white px-3 py-2 rounded-md"
                    />
                    <button
                      onClick={handleStrategyExecution}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center"
                    >
                      <PlayCircle className="w-5 h-5 mr-2" />
                      Execute
                    </button>
                  </div>
                  {executeStrategyError && (
                    <p className="text-red-400 text-sm mt-2">
                      Strategy Error: {executeStrategyError.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
