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

// Function to generate DeFi strategies using AI
export async function generateDeFiStrategies(request: AIStrategyRequest): Promise<AIGeneratedStrategy[]> {
  try {
   
    const prompt = generateStrategyPrompt(request);
    
   
    const aiResponse = await callAIService(prompt);
    
  
    const strategies = parseAIStrategyResponse(aiResponse, request.riskTolerance);
    
    return strategies;
  } catch (error) {
    console.error("Error generating strategies:", error);
    return getFallbackStrategies();
  }
}

// summarize Portfolio function
export const summarizePortfolio = async (portfolio: UserPortfolioItem[]): Promise<PortfolioSummary> => {
  try {
   
    const tokenPrices = await getTokenPrices(portfolio.map(item => item.token));
    

    const prompt = generatePortfolioSummaryPrompt(portfolio, tokenPrices);
    
    
    const aiResponse = await callAIService(prompt);
    
  
    const summary = parseAIPortfolioSummary(aiResponse, portfolio, tokenPrices);
    
    return summary;
  } catch (error) {
    console.error("Error summarizing portfolio:", error);
    return getFallbackPortfolioSummary(portfolio);
  }
};

// MarketInsights 
export const getMarketInsights = async (): Promise<MarketInsights> => {
  try {
    const marketData = await getMarketData();
    

    const prompt = generateMarketInsightsPrompt(marketData);
    
   
    const aiResponse = await callAIService(prompt);
    
    
    const insights = parseAIMarketInsights(aiResponse);
    
    return insights;
  } catch (error) {
    console.error("Error generating market insights:", error);
    return getFallbackMarketInsights();
  }
};

// Fetch token prices
async function getTokenPrices(tokens: string[]): Promise<Record<string, number>> {
  const tokenIds = tokens.map(formatTokenForPriceAPI).join(',');
  
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokenIds}&vs_currencies=usd`,
      {
        headers: {
          'x-cg-api-key': process.env.COINGECKO_API_KEY || ''
        }
      }
    );
    if (!response.ok) {
      throw new Error(`Price API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    const prices: Record<string, number> = {};
    for (const [id, priceData] of Object.entries(data)) {
      const token = mapPriceAPITokenToSymbol(id);
      prices[token] = (priceData as any).usd;
    }
    
    return prices;
  } catch (error) {
    console.error("Error fetching token prices:", error);
    return getMockTokenPrices(); 
  }
}

// Helper to format token symbols for price API
function formatTokenForPriceAPI(token: string): string {
  const symbolToId: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'USDC': 'usd-coin',
    'USDT': 'tether',
    'DAI': 'dai',
    'WBTC': 'wrapped-bitcoin',
    'WETH': 'weth',
    'LINK': 'chainlink',
    'UNI': 'uniswap',
    'AAVE': 'aave',
    'ARB': 'arbitrum',
    'OP': 'optimism',
    'MATIC': 'matic-network',
    'SOL': 'solana',
    'AVAX': 'avalanche-2',
  };
  
  return symbolToId[token.toUpperCase()] || token.toLowerCase();
}

// Helper to map price API IDs back to token symbols
function mapPriceAPITokenToSymbol(id: string): string {
  const idToSymbol: Record<string, string> = {
    'bitcoin': 'BTC',
    'ethereum': 'ETH',
    'usd-coin': 'USDC',
    'tether': 'USDT',
    'dai': 'DAI',
    'wrapped-bitcoin': 'WBTC',
    'weth': 'WETH',
    'chainlink': 'LINK',
    'uniswap': 'UNI',
    'aave': 'AAVE',
    'arbitrum': 'ARB',
    'optimism': 'OP',
    'matic-network': 'MATIC',
    'solana': 'SOL',
    'avalanche-2': 'AVAX',
  
  };
  
  return idToSymbol[id] || id.toUpperCase();
}

// Get market data from various sources
async function getMarketData() {  
  try {
    const marketResponse = await fetch('https://api.coingecko.com/api/v3/global');
    const marketData = await marketResponse.json();
    
  
    const topTokensResponse = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1'
    );
    const topTokens = await topTokensResponse.json();
    
   
    
    return {
      market: marketData.data,
      topTokens,
    };
  } catch (error) {
    console.error("Error fetching market data:", error);
    return { market: {}, topTokens: [] };
  }
}


