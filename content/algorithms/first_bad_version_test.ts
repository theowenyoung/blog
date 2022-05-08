/**
 * <https://leetcode.com/problems/first-bad-version/>
 */

/**
 * The knows API is defined in the parent class Relation.
 * isBadVersion(version: number): boolean {
 *     ...
 * };
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

const mySolution = function (isBadVersion: (version: number) => boolean) {
  const binarySearch = (startNumber: number, endNumber: number): number => {
    const middleNumber = Math.floor((startNumber + endNumber) / 2);

    if (isBadVersion(middleNumber)) {
      // check pervious
      if (middleNumber - 1 > 0 && !isBadVersion(middleNumber - 1)) {
        return middleNumber;
      } else if (middleNumber === 1) {
        return middleNumber;
      } else {
        return binarySearch(startNumber, middleNumber - 1);
      }
    } else {
      return binarySearch(middleNumber + 1, endNumber);
    }
  };

  return function (n: number): number {
    return binarySearch(1, n);
  };
};
const solution = function (isBadVersion: (version: number) => boolean) {
  return function (n: number): number {
    let lowVersion = 1;
    let highVersion = n;
    let tempBadVersion = n;
    while (lowVersion < highVersion) {
      const middleVersion =
        lowVersion + Math.floor((highVersion - lowVersion) / 2);
      const isMiddleVersionBad = isBadVersion(middleVersion);
      if (isMiddleVersionBad) {
        if (middleVersion - 1 > 0) {
          // there is a previous version
          const isMiddleVersionPreviousBad = isBadVersion(middleVersion - 1);
          if (!isMiddleVersionPreviousBad) {
            // lucky!
            return middleVersion;
          } else {
            highVersion = middleVersion - 1;
            tempBadVersion = middleVersion - 1;
          }
        } else {
          // there is no previous version
          return middleVersion;
        }
      } else {
        lowVersion = middleVersion + 1;
      }
    }
    return tempBadVersion;
  };
};

const solutions = [mySolution, solution];

for (const solution of solutions) {
  Deno.test(solution.name + " First Bad Version 1", () => {
    const isBadVersion = (version: number): boolean => {
      if (version >= 4) {
        return true;
      } else {
        return false;
      }
    };
    const result = solution(isBadVersion)(5);
    assertEquals(result, 4);
  });

  Deno.test(solution.name + " First Bad Version 2", () => {
    const isBadVersion = (version: number): boolean => {
      if (version >= 1) {
        return true;
      } else {
        return false;
      }
    };
    const result = solution(isBadVersion)(1);
    assertEquals(result, 1);
  });

  Deno.test(solution.name + " First Bad Version 3", () => {
    const isBadVersion = (version: number): boolean => {
      if (version >= 1702766719) {
        return true;
      } else {
        return false;
      }
    };
    const result = solution(isBadVersion)(2126753390);
    assertEquals(result, 1702766719);
  });
  Deno.test(solution.name + " First Bad Version 4", () => {
    const isBadVersion = (version: number): boolean => {
      if (version >= 8) {
        return true;
      } else {
        return false;
      }
    };
    const result = solution(isBadVersion)(10);
    assertEquals(result, 8);
  });
}
