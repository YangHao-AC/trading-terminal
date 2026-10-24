import type { RandomSource } from '../random';
import type { PriceModel } from './types';

export interface GbmOptions {
  initialPrice: number;
  /** Annualised drift μ, e.g. 0.05 = expected +5% per year. */
  drift: number;
  /** Annualised volatility σ, e.g. 0.15 = 15% per year (gold is typically 12–20%). */
  volatility: number;
  /** Length of one step in years, e.g. 1 / (365 * 24 * 3600) for one second. */
  dt: number;
  random: RandomSource;
}

/**
 * 练习 1b：几何布朗运动（Geometric Brownian Motion），Black–Scholes 期权定价背后的价格模型。
 *
 * 每一步：S(t+dt) = S(t) * exp((μ - σ²/2)·dt + σ·√dt·Z)，其中 Z ~ N(0,1)，用练习 1a 的 normal()。
 *
 * 写之前先想清楚（面试会问）：
 * - 为什么用 exp(...) 乘法更新，而不是 S += ... 加法更新？
 * - 为什么要减 σ²/2？去掉会怎样？
 *
 * 测试：src/models/gbm.test.ts
 */
export function createGbmModel(options: GbmOptions): PriceModel {
  throw new Error('练习 1b 未实现');
}
