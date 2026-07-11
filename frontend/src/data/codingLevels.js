export const CODING_LEVELS = [
  {
    id: 1, name: 'SERVER ROOM', sec: 'A1', lang: 'python', diff: 'easy', cat: 'code',
    objs: {
      door: { ico: '🔒', ttl: 'EMERGENCY DOOR', scen: 'The emergency exit is sealed with a numeric cipher. Provide the correct access sequence.', prob: 'Write a function that takes a list of numbers and returns their sum.', exmp: 'Input: [1,2,3,4]  →  Output: 10', tag: 'ARRAYS', hints: ['Use a loop to iterate', 'Try built-in sum()', 'return sum(nums)'], xp: 200, pats: [/sum\(nums\)/, /return\s+sum/, /\+=/, /reduce/] },
      terminal: { ico: '💻', ttl: 'ACCESS TERMINAL', scen: 'Terminal needs a prime verification sequence before granting root access.', prob: 'Write isPrime(n) — return True if n is prime, False otherwise.', exmp: 'isPrime(7) → True\nisPrime(4) → False', tag: 'LOGIC', hints: ['Check divisors 2 to sqrt(n)', 'import math; use math.sqrt', 'return all(n%i!=0 for i in range(2,int(math.sqrt(n))+1)) and n>1'], xp: 250, pats: [/sqrt|math\.sqrt/, /range\(2/, /all\(/, /isprime/i] },
      vault: { ico: '🔐', ttl: 'DATA VAULT', scen: 'Vault decryption requires string reversal to unlock the credential store.', prob: 'Write reverse(s) that returns the reversed string.', exmp: 'reverse("ESCAPE") → "EPACSE"', tag: 'STRINGS', hints: ['Strings support slicing', 'Try s[::-1]', 'return s[::-1]'], xp: 150, pats: [/\[::-1\]/, /reverse/] }
    }
  },
  {
    id: 2, name: 'CRYPTO LAB', sec: 'B2', lang: 'java', diff: 'medium', cat: 'code',
    objs: {
      door: { ico: '🚪', ttl: 'LAB DOOR', scen: 'Binary keypad — provide binary string of the given decimal.', prob: 'Write toBinary(n) returning binary string representation of n.', exmp: 'toBinary(10) → "1010"', tag: 'BINARY', hints: ['Use bin() in Python', 'Strip the 0b prefix with [2:]', 'return bin(n)[2:]'], xp: 300, pats: [/bin\(/, /toString\(.*2\)/, /%\s*2/, /binary/i] },
      terminal: { ico: '💻', ttl: 'CRYPTO TERMINAL', scen: 'Duplicate access token detected — find the intruder.', prob: 'Return the first duplicate element in an array.', exmp: '[1,3,2,3,1] → 3', tag: 'HASH MAP', hints: ['Track visited elements', 'Use a set()', 'When you see an element already in seen, return it'], xp: 350, pats: [/set\(\)/, /seen/i, /HashSet/, /in seen/] },
      vault: { ico: '🔐', ttl: 'CRYPTO VAULT', scen: 'Caesar cipher lock. Decode the message shifted by 3.', prob: 'Write decode(s) to decode a Caesar cipher (shift of +3).', exmp: 'decode("KHOOR") → "HELLO"', tag: 'STRINGS', hints: ['Shift each char back by 3', 'Use ord() and chr()', 'Wrap around with modulo 26'], xp: 400, pats: [/ord\(/, /chr\(/, /%\s*26/, /caesar/i] }
    }
  },
  {
    id: 3, name: 'AI CORE', sec: 'C3', lang: 'cpp', diff: 'hard', cat: 'code',
    objs: {
      door: { ico: '🚪', ttl: 'AI DOOR', scen: 'Fibonacci gate — compute the nth Fibonacci number.', prob: 'Write fib(n) returning the nth Fibonacci number.', exmp: 'fib(6) → 8', tag: 'RECURSION', hints: ['fib(n)=fib(n-1)+fib(n-2)', 'Base: fib(0)=0, fib(1)=1', 'Use memoization for speed'], xp: 400, pats: [/fib\(/, /fibonacci/i, /memo/i] },
      terminal: { ico: '💻', ttl: 'AI TERMINAL', scen: 'Sorting protocol — implement without using built-in sort.', prob: 'Sort an array without using built-in sort functions.', exmp: '[3,1,4,1,5] → [1,1,3,4,5]', tag: 'SORTING', hints: ['Try bubble sort', 'Compare adjacent elements', 'Swap if arr[j]>arr[j+1]'], xp: 450, pats: [/for/, /swap|temp/i, /\[j\]/, /\[j\+1\]/] },
      vault: { ico: '🔐', ttl: 'AI VAULT', scen: 'Palindrome shield — verify the passphrase integrity.', prob: 'Write isPalin(s) returning True if s is a palindrome.', exmp: 'isPalin("RACECAR") → True', tag: 'STRINGS', hints: ['Compare with its reverse', 's == s[::-1]', 'Works for odd/even lengths'], xp: 300, pats: [/\[::-1\]/, /palin/i, /reverse/] }
    }
  }
];

for (let i = 4; i <= 6; i++) {
  CODING_LEVELS.push({
    id: i, name: 'SECTOR ' + i, sec: String.fromCharCode(63 + i) + i, lang: 'sql', diff: 'hard', cat: 'code',
    objs: {
      door: { ico: '🚪', ttl: 'DOOR', scen: 'Coming soon!', prob: 'Challenge locked.', exmp: '', tag: 'TBD', hints: ['...'], xp: 500, pats: [/./] },
      terminal: { ico: '💻', ttl: 'TERMINAL', scen: '', prob: 'Coming soon!', exmp: '', tag: 'TBD', hints: [], xp: 500, pats: [/./] },
      vault: { ico: '🔐', ttl: 'VAULT', scen: '', prob: 'Coming soon!', exmp: '', tag: 'TBD', hints: [], xp: 500, pats: [/./] }
    }
  });
}

export const CODE_TEMPLATES = {
  python: {
    door: "def solve(nums):\n    # Return the sum\n    pass\n\nprint(solve([1,2,3,4]))",
    terminal: "import math\ndef isPrime(n):\n    # Return True if prime\n    pass\n\nprint(isPrime(7))",
    vault: "def reverse(s):\n    # Return reversed string\n    pass\n\nprint(reverse('ESCAPE'))"
  },
  java: {
    door: "public int solve(int[] nums) {\n    // Return sum\n    return 0;\n}",
    terminal: "public boolean isPrime(int n) {\n    // Return true if prime\n    return false;\n}",
    vault: "public String reverse(String s) {\n    // Return reversed\n    return \"\";\n}"
  },
  cpp: {
    door: "int solve(vector<int>& nums) {\n    // Return sum\n    return 0;\n}",
    terminal: "bool isPrime(int n) {\n    // Return true if prime\n    return false;\n}",
    vault: "string rev(string s) {\n    // Return reversed\n    return \"\";\n}"
  },
  c: {
    door: "int solve(int nums[], int len) {\n    // Return sum\n    return 0;\n}",
    terminal: "int isPrime(int n) {\n    // Return 1 if prime\n    return 0;\n}",
    vault: "void reverse(char s[]) {\n    // Reverse in place\n}"
  },
  sql: {
    door: "-- Write your query\nSELECT 0;",
    terminal: "-- Write your query\nSELECT 0;",
    vault: "-- Write your query\nSELECT 0;"
  }
};

export function getTemplate(lang, obj) {
  return (CODE_TEMPLATES[lang] && CODE_TEMPLATES[lang][obj]) || '# Write your solution here\n';
}
