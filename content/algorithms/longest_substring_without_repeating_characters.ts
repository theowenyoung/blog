export function lengthOfLongestSubstring(s: string): number {
  const arr = s.split("https://deno.land/std@0.138.0/testing/asserts.ts");
  let longest = 0;
  const set: Set<string> = new Set();
  for (let i = 0; i < arr.length; i++) {
    set.add(arr[i]);
    let tryIndex = i + 1;
    while (arr[tryIndex] && !set.has(arr[tryIndex])) {
      set.add(arr[tryIndex]);
      tryIndex++;
    }
    if (set.size > longest) {
      longest = set.size;
    }
    set.clear();
  }

  return longest;
}
