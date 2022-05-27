/**
 * All Paths From Source to Target
 * <https://leetcode.com/problems/all-paths-from-source-to-target/>
 */

import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function allPathsSourceTarget(graph: number[][]): number[][] {
  const results: number[][] = [];
  const dp = (index: number, currentPath: number[]) => {
    if (index === graph.length - 1) {
      results.push([...currentPath, index]);
      return;
    }

    if (graph[index].length === 0) {
      return;
    }
    for (const newIndex of graph[index]) {
      dp(newIndex, [...currentPath, index]);
    }
  };

  for (const index of graph[0]) {
    dp(index, [0]);
  }

  return results;
}

Deno.test("All Paths From Source to Target", () => {
  assertEquals(allPathsSourceTarget([[1, 2], [3], [3], []]), [
    [0, 1, 3],
    [0, 2, 3],
  ]);
});
