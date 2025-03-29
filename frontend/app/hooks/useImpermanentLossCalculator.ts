// src/hooks/useImpermanentLossCalculator.ts
import { useState, useCallback } from 'react';
import { 
  ImpermanentLossService 
} from '../services/impermanentLossService';
import { 
  Token, 
  ImpermanentLossProjection,
  ImpermanentLossCalculationParams 
} from '../types/ImpermanentLoss';

export const useImpermanentLossCalculator = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImpermanentLossProjection | null>(null);

  const calculateImpermanentLoss = useCallback(
    async (params: ImpermanentLossCalculationParams) => {
      setLoading(true);
      setError(null);

      try {
        // Fetch latest token prices
        const [token0, token1] = await ImpermanentLossService.fetchTokenPrices([
          params.token0, 
          params.token1
        ]);

        // Recalculate with updated prices
        const calculationParams = {
          ...params,
          currentPrice0: token0.price,
          currentPrice1: token1.price
        };

        const projection = ImpermanentLossService.calculateImpermanentLoss(
          calculationParams
        );

        setResult(projection);
        return projection;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    calculateImpermanentLoss,
    loading,
    error,
    result
  };
};