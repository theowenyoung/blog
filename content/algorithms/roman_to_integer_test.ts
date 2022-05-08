/**
 * <https://leetcode.com/problems/roman-to-integer/>
 * <https://leetcode.com/problems/integer-to-roman/>
 */

import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.138.0/testing/asserts.ts";
const romanToInteger = (roman: string): number => {
  // IV -> 4
  // IX -> 9
  // XL -> 40
  const hash: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };
  if (roman.length < 1) {
    throw new Error("Roman can not be empty");
  }
  if (roman.length === 1) {
    if (hash[roman]) {
      return hash[roman];
    } else {
      throw new Error("Invalid roman");
    }
  }
  let result = 0;
  for (let i = 0; i < roman.length; i++) {
    // check if invalid
    const currentRomanLetter = hash[roman[i]];
    const nextRomanLetter = hash[roman[i + 1]];
    if (!currentRomanLetter) {
      throw new Error("Invalid roman");
    }
    if (i < roman.length - 1 && !nextRomanLetter) {
      throw new Error("Invalid roman");
    }

    if (nextRomanLetter && currentRomanLetter < nextRomanLetter) {
      result += nextRomanLetter - currentRomanLetter;
      i++;
    } else {
      result += currentRomanLetter;
    }
  }

  return result;
};

const integerToRoman = (number: number): string => {
  if (number < 1 || number > 3999) {
    throw new Error("Number must be between 1 and 3999");
  }

  const numbers = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const roman = [
    "M",
    "CM",
    "D",
    "CD",
    "C",
    "XC",
    "L",
    "XL",
    "X",
    "IX",
    "V",
    "IV",
    "I",
  ];
  let romanNumeral = "";
  for (let i = 0; i < numbers.length; i++) {
    while (number >= numbers[i]) {
      romanNumeral += roman[i];
      number -= numbers[i];
    }
  }
  return romanNumeral;
};

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
  Deno.test(`roman ${key} to integer ${value}`, () => {
    assertEquals(romanToInteger(key), value);
  });
  Deno.test(`integer ${value} to roman ${key}`, () => {
    assertEquals(integerToRoman(value), key);
  });
}

Deno.test(`integer 5100 to roman should throw exception`, () => {
  const resultFunction = () => integerToRoman(5100);
  assertThrows(resultFunction, Error, "Number must be between 1 and 3999");
});

Deno.test(`invalid roman should throw exception`, () => {
  const resultFunction = () => romanToInteger("TT");
  assertThrows(resultFunction, Error, "Invalid roman");
});
