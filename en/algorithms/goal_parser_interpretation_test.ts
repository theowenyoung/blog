/**
 *  Goal Parser Interpretation
 * <https://leetcode.com/problems/goal-parser-interpretation/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function interpret(command: string): string {
  let final = "";
  let state = "init";
  let position = 0;
  while (position < command.length) {
    const currentChar = command[position];
    if (state === "init") {
      if (currentChar === "G") {
        final += "G";
        position++;
        continue;
      } else if (currentChar === "(") {
        state = "open";
        position++;
        continue;
      }
    } else if (state === "open") {
      if (currentChar === ")") {
        state = "init";
        position++;
        final += "o";
      } else if (currentChar === "a") {
        state = "init";
        position = position + 3;
        final += "al";
      }
    }
  }
  return final;
}

Deno.test("Goal", () => {
  assertEquals(interpret("(al)G(al)()()G"), "alGalooG");
});
