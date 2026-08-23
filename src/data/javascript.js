import { dedent } from "./dedent.js";

/**
 * JavaScript contest patterns. Arrow functions, destructuring and spread give a
 * heavy load of brackets, arrows and dots.
 *
 * Note: these deliberately avoid backtick template literals. The corpus is
 * itself authored inside tagged template literals, and a backtick would have to
 * be escaped — which would then be part of what you type.
 */
export const JAVASCRIPT = {
  bronze: [
    {
      topic: "fast io",
      title: "read all of stdin",
      code: dedent`
        const data = require('fs').readFileSync(0, 'utf8');
        const lines = data.split('\n');
        let ptr = 0;
        const next = () => lines[ptr++].trim();

        const n = Number(next());
        console.log(n * 2);
      `,
    },
    {
      topic: "arrays",
      title: "parse a line of ints",
      code: dedent`
        const a = next().split(' ').map(Number);
      `,
    },
    {
      topic: "arrays",
      title: "sum and maximum",
      code: dedent`
        const total = a.reduce((acc, x) => acc + x, 0);
        const best = Math.max(...a);
        console.log(total, best);
      `,
    },
    {
      topic: "branching",
      title: "chained comparison",
      code: dedent`
        if (a > b && b > c) {
            console.log('decreasing');
        } else if (a < b && b < c) {
            console.log('increasing');
        } else {
            console.log('neither');
        }
      `,
    },
    {
      topic: "strings",
      title: "palindrome check",
      code: dedent`
        const isPalindrome = (s) => {
            for (let lo = 0, hi = s.length - 1; lo < hi; lo++, hi--) {
                if (s[lo] !== s[hi]) return false;
            }
            return true;
        };
      `,
    },
    {
      topic: "counting",
      title: "frequency map",
      code: dedent`
        const freq = new Map();
        for (const w of words) {
            freq.set(w, (freq.get(w) ?? 0) + 1);
        }
      `,
    },
    {
      topic: "grids",
      title: "build a 2D array",
      code: dedent`
        const grid = Array.from({ length: r }, () => new Array(c).fill(0));
      `,
    },
    {
      topic: "math",
      title: "gcd with bigint",
      code: dedent`
        const gcd = (a, b) => (b === 0n ? a : gcd(b, a % b));
      `,
    },
  ],

  silver: [
    {
      topic: "sorting",
      title: "sort with a tiebreak",
      code: dedent`
        items.sort((x, y) => x.weight - y.weight || y.value - x.value);
      `,
    },
    {
      topic: "binary search",
      title: "lower bound",
      code: dedent`
        const lowerBound = (arr, target) => {
            let lo = 0, hi = arr.length;
            while (lo < hi) {
                const mid = (lo + hi) >> 1;
                if (arr[mid] < target) lo = mid + 1;
                else hi = mid;
            }
            return lo;
        };
      `,
    },
    {
      topic: "two pointers",
      title: "pair summing to target",
      code: dedent`
        let [lo, hi] = [0, n - 1];
        while (lo < hi) {
            const sum = a[lo] + a[hi];
            if (sum === target) break;
            sum < target ? lo++ : hi--;
        }
      `,
    },
    {
      topic: "prefix sums",
      title: "1D prefix sums",
      code: dedent`
        const pre = new Array(n + 1).fill(0);
        for (let i = 0; i < n; i++) {
            pre[i + 1] = pre[i] + a[i];
        }
        const rangeSum = pre[r + 1] - pre[l];
      `,
    },
    {
      topic: "bfs",
      title: "flood fill on a grid",
      code: dedent`
        const queue = [[sr, sc]];
        seen[sr][sc] = true;
        for (let head = 0; head < queue.length; head++) {
            const [r, c] = queue[head];
            for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
                const nr = r + dr, nc = c + dc;
                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
                if (seen[nr][nc] || grid[nr][nc] === '#') continue;
                seen[nr][nc] = true;
                queue.push([nr, nc]);
            }
        }
      `,
    },
    {
      topic: "graphs",
      title: "adjacency list",
      code: dedent`
        const adj = Array.from({ length: n + 1 }, () => []);
        for (let i = 0; i < m; i++) {
            const [u, v] = next().split(' ').map(Number);
            adj[u].push(v);
            adj[v].push(u);
        }
      `,
    },
    {
      topic: "greedy",
      title: "interval scheduling",
      code: dedent`
        iv.sort((x, y) => x[1] - y[1]);
        let taken = 0, lastEnd = -Infinity;
        for (const [start, end] of iv) {
            if (start >= lastEnd) {
                taken++;
                lastEnd = end;
            }
        }
      `,
    },
    {
      topic: "sets",
      title: "dedupe and rank",
      code: dedent`
        const vals = [...new Set(a)].sort((x, y) => x - y);
        const rank = new Map(vals.map((v, i) => [v, i]));
      `,
    },
  ],

  gold: [
    {
      topic: "shortest paths",
      title: "dijkstra with a binary heap",
      code: dedent`
        const dist = new Array(n).fill(Infinity);
        dist[src] = 0;
        const pq = new MinHeap();
        pq.push([0, src]);
        while (pq.size > 0) {
            const [d, u] = pq.pop();
            if (d > dist[u]) continue;
            for (const [v, w] of adj[u]) {
                if (d + w < dist[v]) {
                    dist[v] = d + w;
                    pq.push([dist[v], v]);
                }
            }
        }
      `,
    },
    {
      topic: "heaps",
      title: "sift up",
      code: dedent`
        push(item) {
            this.data.push(item);
            let i = this.data.length - 1;
            while (i > 0) {
                const parent = (i - 1) >> 1;
                if (this.data[parent][0] <= this.data[i][0]) break;
                [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
                i = parent;
            }
        }
      `,
    },
    {
      topic: "dsu",
      title: "union-find",
      code: dedent`
        class DSU {
            constructor(n) {
                this.par = Array.from({ length: n }, (_, i) => i);
                this.sz = new Array(n).fill(1);
            }
            find(x) {
                while (this.par[x] !== x) {
                    this.par[x] = this.par[this.par[x]];
                    x = this.par[x];
                }
                return x;
            }
        }
      `,
    },
    {
      topic: "dp",
      title: "0/1 knapsack",
      code: dedent`
        const dp = new Array(cap + 1).fill(0);
        for (let i = 0; i < n; i++) {
            for (let w = cap; w >= wt[i]; w--) {
                dp[w] = Math.max(dp[w], dp[w - wt[i]] + val[i]);
            }
        }
      `,
    },
    {
      topic: "modular math",
      title: "modpow with bigint",
      code: dedent`
        const power = (b, e, mod) => {
            let res = 1n;
            b %= mod;
            while (e > 0n) {
                if (e & 1n) res = (res * b) % mod;
                b = (b * b) % mod;
                e >>= 1n;
            }
            return res;
        };
      `,
    },
    {
      topic: "typed arrays",
      title: "typed arrays for speed",
      code: dedent`
        const dist = new Int32Array(n).fill(-1);
        const queue = new Int32Array(n);
        let head = 0, tail = 0;
        queue[tail++] = src;
        dist[src] = 0;
      `,
    },
    {
      topic: "topological sort",
      title: "kahn's algorithm",
      code: dedent`
        const queue = [];
        indeg.forEach((d, i) => { if (d === 0) queue.push(i); });
        const order = [];
        for (let head = 0; head < queue.length; head++) {
            const u = queue[head];
            order.push(u);
            for (const v of adj[u]) {
                if (--indeg[v] === 0) queue.push(v);
            }
        }
      `,
    },
    {
      topic: "output",
      title: "batch output",
      code: dedent`
        const out = [];
        for (const x of answers) {
            out.push(String(x));
        }
        process.stdout.write(out.join('\n') + '\n');
      `,
    },
  ],

  platinum: [
    {
      topic: "segment tree",
      title: "iterative segment tree",
      code: dedent`
        update(i, v) {
            for (this.tree[(i += this.size)] = v; i > 1; i >>= 1) {
                this.tree[i >> 1] = this.tree[i] + this.tree[i ^ 1];
            }
        }
      `,
    },
    {
      topic: "strings",
      title: "z-function",
      code: dedent`
        const zFunction = (s) => {
            const n = s.length;
            const z = new Int32Array(n);
            for (let i = 1, l = 0, r = 0; i < n; i++) {
                if (i < r) z[i] = Math.min(r - i, z[i - l]);
                while (i + z[i] < n && s[z[i]] === s[i + z[i]]) z[i]++;
                if (i + z[i] > r) { l = i; r = i + z[i]; }
            }
            return z;
        };
      `,
    },
    {
      topic: "generators",
      title: "generator over subsets",
      code: dedent`
        function* subsets(mask) {
            for (let sub = mask; ; sub = (sub - 1) & mask) {
                yield sub;
                if (sub === 0) break;
            }
        }
      `,
    },
    {
      topic: "geometry",
      title: "cross product and hull step",
      code: dedent`
        const cross = (o, a, b) =>
            (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

        while (hull.length >= 2 && cross(hull.at(-2), hull.at(-1), p) <= 0) {
            hull.pop();
        }
      `,
    },
    {
      topic: "bitsets",
      title: "bit manipulation",
      code: dedent`
        const lowest = mask & -mask;
        const without = mask & ~(1 << bit);
        const isSet = (mask >> bit) & 1;
        const popcount = (x) => {
            x -= (x >> 1) & 0x55555555;
            x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
            return (((x + (x >> 4)) & 0x0f0f0f0f) * 0x01010101) >> 24;
        };
      `,
    },
    {
      topic: "lca",
      title: "binary lifting",
      code: dedent`
        for (let k = 1; k < LOG; k++) {
            for (let v = 0; v < n; v++) {
                up[k][v] = up[k - 1][up[k - 1][v]];
            }
        }
      `,
    },
    {
      topic: "memoization",
      title: "memoise on a packed key",
      code: dedent`
        const memo = new Map();
        const solve = (i, j) => {
            const key = i * 5000 + j;
            if (memo.has(key)) return memo.get(key);
            const res = Math.min(solve(i - 1, j), solve(i, j - 1)) + cost[i][j];
            memo.set(key, res);
            return res;
        };
      `,
    },
    {
      topic: "matrix",
      title: "matrix multiplication mod p",
      code: dedent`
        const mul = (a, b) =>
            a.map((row) =>
                b[0].map((_, j) =>
                    row.reduce((acc, v, k) => (acc + v * b[k][j]) % MOD, 0)
                )
            );
      `,
    },
  ],
};
