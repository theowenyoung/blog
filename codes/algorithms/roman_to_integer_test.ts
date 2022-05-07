import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.138.0/testing/asserts.ts";
import { romanToInteger, integerToRoman } from "./roman_to_integer.ts";
const hash = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
  IV: 4,
  IX: 9,
  XL: 40,
  XC: 90,
  CD: 400,
  CM: 900,
  VI: 6,
  VII: 7,
  VIII: 8,
  DCCLXXXIX: 789,
  CMXCIX: 999,
  MCDXCIX: 1499,
  MMMCMXCIX: 3999,
};
for (const [key, value] of Object.entries(hash)) {
  // Deno.test(`roman ${key} to integer ${value}`, () => {
  //   assertEquals(romanToInteger(key), value);
  // });
  Deno.test(`integer ${value} to roman ${key}`, () => {
    assertEquals(integerToRoman(value), key);
  });
}

Deno.test(`integer 5100 to roman should throw exception`, () => {
  const resultFunction = () => integerToRoman(5100);
  assertThrows(resultFunction, Error, "Number must be between 1 and 3999");
});
