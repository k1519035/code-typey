import { dedent } from "./dedent.js";

/**
 * Rust contest patterns. Turbofish, lifetimes, closures and `::` make this the
 * densest symbol workout in the corpus.
 */
export const RUST = {
  bronze: [
    {
      topic: "fast io",
      title: "read a line from stdin",
      code: dedent`
        use std::io::{self, BufRead, Write};

        fn main() {
            let stdin = io::stdin();
            let mut line = String::new();
            stdin.lock().read_line(&mut line).unwrap();
            let n: i64 = line.trim().parse().unwrap();
            println!("{}", n * 2);
        }
      `,
    },
    {
      topic: "arrays",
      title: "parse whitespace-separated ints",
      code: dedent`
        let a: Vec<i64> = line
            .trim()
            .split_whitespace()
            .map(|x| x.parse().unwrap())
            .collect();
      `,
    },
    {
      topic: "arrays",
      title: "sum and maximum",
      code: dedent`
        let total: i64 = a.iter().sum();
        let best = *a.iter().max().unwrap();
        println!("{} {}", total, best);
      `,
    },
    {
      topic: "branching",
      title: "match on ordering",
      code: dedent`
        match a.cmp(&b) {
            Ordering::Less => println!("less"),
            Ordering::Equal => println!("equal"),
            Ordering::Greater => println!("greater"),
        }
      `,
    },
    {
      topic: "strings",
      title: "palindrome check",
      code: dedent`
        fn is_palindrome(s: &str) -> bool {
            let b = s.as_bytes();
            let mut lo = 0usize;
            let mut hi = b.len() - 1;
            while lo < hi {
                if b[lo] != b[hi] {
                    return false;
                }
                lo += 1;
                hi -= 1;
            }
            true
        }
      `,
    },
    {
      topic: "counting",
      title: "frequency with a hashmap",
      code: dedent`
        use std::collections::HashMap;

        let mut freq: HashMap<char, usize> = HashMap::new();
        for ch in s.chars() {
            *freq.entry(ch).or_insert(0) += 1;
        }
      `,
    },
    {
      topic: "grids",
      title: "read a byte grid",
      code: dedent`
        let grid: Vec<Vec<u8>> = (0..r)
            .map(|_| read_line().trim().bytes().collect())
            .collect();
      `,
    },
    {
      topic: "math",
      title: "gcd",
      code: dedent`
        fn gcd(a: u64, b: u64) -> u64 {
            if b == 0 { a } else { gcd(b, a % b) }
        }
      `,
    },
  ],

  silver: [
    {
      topic: "sorting",
      title: "sort by key with a tiebreak",
      code: dedent`
        items.sort_by(|x, y| {
            x.weight.cmp(&y.weight).then(y.value.cmp(&x.value))
        });
      `,
    },
    {
      topic: "binary search",
      title: "partition point",
      code: dedent`
        let idx = a.partition_point(|&x| x < target);
        if idx < a.len() && a[idx] == target {
            println!("found at {}", idx);
        }
      `,
    },
    {
      topic: "two pointers",
      title: "pair summing to target",
      code: dedent`
        let (mut lo, mut hi) = (0usize, n - 1);
        while lo < hi {
            let sum = a[lo] + a[hi];
            if sum == target {
                break;
            } else if sum < target {
                lo += 1;
            } else {
                hi -= 1;
            }
        }
      `,
    },
    {
      topic: "prefix sums",
      title: "scan into prefix sums",
      code: dedent`
        let mut pre = vec![0i64; n + 1];
        for i in 0..n {
            pre[i + 1] = pre[i] + a[i];
        }
        let range_sum = pre[r + 1] - pre[l];
      `,
    },
    {
      topic: "bfs",
      title: "flood fill on a grid",
      code: dedent`
        let mut q = VecDeque::new();
        q.push_back((sr, sc));
        seen[sr][sc] = true;
        while let Some((r, c)) = q.pop_front() {
            for (dr, dc) in [(0i32, 1i32), (0, -1), (1, 0), (-1, 0)] {
                let (nr, nc) = (r as i32 + dr, c as i32 + dc);
                if nr < 0 || nc < 0 { continue; }
                let (nr, nc) = (nr as usize, nc as usize);
                if nr >= rows || nc >= cols || seen[nr][nc] { continue; }
                seen[nr][nc] = true;
                q.push_back((nr, nc));
            }
        }
      `,
    },
    {
      topic: "graphs",
      title: "build an adjacency list",
      code: dedent`
        let mut adj: Vec<Vec<usize>> = vec![Vec::new(); n + 1];
        for _ in 0..m {
            let (u, v) = read_pair();
            adj[u].push(v);
            adj[v].push(u);
        }
      `,
    },
    {
      topic: "greedy",
      title: "interval scheduling",
      code: dedent`
        iv.sort_by_key(|&(_, end)| end);
        let mut taken = 0;
        let mut last_end = i64::MIN;
        for &(start, end) in &iv {
            if start >= last_end {
                taken += 1;
                last_end = end;
            }
        }
      `,
    },
    {
      topic: "compression",
      title: "coordinate compression",
      code: dedent`
        let mut vals = a.clone();
        vals.sort_unstable();
        vals.dedup();
        let ranked: Vec<usize> = a
            .iter()
            .map(|x| vals.binary_search(x).unwrap())
            .collect();
      `,
    },
  ],

  gold: [
    {
      topic: "shortest paths",
      title: "dijkstra with a reversed heap",
      code: dedent`
        use std::collections::BinaryHeap;
        use std::cmp::Reverse;

        let mut dist = vec![u64::MAX; n];
        let mut pq = BinaryHeap::new();
        dist[src] = 0;
        pq.push(Reverse((0u64, src)));
        while let Some(Reverse((d, u))) = pq.pop() {
            if d > dist[u] { continue; }
            for &(v, w) in &adj[u] {
                if d + w < dist[v] {
                    dist[v] = d + w;
                    pq.push(Reverse((dist[v], v)));
                }
            }
        }
      `,
    },
    {
      topic: "dsu",
      title: "union-find",
      code: dedent`
        struct Dsu {
            par: Vec<usize>,
            sz: Vec<usize>,
        }

        impl Dsu {
            fn new(n: usize) -> Self {
                Dsu { par: (0..n).collect(), sz: vec![1; n] }
            }
            fn find(&mut self, x: usize) -> usize {
                if self.par[x] != x {
                    self.par[x] = self.find(self.par[x]);
                }
                self.par[x]
            }
        }
      `,
    },
    {
      topic: "dp",
      title: "0/1 knapsack",
      code: dedent`
        let mut dp = vec![0i64; cap + 1];
        for i in 0..n {
            for w in (wt[i]..=cap).rev() {
                dp[w] = dp[w].max(dp[w - wt[i]] + val[i]);
            }
        }
      `,
    },
    {
      topic: "dp",
      title: "longest increasing subsequence",
      code: dedent`
        let mut tails: Vec<i64> = Vec::new();
        for &x in &a {
            match tails.binary_search(&x) {
                Ok(_) => {}
                Err(pos) if pos == tails.len() => tails.push(x),
                Err(pos) => tails[pos] = x,
            }
        }
      `,
    },
    {
      topic: "modular math",
      title: "modpow",
      code: dedent`
        fn power(mut b: u64, mut e: u64, m: u64) -> u64 {
            let mut res = 1u64;
            b %= m;
            while e > 0 {
                if e & 1 == 1 { res = res * b % m; }
                b = b * b % m;
                e >>= 1;
            }
            res
        }
      `,
    },
    {
      topic: "topological sort",
      title: "kahn's algorithm",
      code: dedent`
        let mut q: VecDeque<usize> = (0..n).filter(|&i| indeg[i] == 0).collect();
        let mut order = Vec::with_capacity(n);
        while let Some(u) = q.pop_front() {
            order.push(u);
            for &v in &adj[u] {
                indeg[v] -= 1;
                if indeg[v] == 0 { q.push_back(v); }
            }
        }
      `,
    },
    {
      topic: "fenwick",
      title: "binary indexed tree",
      code: dedent`
        impl Bit {
            fn add(&mut self, mut i: usize, v: i64) {
                while i < self.t.len() {
                    self.t[i] += v;
                    i += i & i.wrapping_neg();
                }
            }
            fn query(&self, mut i: usize) -> i64 {
                let mut s = 0;
                while i > 0 {
                    s += self.t[i];
                    i -= i & i.wrapping_neg();
                }
                s
            }
        }
      `,
    },
    {
      topic: "iterators",
      title: "windows and chunks",
      code: dedent`
        let best = a
            .windows(k)
            .map(|w| w.iter().sum::<i64>())
            .max()
            .unwrap_or(0);
      `,
    },
  ],

  platinum: [
    {
      topic: "segment tree",
      title: "iterative segment tree",
      code: dedent`
        impl SegTree {
            fn update(&mut self, mut i: usize, v: i64) {
                i += self.size;
                self.tree[i] = v;
                while i > 1 {
                    i >>= 1;
                    self.tree[i] = self.tree[2 * i] + self.tree[2 * i + 1];
                }
            }
        }
      `,
    },
    {
      topic: "traits",
      title: "generic monoid segment tree",
      code: dedent`
        trait Monoid {
            type T: Clone;
            fn identity() -> Self::T;
            fn combine(a: &Self::T, b: &Self::T) -> Self::T;
        }

        struct SegTree<M: Monoid> {
            size: usize,
            tree: Vec<M::T>,
        }
      `,
    },
    {
      topic: "strings",
      title: "z-function",
      code: dedent`
        fn z_function(s: &[u8]) -> Vec<usize> {
            let n = s.len();
            let mut z = vec![0usize; n];
            let (mut l, mut r) = (0usize, 0usize);
            for i in 1..n {
                if i < r { z[i] = (r - i).min(z[i - l]); }
                while i + z[i] < n && s[z[i]] == s[i + z[i]] { z[i] += 1; }
                if i + z[i] > r { l = i; r = i + z[i]; }
            }
            z
        }
      `,
    },
    {
      topic: "geometry",
      title: "cross product and hull step",
      code: dedent`
        fn cross(o: (i64, i64), a: (i64, i64), b: (i64, i64)) -> i64 {
            (a.0 - o.0) * (b.1 - o.1) - (a.1 - o.1) * (b.0 - o.0)
        }

        while hull.len() >= 2 && cross(hull[hull.len() - 2], hull[hull.len() - 1], p) <= 0 {
            hull.pop();
        }
      `,
    },
    {
      topic: "lca",
      title: "binary lifting",
      code: dedent`
        for k in 1..LOG {
            for v in 0..n {
                up[k][v] = up[k - 1][up[k - 1][v]];
            }
        }
      `,
    },
    {
      topic: "bitsets",
      title: "bit tricks",
      code: dedent`
        let lowest = mask & mask.wrapping_neg();
        let popcount = mask.count_ones();
        let without = mask & !(1u64 << bit);
        let subsets = std::iter::successors(Some(mask), |&s| {
            if s == 0 { None } else { Some((s - 1) & mask) }
        });
      `,
    },
    {
      topic: "matrix",
      title: "matrix multiplication mod p",
      code: dedent`
        fn mul(a: &[[u64; N]; N], b: &[[u64; N]; N]) -> [[u64; N]; N] {
            let mut c = [[0u64; N]; N];
            for i in 0..N {
                for k in 0..N {
                    if a[i][k] == 0 { continue; }
                    for j in 0..N {
                        c[i][j] = (c[i][j] + a[i][k] * b[k][j]) % MOD;
                    }
                }
            }
            c
        }
      `,
    },
    {
      topic: "flows",
      title: "edge list with paired reverses",
      code: dedent`
        fn add_edge(&mut self, u: usize, v: usize, cap: i64) {
            self.adj[u].push(self.edges.len());
            self.edges.push(Edge { to: v, cap });
            self.adj[v].push(self.edges.len());
            self.edges.push(Edge { to: u, cap: 0 });
        }
      `,
    },
  ],
};
