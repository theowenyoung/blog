/**
 * <https://leetcode.com/problems/populating-next-right-pointers-in-each-node/>
 */

import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

class Node {
  val: number;
  left: Node | null;
  right: Node | null;
  next: Node | null;
  constructor(val?: number, left?: Node, right?: Node, next?: Node) {
    this.val = val === undefined ? 0 : val;
    this.left = left === undefined ? null : left;
    this.right = right === undefined ? null : right;
    this.next = next === undefined ? null : next;
  }
}

function connect(root: Node | null): Node | null {
  if (!root) {
    return root;
  }

  let leftNode = root;

  while (leftNode.left) {
    let lineNode: Node | null = leftNode;

    while (lineNode) {
      lineNode!.left!.next = lineNode!.right;
      console.log("lineNode.next", lineNode!.next);

      if (!lineNode!.next) {
        console.log("lineNode.next", lineNode!.next);

        lineNode!.right!.next = lineNode!.next!.left;
      } else {
        lineNode!.right!.next = null;
      }
      lineNode = lineNode!.next;
    }
    leftNode = leftNode.left;
  }
  return root;
}

Deno.test("0257. Binary Tree Paths", () => {
  const latestNode = new Node(2);
  const node1 = new Node(1, undefined, undefined, latestNode);
  const node2 = new Node(3, undefined, undefined, node1);
  const node3 = new Node(5, undefined, undefined, node2);
  const node4 = new Node(2, node1, latestNode);
  const node5 = new Node(3, node3, node2, node4);
  const rootNode = new Node(1, node5, node4);

  assertEquals(
    connect(
      new Node(
        1,
        new Node(3, new Node(5), new Node(3)),
        new Node(2, new Node(1), new Node(2))
      )
    ),
    rootNode
  );
});
