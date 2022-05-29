/**
 * <https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function maxProfit2(prices: number[]): number {
  let i = 0;
  let sum = 0;
  while (prices[i] !== undefined && prices[i + 1] !== undefined) {
    if (prices[i + 1] - prices[i] > 0) {
      sum += prices[i + 1] - prices[i];
    }
    i++;
  }
  return sum;
}

const solutions = [maxProfit2];

for (const maxProfit of solutions) {
  Deno.test("max profit 1", () => {
    assertEquals(maxProfit([7, 1, 5, 3, 6, 4]), 7);
  });
  Deno.test("max profit 2", () => {
    assertEquals(maxProfit([2, 1, 2, 0, 1]), 2);
  });
}