// API Service
async function callAIService(prompt: string): Promise<string> {
  const providers = [
    tryTogetherAI,
    tryLocalFallback
  ];
  
  let lastError = null;
  
  for (const provider of providers) {
    try {
      console.log(`Trying AI provider: ${provider.name}`);
      const result = await provider(prompt);
      if (result) {
        console.log(`Successfully got response from ${provider.name}`);
        return result;
      }
    } catch (error) {
      console.error(`Error with provider ${provider.name}:`, error);
      lastError = error;
      // Continue to next provider
    }
  }
  
  // If all providers fail, log the last error and return empty string
  console.error("All AI providers failed:", lastError);
  return "";
}

// OpenAI provider
async function tryOpenAI(prompt: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a DeFi expert that responds in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1500
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI Error (${response.status}): ${errorText}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}


// Together AI provider
async function tryTogetherAI(prompt: string): Promise<string> {
  const apiKey = process.env.TOGETHER_API_KEY || '6ea2acc5821f1f4fc0c135fd94d6ab4dda5097336a6df7c0c6bcc1ad619789c5';
  
  if (!apiKey) {
    throw new Error("Together AI API key not configured");
  }
  
  const response = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      messages: [
        {
          role: "system",
          content: "You are a DeFi expert that responds in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1500
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Together AI Error (${response.status}): ${errorText}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}


async function tryLocalFallback(prompt: string): Promise<string> {
  console.log("Using local fallback to generate response");
  
 
  if (prompt.includes("strategies") || prompt.includes("DeFi")) {
    return JSON.stringify(getFallbackStrategies());
  } else if (prompt.includes("portfolio")) {
  
    return JSON.stringify(getFallbackPortfolioSummary([]));
  } else if (prompt.includes("market") || prompt.includes("insights")) {
    return JSON.stringify(getFallbackMarketInsights());
  }
  
 
  return JSON.stringify({
    status: "success",
    message: "Generated by local fallback",
    data: {
      result: "This is a fallback response. The AI service is currently unavailable."
    }
  });
}

// Generate prompts for AI
function generateStrategyPrompt(request: AIStrategyRequest): string {
  return `You are an expert DeFi strategist with deep knowledge of yield optimization, crypto markets, and risk management.
  
I'll provide you with a user's crypto portfolio and preferences. Please analyze this information and recommend the top DeFi strategies for them.

User portfolio:
${JSON.stringify(request.userPortfolio, null, 2)}

Risk tolerance: ${request.riskTolerance}
Investment goal: ${request.investmentGoal}

For each recommended strategy, provide:
- A clear name
- The DeFi platform
- Blockchain
- Expected APY (realistic)
- Risk level
- A detailed description explaining how the strategy works
- A confidence score (0-100) of how well this matches their needs

Focus on real, current DeFi protocols and realistic APYs (low risk: 2-7%, medium risk: 5-15%, high risk: 10-30%).

Return your response in a structured JSON format matching this example:
[{
  "name": "Strategy Name",
  "platform": "Platform Name",
  "chain": "Chain Name",
  "apy": 5.2,
  "riskLevel": "Low/Medium/High",
  "description": "Detailed explanation of the strategy...",
  "aiConfidence": 87
}]

Provide 3-5 strategies that match the user's portfolio and preferences.`;
}

function generatePortfolioSummaryPrompt(portfolio: UserPortfolioItem[], tokenPrices: Record<string, number>): string {
 
  let totalValue = 0;
  const portfolioWithValue = portfolio.map(item => {
    const price = tokenPrices[item.token.toUpperCase()] || 0;
    const value = item.amount * price;
    totalValue += value;
    return { ...item, value, price };
  });

  return `You are an expert crypto portfolio analyst. Please analyze this portfolio and provide a comprehensive summary.

Portfolio:
${JSON.stringify(portfolioWithValue, null, 2)}

Total portfolio value: $${totalValue.toFixed(2)}

Please provide:
1. The main assets by percentage (top 3)
2. Chain distribution by percentage
3. Risk assessment of the portfolio
4. A diversification score (0-100)
5. 3-5 specific recommendations for improving this portfolio

Return your analysis in this JSON format:
{
  "totalValue": number,
  "mainAssets": [{"token": "symbol", "percentage": number}],
  "chainDistribution": [{"chain": "name", "percentage": number}],
  "riskAssessment": "detailed assessment",
  "diversificationScore": number,
  "recommendations": ["recommendation1", "recommendation2", ...]
}`;
}

function generateMarketInsightsPrompt(marketData: any): string {
  return `You are an expert crypto market analyst. Please analyze the current market data and provide insights.

Market data:
${JSON.stringify(marketData, null, 2)}

Please provide:
1. Overall market sentiment (bullish, bearish, or neutral)
2. 3 key market trends
3. Top 3 performing tokens with their 24h change
4. 3 significant DeFi insights
5. 3 upcoming events that might impact the market

Return your analysis in this JSON format:
{
  "marketSentiment": "bullish/bearish/neutral",
  "marketTrends": ["trend1", "trend2", "trend3"],
  "topPerformers": [{"token": "symbol", "change24h": number}],
  "defiInsights": ["insight1", "insight2", "insight3"],
  "upcomingEvents": [{"event": "description", "date": "YYYY-MM-DD", "potentialImpact": "low/medium/high"}],
  "notableEvents": ["event1", "event2", "event3"]
}`;
}

// Parse AI responses
function parseAIStrategyResponse(aiResponse: string, riskTolerance: string): AIGeneratedStrategy[] {
  try {
   
    const jsonMatch = aiResponse.match(/\[\s*{[\s\S]*}\s*\]/);
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from AI response");
    }
    
    const strategies = JSON.parse(jsonMatch[0]) as AIGeneratedStrategy[];
    
   
    return strategies.map(strategy => ({
      name: strategy.name,
      platform: strategy.platform,
      chain: strategy.chain,
      apy: parseFloat(strategy.apy.toString()),
      riskLevel: strategy.riskLevel,
      description: strategy.description,
      aiConfidence: parseInt(strategy.aiConfidence.toString()),
      potentialYield: strategy.potentialYield,
      recommendedAllocation: strategy.recommendedAllocation
    }));
  } catch (error) {
    console.error("Error parsing AI strategy response:", error);
    return getFallbackStrategies();
  }
}

function parseAIPortfolioSummary(aiResponse: string, portfolio: UserPortfolioItem[], tokenPrices: Record<string, number>): PortfolioSummary {
  try {
    
    const jsonMatch = aiResponse.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from AI response");
    }
    
    const summary = JSON.parse(jsonMatch[0]) as PortfolioSummary;
    
   
    if (!summary.totalValue || !Array.isArray(summary.mainAssets) || !Array.isArray(summary.recommendations)) {
      throw new Error("Invalid summary format from AI");
    }
    
    return summary;
  } catch (error) {
    console.error("Error parsing AI portfolio summary:", error);
    return getFallbackPortfolioSummary(portfolio);
  }
}

function parseAIMarketInsights(aiResponse: string): MarketInsights {
  try {
  
    const jsonMatch = aiResponse.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from AI response");
    }
    
    const insights = JSON.parse(jsonMatch[0]) as MarketInsights;
    
  
    if (!["bullish", "bearish", "neutral"].includes(insights.marketSentiment)) {
      throw new Error("Invalid market sentiment from AI");
    }
    
    return insights;
  } catch (error) {
    console.error("Error parsing AI market insights:", error);
    return getFallbackMarketInsights();
  }
}


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
    }
  ];
}

function getFallbackPortfolioSummary(portfolio: UserPortfolioItem[]): PortfolioSummary {

  const totalTokens = portfolio.reduce((sum, item) => sum + item.amount, 0);
  

  const chains = portfolio.reduce((acc: Record<string, number>, item) => {
    acc[item.chain] = (acc[item.chain] || 0) + 1;
    return acc;
  }, {});
  
  const chainDistribution = Object.entries(chains).map(([chain, count]) => ({
    chain,
    percentage: Math.round((count / portfolio.length) * 100)
  }));
  
  return {
    totalValue: totalTokens * 100,
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