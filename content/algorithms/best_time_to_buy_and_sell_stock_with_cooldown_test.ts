/**
 * Best Time to Buy and Sell Stock with Cooldown
 * <https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function maxProfit(prices: number[]): number {
  const stateCool: number[] = Array(prices.length).fill(0);
  const stateBuy: number[] = Array(prices.length).fill(0);
  const stateSold: number[] = Array(prices.length).fill(0);
  stateCool[0] = 0;
  stateBuy[0] = -prices[0];
  stateSold[0] = 0;
  for (let i = 1; i < prices.length; i++) {
    stateBuy[i] = Math.max(stateCool[i - 1] - prices[i], stateBuy[i - 1]);
    stateCool[i] = Math.max(stateSold[i - 1], stateCool[i - 1]);
    stateSold[i] = prices[i] + stateBuy[i - 1];
  }
  return Math.max(stateSold[prices.length - 1], stateCool[prices.length - 1]);
}
const solutions = [maxProfit];

for (const maxProfit of solutions) {
  Deno.test("max profit 1", () => {
    assertEquals(maxProfit([1, 2, 3, 0, 2]), 3);
  });
  Deno.test("max profit 2", () => {
    assertEquals(maxProfit([1, 2]), 1);
  });
}
