import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function fibonacci(n: number): number {
  if (n === 1) {
    return 1;
  } else if (n === 2) {
    return 1;
  } else {
    return fibonacci(n - 1) + fibonacci(n - 2);
  }
}

Deno.test("divide two integrers", () => {
  assertEquals(fibonacci(3), 2);
});

Deno.test("divide two integrers", () => {
  assertEquals(fibonacci(4), 3);
});

Deno.test("divide two integrers", () => {
  assertEquals(fibonacci(7), 13);
});
Deno.test("divide two integrers", () => {
  assertEquals(fibonacci(9), 34);
});
