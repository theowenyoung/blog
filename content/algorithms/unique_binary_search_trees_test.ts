/**
 * <https://leetcode.com/problems/unique-binary-search-trees/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
function numTrees(n: number): number {
  // numTrees(0) => 1
  // numTrees(1) => 1
  // numTrees(2) => numTrees(0)*numTrees(1) +numTrees(1)*numTrees(0) = 2
  // numTrees(3) => numTrees(0)*numTrees(2) + numTrees(1)*numTrees(1) +numTrees(2)*numTrees(0) = 5
  // numTrees(4) => numTrees(0)*numTrees(3) + numTrees(1)*numTrees(2) +  numTrees(2)*numTrees(1) + numTrees(3)*numTrees(0) = 14

  const dp: number[] = Array(n + 1).fill(0);
  dp[0] = 1;
  dp[1] = 1;

  for (let i = 2; i <= n; i++) {
    let total = 0;
    for (let j = 0; j < i; j++) {
      const left = j;
      const right = i - j - 1;
      total += dp[left] * dp[right];
    }
    dp[i] = total;
  }
  return dp[n];
}

Deno.test("unique binary search trees 1", () => {
  assertEquals(numTrees(1), 1);
});

Deno.test("unique binary search trees 2", () => {
  assertEquals(numTrees(2), 2);
});
Deno.test("unique binary search trees 3", () => {
  assertEquals(numTrees(3), 5);
});
Deno.test("unique binary search trees 4", () => {
  assertEquals(numTrees(4), 14);
});
