/**
 * Coin Change
 * <https://leetcode.com/problems/coin-change/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function coinChange1(coins: number[], amount: number): number {
  const dp: number[] = Array(amount + 1).fill(Number.MAX_VALUE);

  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (amount - coin === 0) {
        dp[i] = 1;
      } else if (i - coin >= 0) {
        if (dp[i - coin] + 1 < dp[i]) {
          dp[i] = dp[i - coin] + 1;
        }
      }
    }
  }

  return dp[amount] > amount ? -1 : dp[amount];
}
function coinChange2(coins: number[], amount: number): number {
  const dp: number[][][] = Array.from(Array(amount + 1), () => [
    [Number.MAX_VALUE],
    [],
  ]);

  dp[0] = [[0], []];
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (amount - coin === 0) {
        dp[i] = [[1], [coin]];
      } else if (i - coin >= 0) {
        if (dp[i - coin][0][0] + 1 < dp[i][0][0]) {
          dp[i] = [[dp[i - coin][0][0] + 1], [...dp[i - coin][1], coin]];
        }
      }
    }
  }

  return dp[amount][0][0] > amount ? -1 : dp[amount][0][0];
}

function coinChange3(coins: number[], amount: number): number {
  coins = coins.sort((a, b) => b - a);
  const len = coins.length;
  // current coins used numbers array
  const currentCoinsUsedArray: number[] = Array(coins.length).fill(0);
  // init currentCoinsUsedArray and min
  let initLeft = amount;
  let min = 0;
  for (let i = 0; i < coins.length; i++) {
    const coin = coins[i];
    currentCoinsUsedArray[i] = Math.floor(initLeft / coin);
    initLeft = initLeft % coin;
    min += currentCoinsUsedArray[i];
  }
  if (initLeft > 0) {
    min = Number.MAX_VALUE;
  }

  // start loop
  // is continue is dependent prefix numbers is 0;
  let isContinue = currentCoinsUsedArray.reduce((prev, current, i) => {
    if (i < currentCoinsUsedArray.length - 1) {
      return prev + current;
    } else {
      return prev;
    }
  }, 0);
  let total = 1;
  while (isContinue) {
    total++;
    // from end to start
    for (let i = len - 2; i >= 0; i--) {
      if (currentCoinsUsedArray[i] > 0) {
        // yes break;
        currentCoinsUsedArray[i] = currentCoinsUsedArray[i] - 1;
        // current left number
        let left = amount;
        let level = 0;
        for (let j = 0; j <= i; j++) {
          left = left - currentCoinsUsedArray[j] * coins[j];
          level += currentCoinsUsedArray[j];
        }

        for (let j = i + 1; j < len; j++) {
          currentCoinsUsedArray[j] = Math.floor(left / coins[j]);
          level += currentCoinsUsedArray[j];
          left = left % coins[j];
        }

        if (left === 0) {
          // yes can
          if (level < min) {
            min = level;
          }
        }
        isContinue = currentCoinsUsedArray.reduce((prev, current, i) => {
          if (i < currentCoinsUsedArray.length - 1) {
            return prev + current;
          } else {
            return prev;
          }
        }, 0);
        break;
      }
    }
  }
  console.log("total", total);

  if (min === Number.MAX_VALUE) {
    return -1;
  }
  return min;
}
// coinChange1, coinChange2,
const solutions = [coinChange1, coinChange2, coinChange3];

for (const coinChange of solutions) {
  Deno.test("Coin Change 1", () => {
    assertEquals(coinChange([1, 2, 5], 11), 3);
  });

  Deno.test("Coin Change 2", () => {
    assertEquals(coinChange([2, 5, 10, 1], 27), 4);
  });

  Deno.test("Coin Change 3", () => {
    assertEquals(coinChange([186, 419, 83, 408], 6249), 20);
  });

  Deno.test("Coin Change 4", () => {
    assertEquals(coinChange([5, 7, 11], 26), 4);
  });

  Deno.test("Coin Change 5", () => {
    assertEquals(coinChange([1, 3, 4, 5], 7), 2);
  });

  Deno.test("Coin Change 6", () => {
    assertEquals(coinChange([5, 7, 8], 29), 4);
  });
  Deno.test("Coin Change 7", () => {
    assertEquals(coinChange([3, 5, 7, 11], 52), 6);
  });
  Deno.test("Coin Change 8", () => {
    assertEquals(coinChange([2], 3), -1);
  });
  Deno.test("Coin Change 9", () => {
    assertEquals(coinChange([1], 0), 0);
  });
  Deno.test("Coin Change 10", () => {
    assertEquals(coinChange([1, 186, 419, 83, 408], 6249), 18);
  });
}
