// src/types/ImpermanentLoss.ts
export interface Token {
    symbol: string;
    address: string;
    price: number;
  }
  
  export interface LiquidityPosition {
    token0: Token;
    token1: Token;
    liquidityAmount: number;
    poolFee: number;
  }
  
  export interface ImpermanentLossProjection {
    currentValue: number;
    holdValue: number;
    impermanentLossPercentage: number;
    potentialRisk: 'Low' | 'Medium' | 'High';
    recommendedAction: string;
  }
  
  export interface ImpermanentLossCalculationParams {
    token0: Token;
    token1: Token;
    initialPrice0: number;
    initialPrice1: number;
    currentPrice0: number;
    currentPrice1: number;
    liquidityAmount: number;
  }