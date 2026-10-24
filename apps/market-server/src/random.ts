export type RandomSource = () => number;

/**
 * mulberry32: tiny seeded PRNG returning uniform values in [0, 1).
 * Seeding makes simulations reproducible, which is what lets us unit-test them.
 */
export function createSeededRandom(seed: number): RandomSource {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 练习 1a：用 Box–Muller 变换，把两个 [0,1) 均匀分布随机数变成一个标准正态分布随机数 N(0,1)。
 *
 * 提示：
 * - z = sqrt(-2 ln u1) * cos(2π u2)
 * - u1 可能取到 0，ln(0) = -Infinity，要处理
 *
 * 测试：src/random.test.ts
 */
export function normal(random: RandomSource): number {
  throw new Error('练习 1a 未实现');
}
