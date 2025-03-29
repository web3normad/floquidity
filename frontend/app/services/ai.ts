// Strategy generation interfaces
export interface UserPortfolioItem {
    token: string;
    amount: number;
    chain: string;
  }
  
  export interface AIStrategyRequest {
    userPortfolio: UserPortfolioItem[];
    riskTolerance: 'low' | 'medium' | 'high';
    investmentGoal: string;
  }
  
  export interface AIGeneratedStrategy {
    name: string;
    platform: string;
    chain: string;
    apy: number;
    riskLevel: string;
    description: string;
    aiConfidence: number;
    potentialYield?: number;
    recommendedAllocation?: number;
  }
  
  export interface PortfolioSummary {
    totalValue: number;
    mainAssets: { token: string; percentage: number }[];
    chainDistribution: { chain: string; percentage: number }[];
    riskAssessment: string;
    diversificationScore: number;
    recommendations: string[];
  }
  
  export interface MarketInsights {
    marketSentiment: "bullish" | "bearish" | "neutral";
    marketTrends: string[];
    notableEvents?: string[];
    topPerformers: { token: string; change24h: number }[];
    defiInsights: string[];
    upcomingEvents?: { event: string; date: string; potentialImpact: "low" | "medium" | "high" }[];
  }
  
  // Function to generate DeFi strategies using AI via API route
  export async function generateDeFiStrategies(request: AIStrategyRequest): Promise<AIGeneratedStrategy[]> {
    try {
      // MODIFIED: Skip API call and directly use mock data generation
      // This eliminates the dependency on the external API during testing
      console.log("Generating strategies for:", request);
      
      // Generate strategies based on user portfolio and risk tolerance
      const strategies = generateMockStrategies(request.userPortfolio, request.riskTolerance, request.investmentGoal);
      
      return strategies;
    } catch (error) {
      console.error("Error generating strategies:", error);
      return getFallbackStrategies();
    }
  }
  
  // Implement the summarizePortfolio function
  export const summarizePortfolio = async (portfolio: UserPortfolioItem[]): Promise<PortfolioSummary> => {
    try {
      // MODIFIED: Skip API call and directly generate portfolio summary
      console.log("Summarizing portfolio:", portfolio);
      
      // Get mock token prices
      const tokenPrices = await getMockTokenPrices();
      
      // Generate a portfolio summary based on the portfolio and token prices
      return generateMockPortfolioSummary(portfolio, tokenPrices);
    } catch (error) {
      console.error("Error summarizing portfolio:", error);
      return getFallbackPortfolioSummary(portfolio);
    }
  };
  
  // Implement the getMarketInsights function
  export const getMarketInsights = async (): Promise<MarketInsights> => {
    try {
      // MODIFIED: Skip API call and directly use mock data
      console.log("Generating market insights");
      
      // Return mock market insights
      return generateMockMarketInsights();
    } catch (error) {
      console.error("Error generating market insights:", error);
      return getFallbackMarketInsights();
    }
  };
  
  // New function to generate strategies based on portfolio and risk
  function generateMockStrategies(
    portfolio: UserPortfolioItem[], 
    riskTolerance: string, 
    investmentGoal: string
  ): AIGeneratedStrategy[] {
    // Extract tokens from portfolio
    const tokens = portfolio.map(item => item.token.toUpperCase());
    const chains = Array.from(new Set(portfolio.map(item => item.chain)));
    
    // Base strategies depending on risk tolerance
    let strategies: AIGeneratedStrategy[] = [];
    
    // Check if portfolio has stablecoins
    const hasStablecoins = tokens.some(token => ["USDC", "USDT", "DAI"].includes(token));
    
    // Check if portfolio has ETH
    const hasETH = tokens.some(token => ["ETH", "WETH"].includes(token));
    
    // Check if portfolio has BTC
    const hasBTC = tokens.some(token => ["BTC", "WBTC"].includes(token));
    
    // Generate strategies based on portfolio content and risk tolerance
    if (riskTolerance === 'low') {
      if (hasStablecoins) {
        strategies.push({
          name: "Aave V3 Stablecoin Lending",
          platform: "Aave",
          chain: chains[0] || "Ethereum",
          apy: 4.5 + Math.random() * 1.5,
          riskLevel: "Low",
          description: "Lend stablecoins on Aave V3 for consistent yield with minimal risk. Automated compounding maximizes returns.",
          aiConfidence: 91 + Math.floor(Math.random() * 4)
        });
      }
      
      if (hasETH) {
        strategies.push({
          name: "Lido ETH Staking + Convex",
          platform: "Lido + Convex",
          chain: "Ethereum",
          apy: 3.8 + Math.random() * 1.2,
          riskLevel: "Low",
          description: "Stake ETH with Lido to receive stETH, then provide liquidity in Curve stETH pool and stake in Convex for boosted rewards.",
          aiConfidence: 88 + Math.floor(Math.random() * 4)
        });
      }
      
      strategies.push({
        name: "Curve 3Pool Yield Optimizer",
        platform: "Curve Finance",
        chain: "Ethereum",
        apy: 4.2 + Math.random() * 2.5,
        riskLevel: "Low",
        description: "Provide liquidity to Curve's 3pool (USDC/USDT/DAI) with auto-compounding rewards for stable, low-risk yield.",
        aiConfidence: 90 + Math.floor(Math.random() * 5)
      });
    } 
    else if (riskTolerance === 'medium') {
      if (hasETH) {
        strategies.push({
          name: "Uniswap V3 ETH/USDC Concentrated LP",
          platform: "Uniswap",
          chain: chains.includes("Optimism") ? "Optimism" : "Ethereum",
          apy: 8.5 + Math.random() * 4.0,
          riskLevel: "Medium",
          description: "Provide concentrated liquidity in ETH/USDC pool on Uniswap V3 with dynamic range adjustment based on volatility patterns.",
          aiConfidence: 84 + Math.floor(Math.random() * 6)
        });
      }
      
      if (hasBTC) {
        strategies.push({
          name: "Balancer BTC/ETH Weighted Pool",
          platform: "Balancer",
          chain: chains.includes("Arbitrum") ? "Arbitrum" : "Ethereum",
          apy: 7.8 + Math.random() * 3.5,
          riskLevel: "Medium",
          description: "Provide liquidity to Balancer's weighted BTC/ETH pool with auto-harvesting and compounding of BAL rewards.",
          aiConfidence: 82 + Math.floor(Math.random() * 5)
        });
      }
      
      strategies.push({
        name: "Stargate Cross-Chain Stablecoin Bridge",
        platform: "Stargate Finance",
        chain: chains[0] || "Arbitrum",
        apy: 9.2 + Math.random() * 3.0,
        riskLevel: "Medium",
        description: "Provide liquidity to Stargate's cross-chain bridges to earn fees from cross-chain transfers and STG farming rewards.",
        aiConfidence: 80 + Math.floor(Math.random() * 7)
      });
    }
    else if (riskTolerance === 'high') {
      strategies.push({
        name: "GMX GLP Leveraged Yield",
        platform: "GMX",
        chain: "Arbitrum",
        apy: 15.5 + Math.random() * 8.0,
        riskLevel: "High",
        description: "Provide liquidity to GMX's GLP, with leveraged exposure to trading fees and esGMX rewards, optimized for maximum yield.",
        aiConfidence: 78 + Math.floor(Math.random() * 8)
      });
      
      if (hasETH) {
        strategies.push({
          name: "Lyra Options Writing Strategy",
          platform: "Lyra",
          chain: "Optimism",
          apy: 18.2 + Math.random() * 10.0,
          riskLevel: "High",
          description: "Automated options writing strategy on Lyra, selling covered calls on ETH with dynamic strike selection based on volatility.",
          aiConfidence: 75 + Math.floor(Math.random() * 7)
        });
      }
      
      strategies.push({
        name: "Pendle Yield Trading Strategy",
        platform: "Pendle",
        chain: chains.includes("Arbitrum") ? "Arbitrum" : "Ethereum",
        apy: 20.5 + Math.random() * 12.0,
        riskLevel: "High",
        description: "Trade yield tokens on Pendle, capturing yield curve inefficiencies with algorithmic position management.",
        aiConfidence: 72 + Math.floor(Math.random() * 9)
      });
    }
    
    // Add a strategy based on investment goal if we don't have enough
    if (strategies.length < 3) {
      if (investmentGoal.toLowerCase().includes("passive") || investmentGoal.toLowerCase().includes("income")) {
        strategies.push({
          name: "Yearn Finance Multi-Strategy Vault",
          platform: "Yearn Finance",
          chain: "Ethereum",
          apy: 6.5 + Math.random() * 3.0,
          riskLevel: riskTolerance === "low" ? "Low" : "Medium",
          description: "Deposit into Yearn's automated yield-optimizing vaults that constantly rebalance between multiple strategies.",
          aiConfidence: 86 + Math.floor(Math.random() * 5)
        });
      } else if (investmentGoal.toLowerCase().includes("growth") || investmentGoal.toLowerCase().includes("aggressive")) {
        strategies.push({
          name: "Perpetual Protocol Basis Trading",
          platform: "Perpetual Protocol",
          chain: "Arbitrum",
          apy: 14.0 + Math.random() * 8.0,
          riskLevel: "High",
          description: "Algorithmic basis trading between spot and perpetual markets, capturing funding rates with controlled risk.",
          aiConfidence: 74 + Math.floor(Math.random() * 8)
        });
      }
    }
    
    // Ensure we have at least 3 strategies
    while (strategies.length < 3) {
      strategies.push(getFallbackStrategies()[strategies.length % getFallbackStrategies().length]);
    }
    
    // Limit to 5 strategies
    return strategies.slice(0, 5);
  }
  
  // New function to generate portfolio summary
  function generateMockPortfolioSummary(portfolio: UserPortfolioItem[], tokenPrices: Record<string, number>): PortfolioSummary {
    // Calculate portfolio value
    let totalValue = 0;
    const portfolioWithValue = portfolio.map(item => {
      const price = tokenPrices[item.token.toUpperCase()] || 1;
      const value = item.amount * price;
      totalValue += value;
      return { ...item, value };
    });
    
    // Calculate main assets by percentage
    const mainAssets = portfolioWithValue
      .sort((a, b) => (b as any).value - (a as any).value)
      .slice(0, 3)
      .map(item => ({
        token: item.token,
        percentage: Math.round(((item as any).value / totalValue) * 100)
      }));
    
    // Calculate chain distribution
    const chainMap: Record<string, number> = {};
    portfolioWithValue.forEach(item => {
      chainMap[item.chain] = (chainMap[item.chain] || 0) + (item as any).value;
    });
    
    const chainDistribution = Object.entries(chainMap).map(([chain, value]) => ({
      chain,
      percentage: Math.round((value / totalValue) * 100)
    }));
    
    // Determine risk assessment
    const hasStables = portfolio.some(item => 
      ["USDC", "USDT", "DAI"].includes(item.token.toUpperCase())
    );
    
    const hasMajors = portfolio.some(item => 
      ["ETH", "WETH", "BTC", "WBTC"].includes(item.token.toUpperCase())
    );
    
    const hasAltcoins = portfolio.some(item => 
      !["USDC", "USDT", "DAI", "ETH", "WETH", "BTC", "WBTC"].includes(item.token.toUpperCase())
    );
    
    let riskAssessment = "";
    if (hasStables && hasMajors && !hasAltcoins) {
      riskAssessment = "Low risk portfolio with good balance between stablecoins and major cryptocurrencies.";
    } else if (hasStables && hasMajors && hasAltcoins) {
      riskAssessment = "Medium risk portfolio with a mix of stablecoins, major cryptocurrencies, and some altcoins.";
    } else if (!hasStables && hasMajors) {
      riskAssessment = "Medium-high risk portfolio heavily weighted towards major cryptocurrencies with limited stablecoin exposure.";
    } else if (hasAltcoins && !hasStables) {
      riskAssessment = "High risk portfolio with significant altcoin exposure and limited stablecoin protection.";
    } else {
      riskAssessment = "Balanced portfolio with moderate risk profile.";
    }
    
    // Calculate diversification score
    let diversificationScore = 50;
    diversificationScore += Math.min(portfolio.length * 5, 20); // More tokens = better diversification, up to a point
    diversificationScore += Math.min(chainDistribution.length * 7, 20); // More chains = better diversification
    if (hasStables) diversificationScore += 5;
    if (hasMajors) diversificationScore += 5;
    if (hasAltcoins) diversificationScore += 5;
    
    // Avoid extremes
    diversificationScore = Math.max(30, Math.min(95, diversificationScore));
    
    // Generate recommendations
    const recommendations = [];
    if (!hasStables) {
      recommendations.push("Add stablecoins (USDC, DAI) to reduce portfolio volatility");
    }
    if (chainDistribution.length < 3) {
      recommendations.push("Diversify across more blockchain networks to reduce chain-specific risks");
    }
    if (mainAssets.length > 0 && mainAssets[0].percentage > 40) {
      recommendations.push(`Consider reducing ${mainAssets[0].token} position (${mainAssets[0].percentage}%) to improve diversification`);
    }
    if (diversificationScore < 60) {
      recommendations.push("Increase overall portfolio diversification by adding more uncorrelated assets");
    }
    
    // Add general recommendation if we don't have enough
    if (recommendations.length < 3) {
      recommendations.push("Explore DeFi yield opportunities to grow your holdings while maintaining your risk profile");
    }
    
    return {
      totalValue,
      mainAssets,
      chainDistribution,
      riskAssessment,
      diversificationScore,
      recommendations
    };
  }
  
  // New function to generate market insights
  function generateMockMarketInsights(): MarketInsights {
    // Randomly select market sentiment
    const sentiments = ["bullish", "bearish", "neutral"] as const;
    const marketSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    
    // Generate market trends based on sentiment
    let marketTrends = [];
    if (marketSentiment === "bullish") {
      marketTrends = [
        "Institutional investment flows into crypto are increasing",
        "Layer 2 solutions showing strong adoption and growth",
        "DeFi TVL rising as risk appetite returns to the market",
        "Positive regulatory developments boosting market confidence"
      ];
    } else if (marketSentiment === "bearish") {
      marketTrends = [
        "Market volatility increasing due to macroeconomic concerns",
        "DeFi TVL declining as users seek safer assets",
        "Regulatory uncertainty creating headwinds for growth",
        "Decreased trading volumes across major exchanges"
      ];
    } else {
      marketTrends = [
        "Market consolidation phase after recent volatility",
        "Layer 2 solutions continue steady growth despite market conditions",
        "DeFi TVL stabilizing after recent fluctuations",
        "Institutional interest remains strong despite short-term uncertainty"
      ];
    }
    
    // Select 3 random market trends
    marketTrends = marketTrends.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    // Generate top performers
    const possibleTokens = ["ETH", "BTC", "ARB", "OP", "LINK", "SOL", "AVAX", "MATIC"];
    const topPerformers = [];
    
    for (let i = 0; i < 3; i++) {
      const token = possibleTokens[Math.floor(Math.random() * possibleTokens.length)];
      possibleTokens.splice(possibleTokens.indexOf(token), 1);
      
      let change24h;
      if (marketSentiment === "bullish") {
        change24h = (1 + Math.random() * 8).toFixed(1);
      } else if (marketSentiment === "bearish") {
        change24h = (-5 + Math.random() * 7).toFixed(1);
      } else {
        change24h = (-2 + Math.random() * 4).toFixed(1);
      }
      
      topPerformers.push({
        token,
        change24h: parseFloat(change24h)
      });
    }
    
    // Sort by performance
    topPerformers.sort((a, b) => b.change24h - a.change24h);
    
    // Generate DeFi insights
    const defiInsightOptions = [
      "Lending protocols seeing increased utilization rates",
      "DEX volumes trending upward on L2 networks",
      "Yield farming opportunities emerging on newer L2 chains",
      "Liquid staking derivatives gaining significant market share",
      "RWA protocols showing steady growth in TVL",
      "Options protocols gaining traction with improved user interfaces",
      "Cross-chain bridges experiencing increased activity",
      "Governance token voting participation reaching new highs"
    ];
    
    const defiInsights = defiInsightOptions
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    // Generate upcoming events
    const currentDate = new Date();
    const upcomingEvents = [
      {
        event: "Major ETH Layer 2 Protocol Upgrade",
        date: new Date(currentDate.getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        potentialImpact: "medium" as const
      },
      {
        event: "International DeFi Conference",
        date: new Date(currentDate.getTime() + (14 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        potentialImpact: "low" as const
      },
      {
        event: "Central Bank Digital Currency Announcement",
        date: new Date(currentDate.getTime() + (10 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        potentialImpact: "high" as const
      }
    ];
    
    return {
      marketSentiment: marketSentiment,
      marketTrends,
      topPerformers,
      defiInsights,
      upcomingEvents,
      notableEvents: [
        "L2 ecosystem expanding with several new protocol launches",
        "Major update to lending protocol security framework",
        "Increasing institutional adoption of DeFi yield strategies"
      ]
    };
  }
  
  // Helper function to calculate AI confidence score
  function calculateConfidenceScore(strategy: any, riskTolerance: string): number {
    // Base confidence
    let baseConfidence = 85;
    
    // Adjust based on risk alignment
    if (
      (riskTolerance === 'low' && strategy.riskLevel.toLowerCase() === 'low') ||
      (riskTolerance === 'medium' && strategy.riskLevel.toLowerCase() === 'medium') ||
      (riskTolerance === 'high' && strategy.riskLevel.toLowerCase() === 'high')
    ) {
      baseConfidence += 7;
    }
    
    // Add some randomness (±5%)
    const randomness = Math.floor(Math.random() * 10) - 5;
    
    // Ensure confidence is between 70 and 95
    return Math.min(Math.max(baseConfidence + randomness, 70), 95);
  }
  
  // Mock function to get market data (replace with real API calls)
  async function getMockMarketData() {
    return {
      ethereum: {
        gasPrice: "25 gwei",
        tvl: {
          aave: "$5.2B",
          curve: "$3.1B",
          uniswap: "$4.7B"
        },
        tokens: {
          ETH: { price: 2000, change24h: 1.2 },
          USDC: { price: 1, change24h: 0.01 },
          WBTC: { price: 35000, change24h: 2.1 }
        }
      },
      arbitrum: {
        gasPrice: "0.1 gwei",
        tvl: {
          aave: "$1.2B",
          gmx: "$800M",
          uniswap: "$1.5B"
        }
      },
      optimism: {
        gasPrice: "0.05 gwei",
        tvl: {
          aave: "$900M",
          velodrome: "$300M",
          uniswap: "$800M"
        }
      },
      linea: {
        gasPrice: "0.01 gwei",
        tvl: {
          horizon: "$150M",
          velocore: "$100M"
        }
      }
    };
  }
  
  // Helper function to get token prices (mock for now)
  async function getMockTokenPrices() {
    return {
      "ETH": 2000,
      "WETH": 2000,
      "WBTC": 35000,
      "BTC": 35000,
      "USDC": 1,
      "USDT": 1,
      "DAI": 1,
      "AAVE": 80,
      "UNI": 5,
      "LINK": 15,
      "ARB": 1.2,
      "OP": 2.5,
      "MATIC": 0.8,
      "SOL": 100,
      "AVAX": 30
    };
  }
  
  // Fallback strategies for demo or if API fails
  function getFallbackStrategies(): AIGeneratedStrategy[] {
    return [
      {
        name: "Curve 3Pool Yield Optimizer",
        platform: "Curve Finance",
        chain: "Ethereum",
        apy: 6.45,
        riskLevel: "Low",
        description: "AI-driven liquidity provision strategy maximizing stable coin yields with minimal volatility.",
        aiConfidence: 92
      },
      {
        name: "Aave V3 USDC Lending",
        platform: "Aave",
        chain: "Arbitrum",
        apy: 4.87,
        riskLevel: "Low",
        description: "Intelligent lending strategy targeting optimal USDC lending rates across multiple markets.",
        aiConfidence: 88
      },
      {
        name: "Uniswap V3 ETH/USDC Dynamic",
        platform: "Uniswap",
        chain: "Optimism",
        apy: 12.34,
        riskLevel: "Medium",
        description: "Advanced AI-powered concentrated liquidity strategy adapting to market volatility.",
        aiConfidence: 85
      },
      {
        name: "GMX Perpetual Hedging",
        platform: "GMX",
        chain: "Arbitrum",
        apy: 18.65,
        riskLevel: "High",
        description: "Sophisticated AI-managed perpetual trading strategy with dynamic risk management.",
        aiConfidence: 79
      },
      {
        name: "Velocore BTC/ETH LSD LP",
        platform: "Velocore",
        chain: "Linea",
        apy: 15.32,
        riskLevel: "Medium",
        description: "Optimized LP strategy for liquid staking derivatives with auto-compounding.",
        aiConfidence: 82
      }
    ];
  }
  
  // Fallback portfolio summary
  function getFallbackPortfolioSummary(portfolio: UserPortfolioItem[]): PortfolioSummary {
    // Calculate basic metrics from the provided portfolio
    const totalTokens = portfolio.reduce((sum, item) => sum + item.amount, 0);
    
    // Create a simplified chain distribution
    const chains = portfolio.reduce((acc: Record<string, number>, item) => {
      acc[item.chain] = (acc[item.chain] || 0) + 1;
      return acc;
    }, {});
    
    const chainDistribution = Object.entries(chains).map(([chain, count]) => ({
      chain,
      percentage: Math.round((count / portfolio.length) * 100)
    }));
    
    return {
      totalValue: totalTokens * 100, // Rough estimate
      mainAssets: portfolio.slice(0, 3).map(item => ({
        token: item.token,
        percentage: Math.round((item.amount / totalTokens) * 100)
      })),
      chainDistribution,
      riskAssessment: "Medium risk portfolio with moderate diversification.",
      diversificationScore: 65,
      recommendations: [
        "Consider diversifying across more chains for better risk management",
        "Add some stablecoins to reduce overall portfolio volatility",
        "Look into DeFi yield opportunities to grow your holdings"
      ]
    };
  }
  
  // Fallback market insights
  function getFallbackMarketInsights(): MarketInsights {
    return {
      marketSentiment: "neutral",
      marketTrends: [
        "Layer 2 solutions showing strong growth",
        "DeFi TVL stabilizing after recent market movements",
        "Institutional interest in crypto continues to grow"
      ],
      topPerformers: [
        { token: "ETH", change24h: 2.5 },
        { token: "ARB", change24h: 3.8 },
        { token: "OP", change24h: 1.9 }
      ],
      defiInsights: [
        "Lending protocols seeing increased utilization",
        "DEX volumes remain strong despite overall market conditions",
        "New yield optimization strategies emerging on L2 networks"
      ],
      upcomingEvents: [
        { 
          event: "ETH Protocol Upgrade", 
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
          potentialImpact: "medium" 
        },
        { 
          event: "Major DeFi Conference", 
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
          potentialImpact: "low" 
        }
      ]
    };
  }