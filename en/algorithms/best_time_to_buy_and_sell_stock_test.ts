/**
 * <https://leetcode.com/problems/best-time-to-buy-and-sell-stock/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function maxProfit1(prices: number[]): number {
  let max = 0;
  for (let i = 0; i < prices.length - 1; i++) {
    for (let j = i + 1; j < prices.length; j++) {
      max = Math.max(prices[j] - prices[i], max);
    }
  }
  return max;
}

function maxProfit2(prices: number[]): number {
  let left = 0,
    right = 1;
  let max = 0;
  while (right < prices.length && left < prices.length - 1) {
    if (prices[right] > prices[left]) {
      max = Math.max(prices[right] - prices[left], max);
    } else {
      left = right;
    }
    right++;
  }
  return max;
}

const solutions = [maxProfit1, maxProfit2];

for (const maxProfit of solutions) {
  Deno.test("max profit 1", () => {
    assertEquals(maxProfit([7, 1, 5, 3, 6, 4]), 5);
  });

  Deno.test("max profit 2", () => {
    assertEquals(maxProfit([7, 6, 4, 3, 1]), 0);
  });

  Deno.test("max profit 3", () => {
    assertEquals(maxProfit([2, 1, 2, 0, 1]), 1);
  });
  Deno.test("max profit 4", () => {
    assertEquals(maxProfit([1, 2, 4, 2, 5, 7, 2, 4, 9, 0, 9]), 9);
  });
}
