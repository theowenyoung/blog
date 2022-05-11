/**
 * <https://leetcode.com/problems/valid-parentheses/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
function isValid(s: string): boolean {
  const stacks: string[] = [];
  const pairs: { [key: string]: string } = {
    ")": "(",
    "]": "[",
    "}": "{",
  };
  for (let i = 0; i < s.length; i++) {
    const currentChar = s[i];
    if (currentChar === "(" || currentChar === "[" || currentChar === "{") {
      stacks.push(currentChar);
    } else {
      const lastChar = stacks.pop();
      if (lastChar === pairs[currentChar]) {
        // nothing
      } else {
        return false;
      }
    }
  }
  return stacks.length === 0;
}

Deno.test("valid parentheses test 1", () => {
  const s = "()";
  const result = isValid(s);
  const expected = true;
  assertEquals(result, expected);
});
Deno.test("valid parentheses test 2", () => {
  const s = "()[]{}";

  const result = isValid(s);
  const expected = true;
  assertEquals(result, expected);
});
Deno.test("valid parentheses test 3", () => {
  const s = "(]";
  const result = isValid(s);
  const expected = false;
  assertEquals(result, expected);
});
Deno.test("valid parentheses test 4", () => {
  const s = "([)]";
  const result = isValid(s);
  const expected = false;
  assertEquals(result, expected);
});
Deno.test("valid parentheses test 5", () => {
  const s = "{[]}";
  const result = isValid(s);
  const expected = true;
  assertEquals(result, expected);
});

Deno.test("valid parentheses test 6", () => {
  const s = "[";
  const result = isValid(s);
  const expected = false;
  assertEquals(result, expected);
});

Deno.test("valid parentheses test 7", () => {
  const s = "((";
  const result = isValid(s);
  const expected = false;
  assertEquals(result, expected);
});
