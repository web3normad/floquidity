"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  TrendingUp,
  RefreshCw,
  ChevronDown,
  ArrowUpRight,
  PlayCircle,
  ExternalLink,
  Clock,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { injected } from "wagmi/connectors";
import { parseEther } from "viem";

import { fetchWalletBalances } from '../services/balanceService';

// React-Toastify imports
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Contract interaction hook
import { useDashboardContractInteractions } from "../hooks/useDashboard";

// Navbar component
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
  lastUpdated?: string;
}

interface PortfolioData {
  totalValue: number;
  chains: ChainData[];
  topStrategies: StrategyData[];
}

// New type definition for transactions
interface Transaction {
  id: string;
  type: 'deposit' | 'strategy';
  amount: number;
  timestamp: string;
  strategy?: StrategyData;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
}

// New type for user investments
interface Investment {
  id: string;
  strategyId: string;
  strategyName: string;
  platform: string;
  amount: number;
  currentValue: number;
  apy: number;
  startDate: string;
  chain: string;
}

const Dashboard: React.FC = () => {
  const [activeChain, setActiveChain] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyData | null>(
    null
  );
  const [isDepositPending, setIsDepositPending] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoadingStrategies, setIsLoadingStrategies] = useState(false);
  
  // New states for transactions and investments
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);

  // Wagmi hooks
  const { address, isConnected, chain: currentChain } = useAccount();
  const { connect, connectors } = useConnect();
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
      { 
        id: "0x0000000000000000000000000000000000000000000000000000000000000001", 
        name: "Curve 3Pool", 
        apy: 6.45, 
        platform: "Curve Finance",
        lastUpdated: new Date().toISOString()
      },
      { 
        id: "0x0000000000000000000000000000000000000000000000000000000000000002", 
        name: "Aave V3 USDC", 
        apy: 4.87, 
        platform: "Aave",
        lastUpdated: new Date().toISOString()
      },
      {
        id: "0x0000000000000000000000000000000000000000000000000000000000000003",
        name: "Uniswap V3 ETH/USDC",
        apy: 12.34,
        platform: "Uniswap",
        lastUpdated: new Date().toISOString()
      },
    ],
  });

  // Set mounted state to true after component mounts on the client
  useEffect(() => {
    setMounted(true);
    // Initial fetch of strategies
    fetchStrategies();
    // Load transactions from localStorage
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    // Load investments from localStorage
    const savedInvestments = localStorage.getItem('investments');
    if (savedInvestments) {
      setInvestments(JSON.parse(savedInvestments));
    }
  }, []);

  // Save transactions to localStorage when they change
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('transactions', JSON.stringify(transactions));
    }
  }, [transactions]);

  // Save investments to localStorage when they change
  useEffect(() => {
    if (investments.length > 0) {
      localStorage.setItem('investments', JSON.stringify(investments));
    }
  }, [investments]);

  // Fetch strategies from API
  const fetchStrategies = async () => {
    setIsLoadingStrategies(true);
    
    try {
      // Try a different API endpoint - DefiLlama's yield API with better error handling
      const response = await fetch('https://yields.llama.fi/pools');
      const data = await response.json();
      
      console.log("API Response structure:", data);
      
      // Check if data has the expected structure
      if (!data || !data.data || !Array.isArray(data.data)) {
        console.error("Unexpected API response structure:", data);
        toast.error("Invalid data format from API");
        return;
      }
      
      // Filter out unreasonably high APYs
      const strategies = data.data
        .filter(pool => 
          pool.apy !== undefined && 
          pool.apy > 0 && 
          pool.apy < 50) // Only realistic APYs
        .slice(0, 5)
        .map(pool => ({
          id: pool.pool || `strategy-${Math.random().toString(36).substring(2, 9)}`,
          name: pool.symbol || pool.name || "Unknown Strategy",
          apy: parseFloat((pool.apy).toFixed(2)),
          platform: pool.project || "DeFi Platform",
          lastUpdated: new Date().toISOString()
        }));
      
      if (strategies.length === 0) {
        // Fallback to simulated data if no valid strategies were found
        toast.info("Using demo data - couldn't find valid strategies");
        
        const demoStrategies = [
          { id: "aave-usdc", name: "USDC Deposit", apy: 3.8, platform: "Aave", lastUpdated: new Date().toISOString() },
          { id: "comp-dai", name: "DAI Lending", apy: 2.9, platform: "Compound", lastUpdated: new Date().toISOString() },
          { id: "curve-3pool", name: "3Pool LP", apy: 4.2, platform: "Curve Finance", lastUpdated: new Date().toISOString() }
        ];
        
        setPortfolioData(prev => ({
          ...prev,
          topStrategies: demoStrategies
        }));
      } else {
        setPortfolioData(prev => ({
          ...prev,
          topStrategies: strategies
        }));
      }
    } catch (error) {
      console.error("Failed to fetch strategies", error);
      toast.error("Failed to fetch strategies");
      
      // Fallback to simulated data on error
      const fallbackStrategies = [
        { id: "aave-usdc", name: "USDC Deposit", apy: 3.8, platform: "Aave", lastUpdated: new Date().toISOString() },
        { id: "comp-dai", name: "DAI Lending", apy: 2.9, platform: "Compound", lastUpdated: new Date().toISOString() },
        { id: "curve-3pool", name: "3Pool LP", apy: 4.2, platform: "Curve Finance", lastUpdated: new Date().toISOString() }
      ];
      
      setPortfolioData(prev => ({
        ...prev,
        topStrategies: fallbackStrategies
      }));
    } finally {
      setIsLoadingStrategies(false);
    }
  };

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
      toast.error("Failed to fetch portfolio balances");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock transaction hash
  const generateTxHash = () => {
    return "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  };

  // Get chain explorer URL based on current chain
  const getChainExplorerUrl = (txHash: string) => {
    if (!currentChain) return '#';
    
    const explorerUrls = {
      11155111: `https://sepolia.etherscan.io/tx/${txHash}`,
      421614: `https://sepolia-explorer.arbitrum.io/tx/${txHash}`,
      11155420: `https://sepolia-optimism.etherscan.io/tx/${txHash}`,
      59141: `https://sepolia.lineascan.build/tx/${txHash}`,
    };
    
    // @ts-ignore
    return explorerUrls[currentChain.id] || '#';
  };

  // Change Network
  const handleNetworkChange = async (chainId: number) => {
    try {
      if (currentChain?.id !== chainId) {
        await switchChain({ chainId });
        const networkName = portfolioData.chains.find(chain => chain.chainId === chainId)?.name || 'new network';
        toast.success(`Switched to ${networkName}`);
      }
    } catch (error: any) {
      console.error("Failed to switch network", error);
      // Check if user rejected the request
      if (error.message && error.message.includes("rejected")) {
        toast.error("Network switch canceled");
      } else {
        toast.error("Failed to switch network");
      }
    }
  };

  // Wallet Connection
  const connectWallet = async () => {
    const injectedConnector = connectors.find(
      (connector) => connector.id === "injected"
    );

    if (injectedConnector) {
      try {
        toast.info("Connecting wallet...");
        await connect({ connector: injectedConnector });
        toast.success("Wallet connected successfully!");
      } catch (error: any) {
        toast.error("Failed to connect wallet");
        console.error("Wallet connection error:", error);
      }
    }
  };

  // Refresh Portfolio
  const refreshPortfolio = async () => {
    try {
      toast.info("Refreshing portfolio...");
      await Promise.all([fetchPortfolioBalances(), refetchStrategies(), fetchStrategies()]);
      
      // Update investment values
      if (investments.length > 0) {
        const updatedInvestments = investments.map(investment => {
          // Simulate investment growth based on APY and time elapsed
          const startDate = new Date(investment.startDate);
          const currentDate = new Date();
          const timeElapsedInYears = (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
          
          // Simple compound interest calculation
          const growthFactor = 1 + (investment.apy / 100 * timeElapsedInYears);
          const updatedValue = investment.amount * growthFactor;
          
          return {
            ...investment,
            currentValue: Number(updatedValue.toFixed(2))
          };
        });
        
        setInvestments(updatedInvestments);
      }
      
      toast.success("Portfolio refreshed!");
    } catch (error) {
      toast.error("Failed to refresh portfolio");
      console.error("Refresh error:", error);
    }
  };

  // Handle Deposit
  const handleDeposit = async () => {
    if (!depositAmount) {
      toast.error("Please enter a deposit amount");
      return;
    }
    
    try {
      setIsDepositPending(true);
      const amountToDeposit = parseFloat(depositAmount);
      
      toast.info("Processing deposit...");
      
      try {
        await depositBalance(amountToDeposit);
        
        // Generate a mock transaction hash
        const txHash = generateTxHash();
        
        // Record the transaction
        const newTransaction: Transaction = {
          id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          type: 'deposit',
          amount: amountToDeposit,
          timestamp: new Date().toISOString(),
          status: 'completed',
          txHash: txHash
        };
        
        setTransactions(prev => [newTransaction, ...prev]);
        
        // Update portfolio value
        setPortfolioData(prev => ({
          ...prev,
          totalValue: prev.totalValue + amountToDeposit
        }));
        
        toast.success("Deposit successful!");
        setDepositAmount(''); // Clear input after deposit
      } catch (err: any) {
        // Check if user rejected the transaction
        if (err.message && (err.message.includes("rejected") || err.message.includes("denied"))) {
          toast.error("Transaction canceled");
        } else {
          toast.error("Deposit failed");
          
          // Record failed transaction
          const newTransaction: Transaction = {
            id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type: 'deposit',
            amount: amountToDeposit,
            timestamp: new Date().toISOString(),
            status: 'failed'
          };
          
          setTransactions(prev => [newTransaction, ...prev]);
        }
        console.error('Deposit error:', err);
      }
    } finally {
      setIsDepositPending(false);
    }
  };

  // Handle Strategy Execution
  const handleStrategyExecution = async () => {
    if (!selectedStrategy) {
      toast.error("Please select a strategy");
      return;
    }
    
    if (!depositAmount) {
      toast.error("Please enter an amount");
      return;
    }
  
    try {
      const amountToInvest = parseFloat(depositAmount);
      const strategyId = selectedStrategy.id;
      
      toast.info(`Executing ${selectedStrategy.name} strategy...`);
      
      try {
        // Create pending transaction first
        const pendingTxId = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const pendingTransaction: Transaction = {
          id: pendingTxId,
          type: 'strategy',
          amount: amountToInvest,
          timestamp: new Date().toISOString(),
          strategy: selectedStrategy,
          status: 'pending'
        };
        
        setTransactions(prev => [pendingTransaction, ...prev]);
        
        // Execute the strategy
        await executeStrategy(strategyId, amountToInvest);
        
        // Generate a mock transaction hash
        const txHash = generateTxHash();
        
        // Update the transaction to completed
        setTransactions(prev => 
          prev.map(tx => 
            tx.id === pendingTxId 
              ? { ...tx, status: 'completed', txHash } 
              : tx
          )
        );
        
        // Create a new investment entry
        const newInvestment: Investment = {
          id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          strategyId: selectedStrategy.id,
          strategyName: selectedStrategy.name,
          platform: selectedStrategy.platform,
          amount: amountToInvest,
          currentValue: amountToInvest, // Initial value is the amount invested
          apy: selectedStrategy.apy,
          startDate: new Date().toISOString(),
          chain: currentChain?.name || 'Unknown Chain'
        };
        
        setInvestments(prev => [newInvestment, ...prev]);
        
        // Update portfolio value (subtract the invested amount)
        setPortfolioData(prev => ({
          ...prev,
          totalValue: prev.totalValue - amountToInvest
        }));
        
        toast.success(`Successfully executed ${selectedStrategy.name} strategy!`);
        setDepositAmount(""); // Clear input after execution
        setSelectedStrategy(null); // Reset selected strategy
        
        // Show transaction history after successful execution
        setShowTransactionHistory(true);
      } catch (err: any) {
        let errorMessage = "Strategy execution failed";
        if (err.message && (err.message.includes("rejected") || err.message.includes("denied"))) {
          errorMessage = "Transaction canceled";
          
          // Remove the pending transaction
          setTransactions(prev => prev.filter(tx => tx.status !== 'pending'));
        } else if (err.message) {
          errorMessage = `Strategy execution failed: ${err.message.split('.')[0]}`;
          
          // Update the transaction to failed
          setTransactions(prev => 
            prev.map(tx => 
              tx.status === 'pending' 
                ? { ...tx, status: 'failed' } 
                : tx
            )
          );
        }
        
        toast.error(errorMessage);
        console.error("Strategy execution error:", err);
      }
    } catch (error) {
      console.error("Strategy execution failed", error);
      toast.error("Strategy execution failed");
    }
  };

  // Auto-refresh strategies every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (mounted) {
        fetchStrategies();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [mounted]);

  // Fetch balances on connection and chain change
  useEffect(() => {
    if (isConnected && mounted) {
      fetchPortfolioBalances();
    }
  }, [isConnected, address, currentChain, mounted]);

  // Update strategies when user strategies are fetched
  useEffect(() => {
    if (userStrategies) {
      console.log("User Strategies:", userStrategies);
    }
  }, [userStrategies]);

  // Format date to relative time
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Format date to readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get investment details view
  const InvestmentDetailsView = ({ investment }: { investment: Investment }) => {
    const startDate = new Date(investment.startDate);
    const currentDate = new Date();
    const daysElapsed = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const profit = investment.currentValue - investment.amount;
    
    return (
      <div className="bg-[#1a1a2e] p-4 rounded-xl">
        <h3 className="text-xl font-semibold mb-4">{investment.strategyName} Investment</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400">Platform</p>
            <p className="font-medium">{investment.platform}</p>
          </div>
          <div>
            <p className="text-gray-400">Chain</p>
            <p className="font-medium">{investment.chain}</p>
          </div>
          <div>
            <p className="text-gray-400">Initial Investment</p>
            <p className="font-medium">${investment.amount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-400">Current Value</p>
            <p className="font-medium">${investment.currentValue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-400">Profit/Loss</p>
            <p className={`font-medium ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {profit >= 0 ? '+' : ''}{profit.toFixed(2)} ({((profit / investment.amount) * 100).toFixed(2)}%)
            </p>
          </div>
          <div>
            <p className="text-gray-400">APY</p>
            <p className="font-medium text-green-400">{investment.apy}%</p>
          </div>
          <div>
            <p className="text-gray-400">Start Date</p>
            <p className="font-medium">{formatDate(investment.startDate)}</p>
          </div>
          <div>
            <p className="text-gray-400">Days Active</p>
            <p className="font-medium">{daysElapsed} days</p>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between">
          <button 
            className="bg-[#262642] hover:bg-[#2e2e5a] text-white px-4 py-2 rounded-md flex items-center"
            onClick={() => window.open('https://app.uniswap.org', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Platform
          </button>
          <button 
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
            onClick={() => {
              // Mock withdrawal logic
              toast.info("Withdrawal initiated...");
              setTimeout(() => {
                // Remove the investment
                setInvestments(prev => prev.filter(inv => inv.id !== investment.id));
                
                // Add transaction record
                const txHash = generateTxHash();
                const withdrawalTx: Transaction = {
                  id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                  type: 'strategy',
                  amount: investment.currentValue,
                  timestamp: new Date().toISOString(),
                  strategy: {
                    id: investment.strategyId,
                    name: `Withdraw from ${investment.strategyName}`,
                    apy: investment.apy,
                    platform: investment.platform
                  },
                  status: 'completed',
                  txHash
                };
                
                setTransactions(prev => [withdrawalTx, ...prev]);
                
                // Update portfolio value
                setPortfolioData(prev => ({
                  ...prev,
                  totalValue: prev.totalValue + investment.currentValue
                }));
                
                toast.success("Withdrawal completed successfully!");
                setSelectedInvestment(null);
              }, 2000);
            }}
          >
            Withdraw
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1020] via-[#16213e] to-[#1a1a2e] text-white">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        {/* Wallet Connection - Only render when component is mounted */}
        {mounted && (
          <>
            {!isConnected ? (
              <div className="mb-8 flex justify-end">
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
                    onClick={() => {
                      disconnect();
                      toast.success("Wallet disconnected");
                    }}
                    className="text-red-400 hover:text-red-300 flex items-center"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            )}
          </>
        )}

     
        {!mounted && (
          <div className="mb-8 flex justify-end">
            <div className="bg-cyan-500/30 rounded-xl py-3 px-6 w-40 h-12"></div>
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
               
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {investments.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-400">Active Investments</p>
                      <p className="text-xl font-semibold">{investments.length}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-400">Last Updated</p>
                    <p className="text-xl font-semibold">
                      {formatRelativeTime(new Date().toISOString())}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chain Distribution */}
              <div className="bg-[#1a1a2e] rounded-xl p-5">
                <p className="text-gray-400 text-sm mb-3">Chain Distribution</p>
                <ul className="space-y-4">
                  {portfolioData.chains.map((chain) => (
                    <li key={chain.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full ${chain.color} mr-3`}
                        ></div>
                        <span>{chain.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${chain.value.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {chain.value > 0 
                            ? `${((chain.value / portfolioData.totalValue) * 100).toFixed(1)}%` 
                            : "0%"}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Active Investments Section */}
            {investments.length > 0 && (
              <div className="mt-6 bg-[#1a1a2e] rounded-xl p-5">
                <h3 className="text-xl font-bold mb-4">Active Investments</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-sm text-gray-400 border-b border-gray-700">
                        <th className="text-left pb-2">Strategy</th>
                        <th className="text-left pb-2">Platform</th>
                        <th className="text-right pb-2">Invested</th>
                        <th className="text-right pb-2">Current Value</th>
                        <th className="text-right pb-2">APY</th>
                        <th className="text-center pb-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {investments.map((investment) => (
                        <tr key={investment.id} className="border-b border-gray-800">
                          <td className="py-3">{investment.strategyName}</td>
                          <td className="py-3">{investment.platform}</td>
                          <td className="py-3 text-right">${investment.amount.toLocaleString()}</td>
                          <td className="py-3 text-right">
                            <span className={investment.currentValue > investment.amount ? 'text-green-400' : 'text-red-400'}>
                              ${investment.currentValue.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 text-right text-green-400">{investment.apy}%</td>
                          <td className="py-3 text-center">
                            <button 
                              onClick={() => setSelectedInvestment(investment)}
                              className="bg-blue-500 hover:bg-blue-600 text-white rounded-md px-3 py-1 text-sm"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Strategy Execution Panel */}
          <div className="md:col-span-1">
            <div className="bg-[#16213e] rounded-2xl p-6 shadow-xl mb-6">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 mb-6">
                Execute Strategy
              </h2>

              {/* Strategy Selection */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">
                  Select Strategy
                </label>
                <div className="relative">
                  <select
                    value={selectedStrategy?.id || ""}
                    onChange={(e) => {
                      const strategyId = e.target.value;
                      const strategy = portfolioData.topStrategies.find(
                        (s) => s.id === strategyId
                      );
                      setSelectedStrategy(strategy || null);
                    }}
                    className="w-full bg-[#1a1a2e] border border-gray-700 rounded-lg px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-white"
                  >
                    <option value="">Select a Strategy</option>
                    {isLoadingStrategies ? (
                      <option value="" disabled>
                        Loading strategies...
                      </option>
                    ) : (
                      portfolioData.topStrategies.map((strategy) => (
                        <option key={strategy.id} value={strategy.id}>
                          {strategy.name} - {strategy.apy}% APY
                        </option>
                      ))
                    )}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Strategy Details */}
              {selectedStrategy && (
                <div className="mb-6 bg-[#1a1a2e] p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{selectedStrategy.name}</h3>
                    <span className="text-cyan-400 font-semibold flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {selectedStrategy.apy}% APY
                    </span>
                  </div>
                  <div className="text-gray-400 text-sm flex justify-between">
                    <span>Platform: {selectedStrategy.platform}</span>
                    {selectedStrategy.lastUpdated && (
                      <span>
                        Updated{" "}
                        {formatRelativeTime(selectedStrategy.lastUpdated)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">
                  Amount (USDC)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full bg-[#1a1a2e] border border-gray-700 rounded-lg px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-white"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    USDC
                  </div>
                </div>
              </div>

              {/* Execute Button */}
              <button
                onClick={handleStrategyExecution}
                disabled={!isConnected || isDepositPending || !selectedStrategy || !depositAmount}
                className={`w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center space-x-2 transition-all ${
                  !isConnected || isDepositPending || !selectedStrategy || !depositAmount
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <PlayCircle className="w-5 h-5" />
                <span>Execute Strategy</span>
              </button>

              {/* Deposit Button */}
              <div className="mt-6">
                <button
                  onClick={handleDeposit}
                  disabled={!isConnected || isDepositPending || !depositAmount}
                  className={`w-full bg-[#1a1a2e] hover:bg-[#262642] text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center space-x-2 transition-all border border-gray-700 ${
                    !isConnected || isDepositPending || !depositAmount
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <DollarSign className="w-5 h-5" />
                  <span>
                    {isDepositPending ? "Processing..." : "Deposit USDC"}
                  </span>
                </button>
              </div>
            </div>

            {/* Transaction History Button */}
            <button
              onClick={() => setShowTransactionHistory(!showTransactionHistory)}
              className="w-full bg-[#16213e] hover:bg-[#1e264a] rounded-2xl p-4 text-left flex items-center justify-between shadow-xl mb-6 transition-all"
            >
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-3 text-cyan-400" />
                <span className="font-semibold">Transaction History</span>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${showTransactionHistory ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Transaction History Table */}
        {showTransactionHistory && (
          <div className="mt-6 bg-[#16213e] rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Transaction History</h2>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No transactions yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-sm text-gray-400 border-b border-gray-700">
                      <th className="text-left pb-2">Type</th>
                      <th className="text-left pb-2">Amount</th>
                      <th className="text-left pb-2">Details</th>
                      <th className="text-left pb-2">Time</th>
                      <th className="text-center pb-2">Status</th>
                      <th className="text-center pb-2">TX</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-gray-800">
                        <td className="py-3">
                          {tx.type === 'deposit' ? 'Deposit' : 'Strategy'}
                        </td>
                        <td className="py-3">${tx.amount.toLocaleString()}</td>
                        <td className="py-3">
                          {tx.type === 'deposit' 
                            ? 'USDC Deposit' 
                            : tx.strategy?.name || 'Unknown Strategy'}
                        </td>
                        <td className="py-3">{formatRelativeTime(tx.timestamp)}</td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            tx.status === 'completed' 
                              ? 'bg-green-900/30 text-green-400' 
                              : tx.status === 'pending' 
                              ? 'bg-yellow-900/30 text-yellow-400'
                              : 'bg-red-900/30 text-red-400'
                          }`}>
                            {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          {tx.txHash ? (
                            <a 
                              href={getChainExplorerUrl(tx.txHash)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300"
                            >
                              <ExternalLink className="w-4 h-4 inline" />
                            </a>
                          ) : (
                            <span className="text-gray-600">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Investment Details Modal */}
        {selectedInvestment && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="absolute inset-0 bg-black opacity-70" onClick={() => setSelectedInvestment(null)}></div>
            <div className="z-10 w-full max-w-md">
              <InvestmentDetailsView investment={selectedInvestment} />
              <button 
                className="mt-4 bg-[#16213e] hover:bg-[#1e264a] text-white px-4 py-2 rounded-md w-full"
                onClick={() => setSelectedInvestment(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;