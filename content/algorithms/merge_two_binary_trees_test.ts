/**
 * <https://leetcode.com/problems/merge-two-binary-trees/submissions/>
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

function mergeTrees(
  root1: TreeNode | null,
  root2: TreeNode | null
): TreeNode | null {
  if (root1 === null) {
    return root2;
  }
  if (root2 === null) {
    return root1;
  }
  root1.val += root2.val;
  root1.left = mergeTrees(root1.left, root2.left);
  root1.right = mergeTrees(root1.right, root2.right);

  return root1;
}

Deno.test("0257. Binary Tree Paths", () => {
  assertEquals(
    mergeTrees(
      new TreeNode(
        1,
        new TreeNode(3, new TreeNode(5), new TreeNode(3)),
        new TreeNode(2, new TreeNode(1), new TreeNode(2))
      ),
      new TreeNode(
        2,
        new TreeNode(1, new TreeNode(4), new TreeNode(7)),
        new TreeNode(3, new TreeNode(2), new TreeNode(5))
      )
    ),
    new TreeNode(
      3,
      new TreeNode(4, new TreeNode(9), new TreeNode(10)),
      new TreeNode(5, new TreeNode(3), new TreeNode(7))
    )
  );
});
