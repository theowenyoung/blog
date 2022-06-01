/**
 * Binary Tree Level Order Traversal
 * <https://leetcode.com/problems/binary-tree-level-order-traversal/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
    this.val = val === undefined ? 0 : val;
    this.left = left === undefined ? null : left;
    this.right = right === undefined ? null : right;
  }
}

function levelOrder(root: TreeNode | null): number[][] {
  const results: number[][] = [];
  const bfs = (nodes: (TreeNode | null)[]) => {
    const currentLevelValues: number[] = [];
    const nextNodes: (TreeNode | null)[] = [];
    if (nodes.length > 0) {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if (node) {
          currentLevelValues.push(node.val);
          if (node.left) {
            nextNodes.push(node.left);
          }
          if (node.right) {
            nextNodes.push(node.right);
          }
        }
      }
      if (currentLevelValues.length > 0) {
        results.push(currentLevelValues);
      }

      if (nextNodes.length > 0) {
        bfs(nextNodes);
      }
    }
  };

  bfs([root]);
  return results;
}

function maxDepth(root: TreeNode | null): number {
  let results: number = 0;
  const bfs = (nodes: (TreeNode | null)[]) => {
    const currentLevelValues: number[] = [];
    const nextNodes: (TreeNode | null)[] = [];
    if (nodes.length > 0) {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if (node) {
          currentLevelValues.push(node.val);
          if (node.left) {
            nextNodes.push(node.left);
          }
          if (node.right) {
            nextNodes.push(node.right);
          }
        }
      }
      if (currentLevelValues.length > 0) {
        results = results + 1;
      }

      if (nextNodes.length > 0) {
        bfs(nextNodes);
      }
    }
  };

  bfs([root]);
  return results;
}

function maxDepthWithDFS(root: TreeNode | null): number {
  if (!root) {
    return 0;
  }
  const maxLeft = maxDepthWithDFS(root.left);

  const maxRight = maxDepthWithDFS(root.right);

  return Math.max(maxLeft, maxRight) + 1;
}

Deno.test("Binary Tree Level Order Traversal", () => {
  const root = new TreeNode(
    3,
    new TreeNode(9),
    new TreeNode(20, new TreeNode(15), new TreeNode(7))
  );
  const result = levelOrder(root);
  assertEquals(result, [[3], [9, 20], [15, 7]]);
});

Deno.test("Maximum Depth of Binary Tree", () => {
  const root = new TreeNode(
    3,
    new TreeNode(9),
    new TreeNode(20, new TreeNode(15), new TreeNode(7))
  );
  const result = maxDepthWithDFS(root);
  assertEquals(result, 3);
});

Deno.test("Maximum Depth of Binary Tree2", () => {
  const root = new TreeNode(
    3,
    new TreeNode(9),
    new TreeNode(20, new TreeNode(15), new TreeNode(7))
  );
  const result = maxDepth(root);
  assertEquals(result, 3);
});
