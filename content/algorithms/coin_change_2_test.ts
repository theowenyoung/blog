/**
 * Coin Change
 * <https://leetcode.com/problems/coin-change-2/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function change1(amount: number, coins: number[]): number {
  const visit: Record<string, number> = {};
  function dfs(
    currentNumber: number,
    onlyCanChooseThisIndexOrGreaterIndex: number
  ): number {
    const key = `${onlyCanChooseThisIndexOrGreaterIndex}-${currentNumber}`;
    if (visit[key] !== undefined) {
      return visit[key];
    }

    if (currentNumber === 0) {
      return 1;
    } else if (
      currentNumber < 0 ||
      onlyCanChooseThisIndexOrGreaterIndex === coins.length
    ) {
      return 0;
    }
    let total = 0;
    for (let i = onlyCanChooseThisIndexOrGreaterIndex; i < coins.length; i++) {
      total = total + dfs(currentNumber - coins[i], i);
    }

    visit[key] = total;
    return total;
  }
  return dfs(amount, 0);
}

function change2(amount: number, coins: number[]): number {
  const dp: number[][] = Array.from(Array(coins.length + 1), () =>
    Array(amount + 1).fill(0)
  );

  for (let i = 0; i <= coins.length; i++) {
    const coin = coins[i - 1] || 0;
    for (let j = 0; j <= amount; j++) {
      if (j === 0) {
        dp[i][j] = 1;
        continue;
      }
      if (i === 0) {
        dp[i][j] = 0;
        continue;
      }
      dp[i][j] = dp[i - 1][j] + (dp[i][j - coin] ?? 0);
    }
  }
  return dp[coins.length][amount];
}

//change1, change2,
const solutions = [change1, change2];

for (const coinChange of solutions) {
  Deno.test("Coin Change 1", () => {
    assertEquals(coinChange(5, [1, 2, 5]), 4);
  });

  Deno.test("coin 2", () => {
    assertEquals(coinChange(26, [3, 5, 7, 11]), 8);
  });
}
