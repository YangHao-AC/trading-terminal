import Decimal from 'decimal.js';
import type { Quote } from './protocol';

/** International gold is quoted per troy ounce, not the 28.35 g avoirdupois ounce. */
export const GRAMS_PER_TROY_OUNCE = '31.1034768';

export function spreadOf(quote: Pick<Quote, 'bid' | 'ask'>): string {
  return new Decimal(quote.ask).minus(quote.bid).toString();
}

/**
 * 练习 2：把国际金价（美元/盎司）换算成国内习惯的人民币/克。
 *
 * 要求：
 * - 全程用 Decimal 运算，禁止转成 number
 * - 结果保留 2 位小数，四舍五入（ROUND_HALF_UP），始终输出 2 位（如 "913.10"）
 * - 输入非法（非数字、≤0）时抛出错误，错误信息里带上原始输入
 *
 * 测试：packages/shared/src/units.test.ts
 */
export function usdPerOzToCnyPerGram(usdPerOz: string, usdCny: string): string {
  throw new Error('练习 2 未实现');
}
