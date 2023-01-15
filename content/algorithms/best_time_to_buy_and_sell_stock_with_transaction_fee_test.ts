/**
 * Best Time to Buy and Sell Stock with transaction fee
 * <https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function maxProfit(prices: number[], fee: number): number {
  const stateEmpty: number[] = Array(prices.length).fill(0);
  const stateHold: number[] = Array(prices.length).fill(0);
  stateEmpty[0] = 0;
  stateHold[0] = -prices[0];
  for (let i = 1; i < prices.length; i++) {
    stateEmpty[i] = Math.max(
      stateEmpty[i - 1],
      stateHold[i - 1] + prices[i] - fee
    );
    stateHold[i] = Math.max(stateEmpty[i - 1] - prices[i], stateHold[i - 1]);
  }
  return stateEmpty[prices.length - 1];
}
const solutions = [maxProfit];

for (const maxProfit of solutions) {
  Deno.test("max profit 1", () => {
    assertEquals(maxProfit([1, 3, 2, 8, 4, 9], 2), 8);
  });
}
