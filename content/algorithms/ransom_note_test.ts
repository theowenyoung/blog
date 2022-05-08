/**
 * <https://leetcode.com/problems/ransom-note/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function canConstruct(ransomNote: string, magazine: string): boolean {
  const magazineMap = new Map<string, number>();
  for (const char of magazine) {
    if (magazineMap.has(char)) {
      magazineMap.set(char, (magazineMap.get(char) as number) + 1);
    } else {
      magazineMap.set(char, 1);
    }
  }
  for (const char of ransomNote) {
    if (!magazineMap.has(char)) {
      return false;
    } else if ((magazineMap.get(char) as number) > 0) {
      magazineMap.set(char, (magazineMap.get(char) as number) - 1);
    } else {
      return false;
    }
  }
  return true;
}

Deno.test("Ransom Note 1", () => {
  const ransomNote = "a";
  const magazine = "b";
  assertEquals(canConstruct(ransomNote, magazine), false);
});

Deno.test("Ransom Note 2", () => {
  const ransomNote = "aa";
  const magazine = "aab";
  assertEquals(canConstruct(ransomNote, magazine), true);
});
