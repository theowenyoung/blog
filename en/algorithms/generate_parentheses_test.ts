/**
 * <https://leetcode.com/problems/generate-parentheses/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function generateParenthesis(n: number): string[] {
  return [];
}

Deno.test("generateParenthesis", () => {
  assertEquals(generateParenthesis(3), [
    "((()))",
    "(()())",
    "(())()",
    "()(())",
    "()()()",
  ]);
});
