function areAlmostEqual(s1: string, s2: string): boolean {
  if (s1.length !== s2.length) {
    return false;
  }
  let diff = 0;
  let di1 = 0;
  let di2 = 0;
  for (let i = 0; i < s1.length; i++) {
    if (s1[i] === s2[i]) {
      continue;
    }
    diff = diff + 1;

    if (diff > 2) return false;

    if (diff === 1) {
      di1 = i;
    } else {
      di2 = i;
    }
  }
  return (
    (diff === 0 || diff === 2) && s1[di1] === s2[di2] && s1[di2] === s2[di1]
  );
}

const a = areAlmostEqual("abcdefg", "gfedcba");
console.log("a", a);
