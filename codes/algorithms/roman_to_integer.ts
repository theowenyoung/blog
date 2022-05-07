export const romanToInteger = (roman: string): number => {
  // IV -> 4
  // IX -> 9
  // XL -> 40

  return 5;
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
