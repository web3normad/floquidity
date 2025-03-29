// src/services/impermanentLossService.ts
import { 
    ImpermanentLossProjection, 
    ImpermanentLossCalculationParams 
  } from '../types/ImpermanentLoss';
  
  export class ImpermanentLossService {
    static calculateImpermanentLoss(params: ImpermanentLossCalculationParams): ImpermanentLossProjection {
      const { 
        token0, 
        token1, 
        initialPrice0, 
        initialPrice1, 
        currentPrice0, 
        currentPrice1, 
        liquidityAmount 
      } = params;
  
      // Calculate liquidity pool value at initial and current prices
      const initialPoolValue = 
        Math.sqrt(initialPrice0 * initialPrice1) * liquidityAmount;
      const currentPoolValue = 
        Math.sqrt(currentPrice0 * currentPrice1) * liquidityAmount;
  
      // Calculate holding value
      const initialHoldValue = 
        (liquidityAmount / 2 * initialPrice0) + 
        (liquidityAmount / 2 * initialPrice1);
      const currentHoldValue = 
        (liquidityAmount / 2 * currentPrice0) + 
        (liquidityAmount / 2 * currentPrice1);
  
      // Calculate impermanent loss
      const impermanentLossPercentage = 
        ((currentPoolValue - currentHoldValue) / initialHoldValue) * 100;
  
      // Determine risk level
      let potentialRisk: 'Low' | 'Medium' | 'High' = 'Low';
      if (Math.abs(impermanentLossPercentage) > 10) potentialRisk = 'Medium';
      if (Math.abs(impermanentLossPercentage) > 20) potentialRisk = 'High';
  
      // Recommend action
      let recommendedAction = 'Hold current position';
      if (potentialRisk === 'High') {
        recommendedAction = 'Consider withdrawing liquidity';
      }
  
      return {
        currentValue: currentPoolValue,
        holdValue: currentHoldValue,
        impermanentLossPercentage,
        potentialRisk,
        recommendedAction
      };
    }
  
    // Additional method for fetching token prices
    static async fetchTokenPrices(tokens: Token[]): Promise<Token[]> {
      // TODO: Implement actual price fetching from oracle or API
      return tokens.map(token => ({
        ...token,
        price: Math.random() * 100 // Placeholder
      }));
    }
  }