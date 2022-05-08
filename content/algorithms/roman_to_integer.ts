export const romanToInteger = (roman: string): number => {
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

export const integerToRoman = (number: number): string => {
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
