import axios from 'axios';

interface Asset {
  token: string;
  amount: number;
  allocation: number;
}

interface RebalancingStrategy {
  currentPortfolio: Asset[];
  recommendedAllocation: {
    token: string;
    idealAllocation: number;
  }[];
  rebalancingCost: number;
  potentialTaxImplications: number;
}

export const rebalancingService = {
  async generateRebalancingStrategy(
    currentPortfolio: Asset[], 
    riskTolerance: 'low' | 'medium' | 'high'
  ): Promise<RebalancingStrategy> {
    try {
     
      const recommendedAllocation = currentPortfolio.map(asset => ({
        token: asset.token,
        idealAllocation: this.calculateIdealAllocation(
          asset.token, 
          riskTolerance
        )
      }));

      
      const rebalancingCost = this.estimateRebalancingCost(
        currentPortfolio, 
        recommendedAllocation
      );

      return {
        currentPortfolio,
        recommendedAllocation,
        rebalancingCost,
        potentialTaxImplications: this.estimateTaxImplications(
          currentPortfolio, 
          recommendedAllocation
        )
      };
    } catch (error) {
      console.error('Failed to generate rebalancing strategy', error);
      throw error;
    }
  },

  calculateIdealAllocation(
    token: string, 
    riskTolerance: 'low' | 'medium' | 'high'
  ): number {
    
    const allocationMap = {
      'low': {
        'BTC': 40,
        'ETH': 30,
        'USDC': 30
      },
      'medium': {
        'BTC': 30,
        'ETH': 40,
        'USDC': 30
      },
      'high': {
        'BTC': 20,
        'ETH': 50,
        'USDC': 30
      }
    };

    return allocationMap[riskTolerance][token] || 0;
  },

  estimateRebalancingCost(
    currentPortfolio: Asset[], 
    recommendedAllocation: {token: string, idealAllocation: number}[]
  ): number {
   
    const totalPortfolioValue = currentPortfolio.reduce(
      (sum, asset) => sum + (asset.amount * asset.allocation), 
      0
    );
    return totalPortfolioValue * 0.001 * currentPortfolio.length;
  },

  estimateTaxImplications(
    currentPortfolio: Asset[], 
    recommendedAllocation: {token: string, idealAllocation: number}[]
  ): number {
  
    const CAPITAL_GAINS_TAX_RATE = 0.15;
    
    const potentialCapitalGains = currentPortfolio.reduce((total, asset) => {
      const recommendedAsset = recommendedAllocation.find(
        rec => rec.token === asset.token
      );
      
      if (!recommendedAsset) return total;
      
   
      const currentValue = asset.amount * asset.allocation;
      const hypotheticalGains = Math.max(0, currentValue * 0.1);  
      
      return total + (hypotheticalGains * CAPITAL_GAINS_TAX_RATE);
    }, 0);

    return potentialCapitalGains;
  }
};