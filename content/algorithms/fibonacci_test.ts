/**
 * <https://leetcode.com/problems/fibonacci-number/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function fibonacci1(n: number): number {
  if (n === 1) {
    return 1;
  } else if (n === 2) {
    return 1;
  } else {
    return fibonacci1(n - 1) + fibonacci1(n - 2);
  }
}

function fibonacci2(n: number): number {
  if (n === 0) {
    return 0;
  } else if (n === 1) {
    return 1;
  }
  // dp
  const dp: number[] = Array(n + 1).fill(0);
  dp[0] = 0;
  dp[1] = 1;

  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 2] + dp[i - 1];
  }
  return dp[n];
}

const solutions = [fibonacci1, fibonacci2];

for (const fibonacci of solutions) {
  Deno.test("divide two integrers", () => {
    assertEquals(fibonacci(3), 2);
  });

  Deno.test("divide two integrers", () => {
    assertEquals(fibonacci(4), 3);
  });

  Deno.test("divide two integrers", () => {
    assertEquals(fibonacci(7), 13);
  });
  Deno.test("divide two integrers", () => {
    assertEquals(fibonacci(9), 34);
  });
}
