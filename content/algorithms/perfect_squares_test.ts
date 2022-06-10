/**
 * Perfect Squares
 * <https://leetcode.com/problems/perfect-squares/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
function numSquares(n: number): number {
  // const max = Math.floor(Math.sqrt(n));
  const dp: number[] = Array(n + 1).fill(Number.MAX_VALUE);
  dp[0] = 0;
  if (n === 1) {
    return 1;
  }

  for (let i = 1; i <= dp.length; i++) {
    let isContinue = true;

    let j = 1;
    while (isContinue) {
      const coin = j * j;
      if (i - coin === 0) {
        dp[i] = 1;
      } else if (i - coin >= 0) {
        if (dp[i - coin] + 1 < dp[i]) {
          dp[i] = dp[i - coin] + 1;
        }
      }

      if ((j + 1) * (j + 1) <= i) {
        j++;
      } else {
        isContinue = false;
      }
    }
  }
  return dp[n] > n ? -1 : dp[n];
}

Deno.test("Perfect Squares", () => {
  assertEquals(numSquares(12), 3);
});
Deno.test("Perfect Squares 2", () => {
  assertEquals(numSquares(1), 1);
});
Deno.test("Perfect Squares 3", () => {
  assertEquals(numSquares(2), 2);
});
Deno.test("Perfect Squares 3", () => {
  assertEquals(numSquares(4), 1);
});
