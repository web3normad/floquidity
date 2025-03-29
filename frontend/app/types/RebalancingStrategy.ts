export interface Asset {
    token: string;
    amount: number;
    allocation: number;
  }
  
  export interface RecommendedAllocation {
    token: string;
    idealAllocation: number;
  }
  
  export interface RebalancingStrategyData {
    currentPortfolio: Asset[];
    recommendedAllocation: RecommendedAllocation[];
    rebalancingCost: number;
    potentialTaxImplications: number;
  }
  
  export type RiskTolerance = 'low' | 'medium' | 'high';