/**
 * <https://leetcode.com/problems/permutation-in-string/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function checkInclusion1(s1: string, s2: string): boolean {
  // find all permutations in s1
  const permutations: string[] = [];

  function backtrack(currentString: string, rest: string) {
    if (rest.length > 0) {
      for (let i = 0; i < rest.length; i++) {
        const currentChar = rest[i];
        const nextString = currentString + currentChar;
        backtrack(
          nextString,
          rest.slice(0, i) + rest.slice(i + 1, rest.length)
        );
      }
    } else {
      permutations.push(currentString);
    }
  }
  backtrack("", s1);
  return permutations.some((item) => s2.includes(item));
}
function getStringHash(s: string): Record<string, number> {
  const map: Record<string, number> = {};
  for (let i = 0; i < s.length; i++) {
    if (map[s[i]]) {
      map[s[i]]++;
    } else {
      map[s[i]] = 1;
    }
  }
  return map;
}
function compareHash(
  h1: Record<string, number>,
  h2: Record<string, number>
): boolean {
  for (const key in h1) {
    if (h2[key] !== h1[key]) {
      return false;
    }
  }
  return true;
}

function checkInclusion2(s1: string, s2: string): boolean {
  // s1 target
  const s1Map = getStringHash(s1);

  // sliding s2 window

  for (let i = 0; i <= s2.length - s1.length; i++) {
    const s2Map = getStringHash(s2.slice(i, i + s1.length));
    if (compareHash(s1Map, s2Map)) {
      return true;
    }
  }
  return false;
}

const solutions = [checkInclusion1, checkInclusion2];

for (const checkInclusion of solutions) {
  Deno.test(checkInclusion.name + " checkInclusion test 1", () => {
    const s1 = "adc";
    const s2 = "dcda";
    const result = checkInclusion(s1, s2);
    const expected = true;
    assertEquals(result, expected);
  });
  Deno.test(checkInclusion.name + " checkInclusion test 2", () => {
    const s1 = "ab";
    const s2 = "eidbaooo";
    const result = checkInclusion(s1, s2);
    const expected = true;
    assertEquals(result, expected);
  });

  Deno.test(checkInclusion.name + " checkInclusion test 3", () => {
    const s1 = "prosperity";
    const s2 = "properties";
    const result = checkInclusion(s1, s2);
    const expected = false;
    assertEquals(result, expected);
  });

  Deno.test(checkInclusion.name + " checkInclusion test 4", () => {
    const s1 = "ab";
    const s2 = "eidbaooo";
    const result = checkInclusion(s1, s2);
    const expected = true;
    assertEquals(result, expected);
  });

  Deno.test(checkInclusion.name + " checkInclusion test 5", () => {
    const s1 = "hello";
    const s2 = "ooolleoooleh";
    const result = checkInclusion(s1, s2);
    const expected = false;
    assertEquals(result, expected);
  });
}
