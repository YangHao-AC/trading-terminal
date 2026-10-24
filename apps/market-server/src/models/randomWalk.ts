import type { RandomSource } from '../random';
import type { PriceModel } from './types';

export interface RandomWalkOptions {
  initialPrice: number;
  /** Maximum absolute move per step, in price units. */
  maxStep: number;
  random: RandomSource;
}

/**
 * Placeholder model so the pipeline runs end to end before GBM exists.
 * It moves by absolute amounts, so it can go negative — real prices move by percentages.
 */
export function createRandomWalkModel({
  initialPrice,
  maxStep,
  random,
}: RandomWalkOptions): PriceModel {
  let price = initialPrice;
  return {
    next() {
      price += (random() * 2 - 1) * maxStep;
      return price;
    },
  };
}
