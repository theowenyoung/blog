import { addTwoNumbers, arrayToListNode, ListNode } from "./add_two_numbers.ts";
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

Deno.test("add two numbers test 1", () => {
  const l1 = new ListNode(2, new ListNode(4, new ListNode(3)));
  const l2 = new ListNode(5, new ListNode(6, new ListNode(4)));
  const result = addTwoNumbers(l1, l2);
  const expected = new ListNode(7, new ListNode(0, new ListNode(8)));
  assertEquals(result, expected);
});
/*
Input: l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]
Output: [8,9,9,9,0,0,0,1]
*/
Deno.test("add two numbers test 2", () => {
  const l1 = new ListNode(
    9,
    new ListNode(
      9,
      new ListNode(
        9,
        new ListNode(9, new ListNode(9, new ListNode(9, new ListNode(9))))
      )
    )
  );
  const l2 = new ListNode(9, new ListNode(9, new ListNode(9, new ListNode(9))));
  const result = addTwoNumbers(l1, l2);
  const expected = new ListNode(
    8,
    new ListNode(
      9,
      new ListNode(
        9,
        new ListNode(
          9,
          new ListNode(0, new ListNode(0, new ListNode(0, new ListNode(1))))
        )
      )
    )
  );
  assertEquals(result, expected);
});

Deno.test("add two numbers test 3", () => {
  const l1 = [
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 1,
  ];
  const l2 = [5, 6, 4];
  const l1Node = arrayToListNode(l1);
  const l2Node = arrayToListNode(l2);
  const result = addTwoNumbers(l1Node, l2Node);
  const expected = [
    6, 6, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 1,
  ];
  const expectedNode = arrayToListNode(expected);
  assertEquals(result, expectedNode);
});

Deno.test("add two numbers test 4", () => {
  const l1 = [0];
  const l2 = [0];
  const l1Node = arrayToListNode(l1);
  const l2Node = arrayToListNode(l2);
  const result = addTwoNumbers(l1Node, l2Node);
  const expected = [0];
  const expectedNode = arrayToListNode(expected);
  assertEquals(result, expectedNode);
});
