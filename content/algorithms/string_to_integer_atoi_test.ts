/**
 * <https://leetcode.com/problems/string-to-integer-atoi/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function myAtoi(s: string): number {
  let result = 0;
  let isNegative = false;
  let currentState = "init";
  for (let i = 0; i < s.length; i++) {
    const currentChar = s[i];
    if (currentState === "init") {
      if (currentChar === "+") {
        currentState = "sign";
      } else if (currentChar === "-") {
        isNegative = true;
        currentState = "sign";
      } else if (currentChar === " ") {
        currentState = "init";
      } else if (currentChar >= "0" && currentChar <= "9") {
        result = result * 10 + parseInt(currentChar);
        currentState = "number";
      } else {
        return 0;
      }
    } else if (currentState === "sign") {
      if (currentChar >= "0" && currentChar <= "9") {
        result = result * 10 + parseInt(currentChar);
        currentState = "number";
      } else {
        return 0;
      }
    } else if (currentState === "number") {
      if (currentChar >= "0" && currentChar <= "9") {
        result = result * 10 + parseInt(currentChar);
        currentState = "number";
      } else {
        break;
      }
    }
  }
  if (isNegative) {
    result = -result;
  }
  if (result > 2147483647) {
    return 2147483647;
  }
  if (result < -2147483648) {
    return -2147483648;
  }
  return result;
}

Deno.test("stringToInteger", () => {
  assertEquals(myAtoi("42"), 42);
  assertEquals(myAtoi("   -42"), -42);
  assertEquals(myAtoi("4193 with words"), 4193);
  assertEquals(myAtoi("words and 987"), 0);
  assertEquals(myAtoi("-91283472332"), -2147483648);
  assertEquals(myAtoi("+1"), 1);
  assertEquals(myAtoi("+-2"), 0);
  assertEquals(myAtoi("+"), 0);
  assertEquals(myAtoi("3.14159"), 3);
});
