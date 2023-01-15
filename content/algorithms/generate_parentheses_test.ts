/**
 * <https://leetcode.com/problems/generate-parentheses/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function backtrack(
  result: string[],
  currentString: string,
  openCount: number,
  closeCount: number,
  n: number
): void {
  if (openCount === n && closeCount === n) {
    result.push(currentString);
    return;
  }
  if (openCount < n) {
    backtrack(result, currentString + "(", openCount + 1, closeCount, n);
  }
  if (openCount > closeCount) {
    backtrack(result, currentString + ")", openCount, closeCount + 1, n);
  }
}

function generateParenthesis(n: number): string[] {
  const result: string[] = [];

  backtrack(result, "", 0, 0, n);

  return result;
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
