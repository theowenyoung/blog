---
title: Solve Algorithms
date: 2022-05-08T06:17:19+08:00
updated: 2022-05-08
taxonomies:
  categories:
    - Notes
  tags:
    - Algorithm
---

When I saw Leetcode on the timeline, I thought you guys were so "cult"...

Until I started doing Leetcode problems myself - "Damn it's super fun just to solve the problems, the daily intellectual challenge is the new fun every day!"

So now I'm starting to save [these algorithm problems'](https://leetcode.com/problemset/all/) solutions to [here](https://github.com/theowenyoung/blog/tree/main/content/algorithms).

I solve these problems in Typescript , and add a few unit tests with Deno, perfect! Don't know if I'll ever get the chance to do the whole thing in this lifetime.

<!-- more -->

## Usage

```bash
git clone git@github.com:theowenyoung/blog.git
deno test
```

## List

- [Sort](./sort_test.ts)
  - [Bubble Sort](./bubble_sort.ts)
  - [Selection Sort](./selection_sort.ts)
  - [Insertion Sort](./insertion_sort.ts)
  - [Quick Sort](./quick_sort.ts)
  - [Merge Sort](./merge_sort.ts)
- [Integer to Roman](https://leetcode.com/problems/integer-to-roman/) - [Answer](./roman_to_integer_test.ts)
- [Two Sum](https://leetcode.com/problems/two-sum/) - [Answer](./two_sum_test.ts)
- [Add Two Numbers](https://leetcode.com/problems/add-two-numbers/) - [Answer](./add_two_numbers_test.ts)
- [Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/) - [Answer](./longest_substring_without_repeating_characters_test.ts)
- [Binary Search](https://leetcode.com/problems/binary-search/) - [Answer](./binary_search_test.ts)
- [First Bad Version](https://leetcode.com/problems/first-bad-version/) - [Answer](./first_bad_version_test.ts)
- [Search Insert Position](https://leetcode.com/problems/search-insert-position/) - [Answer](./search_insert_position_test.ts)
