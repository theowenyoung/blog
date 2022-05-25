/**
 * N-ary Tree Preorder Traversal
 * <https://leetcode.com/problems/n-ary-tree-preorder-traversal/>
 */
/**
 * Definition for node.

 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
class Node {
  val: number;
  children: Node[];
  constructor(val?: number) {
    this.val = val === undefined ? 0 : val;
    this.children = [];
  }
}
function preorder(root: Node | null): number[] {
  const result: number[] = [];

  const visit = (current: Node | null) => {
    if (current) {
      result.push(current.val);
      if (current.children && current.children.length > 0) {
        current.children.forEach((child) => {
          visit(child);
        });
      } else {
        return;
      }
    } else {
      return;
    }
  };
  visit(root);
  return result;
}

Deno.test("preorder 1", () => {
  const root = new Node(1);
  root.children = [new Node(3), new Node(2), new Node(4)];
  root.children[2].children = [new Node(5), new Node(6)];
  const result = preorder(root);
  assertEquals(result, [1, 3, 2, 4, 5, 6]);
});
