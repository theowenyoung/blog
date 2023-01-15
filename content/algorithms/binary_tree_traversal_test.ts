/**
 * Binary Tree Preorder Traversal
 * <https://leetcode.com/problems/binary-tree-preorder-traversal/>
 * <https://leetcode.com/problems/binary-tree-inorder-traversal/>
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

function preorderTraversal(root: TreeNode | null): number[] {
  const visit: number[] = [];

  const pre = (node: TreeNode | null): void => {
    if (node) {
      visit.push(node.val);
      pre(node.left);
      pre(node?.right);
    }
  };
  pre(root);
  return visit;
}

function inorderTraversal(root: TreeNode | null): number[] {
  const seen: number[] = [];

  const visit = (node: TreeNode | null): void => {
    if (node) {
      visit(node.left);
      seen.push(node.val);
      visit(node?.right);
    }
  };
  visit(root);
  return seen;
}
function postOrderTraversal(root: TreeNode | null): number[] {
  const seen: number[] = [];

  const visit = (node: TreeNode | null): void => {
    if (node) {
      console.log("pre left", node.val);

      visit(node.left);
      console.log("in", node.val);

      visit(node.right);
      console.log("right", node.val);

      seen.push(node.val);
    }
  };
  visit(root);
  return seen;
}

Deno.test("Binary Tree Preorder Traversal", () => {
  assertEquals(
    preorderTraversal(
      new TreeNode(
        1,
        new TreeNode(2, new TreeNode(4), new TreeNode(5)),
        new TreeNode(3, new TreeNode(6), new TreeNode(7))
      )
    ),
    [1, 2, 4, 5, 3, 6, 7]
  );
});
Deno.test("Binary Tree Inorder Traversal", () => {
  assertEquals(
    inorderTraversal(
      new TreeNode(
        1,
        new TreeNode(2, new TreeNode(4), new TreeNode(5)),
        new TreeNode(3, new TreeNode(6), new TreeNode(7))
      )
    ),
    [4, 2, 5, 1, 6, 3, 7]
  );
});
Deno.test("Binary Tree postOrder Traversal", () => {
  assertEquals(
    postOrderTraversal(
      new TreeNode(
        1,
        new TreeNode(2, new TreeNode(4), new TreeNode(5)),
        new TreeNode(3, new TreeNode(6), new TreeNode(7))
      )
    ),
    [4, 5, 2, 6, 7, 3, 1]
  );
});
