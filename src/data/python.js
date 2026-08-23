import { dedent } from "./dedent.js";

/**
 * Original Python implementations of common contest patterns. Python trades
 * braces for colons, underscores and comprehension brackets — a different
 * symbol workout from C++ or Java.
 */
export const PYTHON = {
  bronze: [
    {
      topic: "fast io",
      title: "contest input skeleton",
      code: dedent`
        import sys
        input = sys.stdin.readline

        n = int(input())
        print(n * 2)
      `,
    },
    {
      topic: "arrays",
      title: "read a list of ints",
      code: dedent`
        n = int(input())
        a = list(map(int, input().split()))
      `,
    },
    {
      topic: "arrays",
      title: "sum and maximum",
      code: dedent`
        total = sum(a)
        best = max(a)
        print(total, best)
      `,
    },
    {
      topic: "branching",
      title: "three-way compare",
      code: dedent`
        if a > b > c:
            print("decreasing")
        elif a < b < c:
            print("increasing")
        else:
            print("neither")
      `,
    },
    {
      topic: "grids",
      title: "read a character grid",
      code: dedent`
        r, c = map(int, input().split())
        grid = [input().strip() for _ in range(r)]
      `,
    },
    {
      topic: "strings",
      title: "palindrome check",
      code: dedent`
        def is_palindrome(s):
            lo, hi = 0, len(s) - 1
            while lo < hi:
                if s[lo] != s[hi]:
                    return False
                lo += 1
                hi -= 1
            return True
      `,
    },
    {
      topic: "counting",
      title: "counter frequency",
      code: dedent`
        from collections import Counter

        freq = Counter(words)
        for word, count in freq.most_common():
            print(word, count)
      `,
    },
    {
      topic: "simulation",
      title: "walk a direction string",
      code: dedent`
        x, y = 0, 0
        moves = {"N": (0, 1), "S": (0, -1), "E": (1, 0), "W": (-1, 0)}
        for mv in path:
            dx, dy = moves[mv]
            x += dx
            y += dy
        print(x, y)
      `,
    },
    {
      topic: "brute force",
      title: "all pairs",
      code: dedent`
        best = 0
        for i in range(n):
            for j in range(i + 1, n):
                best = max(best, a[i] * a[j])
      `,
    },
    {
      topic: "math",
      title: "gcd and lcm",
      code: dedent`
        from math import gcd

        def lcm(a, b):
            return a // gcd(a, b) * b
      `,
    },
    {
      topic: "math",
      title: "digit sum",
      code: dedent`
        def digit_sum(n):
            total = 0
            while n > 0:
                total += n % 10
                n //= 10
            return total
      `,
    },
    {
      topic: "sorting",
      title: "sort and join",
      code: dedent`
        a.sort()
        print(" ".join(map(str, a)))
      `,
    },
    {
      topic: "tuples",
      title: "read pairs and sort",
      code: dedent`
        pts = [tuple(map(int, input().split())) for _ in range(n)]
        pts.sort(key=lambda p: (p[0], -p[1]))
      `,
    },
    {
      topic: "io",
      title: "multiple test cases",
      code: dedent`
        t = int(input())
        for _ in range(t):
            n = int(input())
            solve(n)
      `,
    },
  ],

  silver: [
    {
      topic: "sorting",
      title: "sort by multiple keys",
      code: dedent`
        items.sort(key=lambda it: (it.weight, -it.value))
      `,
    },
    {
      topic: "binary search",
      title: "bisect on a sorted list",
      code: dedent`
        from bisect import bisect_left, bisect_right

        idx = bisect_left(a, target)
        if idx < len(a) and a[idx] == target:
            print("found at", idx)
      `,
    },
    {
      topic: "two pointers",
      title: "pair summing to target",
      code: dedent`
        lo, hi = 0, n - 1
        while lo < hi:
            cur = a[lo] + a[hi]
            if cur == target:
                break
            if cur < target:
                lo += 1
            else:
                hi -= 1
      `,
    },
    {
      topic: "prefix sums",
      title: "1D prefix sums",
      code: dedent`
        from itertools import accumulate

        pre = [0] + list(accumulate(a))
        range_sum = pre[r + 1] - pre[l]
      `,
    },
    {
      topic: "prefix sums",
      title: "2D prefix sums",
      code: dedent`
        pre = [[0] * (c + 1) for _ in range(r + 1)]
        for i in range(1, r + 1):
            for j in range(1, c + 1):
                pre[i][j] = grid[i-1][j-1] + pre[i-1][j] + pre[i][j-1] - pre[i-1][j-1]
      `,
    },
    {
      topic: "bfs",
      title: "flood fill on a grid",
      code: dedent`
        from collections import deque

        q = deque([(sr, sc)])
        seen[sr][sc] = True
        while q:
            r, c = q.popleft()
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if not (0 <= nr < R and 0 <= nc < C):
                    continue
                if seen[nr][nc] or grid[nr][nc] == "#":
                    continue
                seen[nr][nc] = True
                q.append((nr, nc))
      `,
    },
    {
      topic: "dfs",
      title: "iterative dfs",
      code: dedent`
        stack = [start]
        visited = [False] * n
        visited[start] = True
        while stack:
            u = stack.pop()
            for v in adj[u]:
                if not visited[v]:
                    visited[v] = True
                    stack.append(v)
      `,
    },
    {
      topic: "graphs",
      title: "build an adjacency list",
      code: dedent`
        from collections import defaultdict

        adj = defaultdict(list)
        for _ in range(m):
            u, v = map(int, input().split())
            adj[u].append(v)
            adj[v].append(u)
      `,
    },
    {
      topic: "greedy",
      title: "interval scheduling",
      code: dedent`
        iv.sort(key=lambda x: x[1])
        taken, last_end = 0, float("-inf")
        for start, end in iv:
            if start >= last_end:
                taken += 1
                last_end = end
      `,
    },
    {
      topic: "sliding window",
      title: "max window sum",
      code: dedent`
        window = best = 0
        for i, x in enumerate(a):
            window += x
            if i >= k:
                window -= a[i - k]
            if i >= k - 1:
                best = max(best, window)
      `,
    },
    {
      topic: "binary search",
      title: "binary search on the answer",
      code: dedent`
        lo, hi = 1, 10 ** 18
        while lo < hi:
            mid = (lo + hi) // 2
            if feasible(mid):
                hi = mid
            else:
                lo = mid + 1
        print(lo)
      `,
    },
    {
      topic: "compression",
      title: "coordinate compression",
      code: dedent`
        vals = sorted(set(a))
        rank = {v: i for i, v in enumerate(vals)}
        a = [rank[x] for x in a]
      `,
    },
    {
      topic: "difference array",
      title: "range increment",
      code: dedent`
        diff = [0] * (n + 1)
        for l, r, v in updates:
            diff[l] += v
            diff[r + 1] -= v
        for i in range(1, n):
            diff[i] += diff[i - 1]
      `,
    },
    {
      topic: "intervals",
      title: "merge overlapping intervals",
      code: dedent`
        iv.sort()
        merged = []
        for start, end in iv:
            if merged and start <= merged[-1][1]:
                merged[-1][1] = max(merged[-1][1], end)
            else:
                merged.append([start, end])
      `,
    },
  ],

  gold: [
    {
      topic: "shortest paths",
      title: "dijkstra",
      code: dedent`
        import heapq

        dist = [float("inf")] * n
        dist[src] = 0
        pq = [(0, src)]
        while pq:
            d, u = heapq.heappop(pq)
            if d > dist[u]:
                continue
            for v, w in adj[u]:
                if d + w < dist[v]:
                    dist[v] = d + w
                    heapq.heappush(pq, (dist[v], v))
      `,
    },
    {
      topic: "dsu",
      title: "union-find with path compression",
      code: dedent`
        class DSU:
            def __init__(self, n):
                self.par = list(range(n))
                self.sz = [1] * n

            def find(self, x):
                while self.par[x] != x:
                    self.par[x] = self.par[self.par[x]]
                    x = self.par[x]
                return x

            def unite(self, a, b):
                a, b = self.find(a), self.find(b)
                if a == b:
                    return False
                if self.sz[a] < self.sz[b]:
                    a, b = b, a
                self.par[b] = a
                self.sz[a] += self.sz[b]
                return True
      `,
    },
    {
      topic: "mst",
      title: "kruskal",
      code: dedent`
        edges.sort()
        dsu = DSU(n)
        total = 0
        for w, u, v in edges:
            if dsu.unite(u, v):
                total += w
      `,
    },
    {
      topic: "topological sort",
      title: "kahn's algorithm",
      code: dedent`
        from collections import deque

        q = deque(i for i in range(n) if indeg[i] == 0)
        order = []
        while q:
            u = q.popleft()
            order.append(u)
            for v in adj[u]:
                indeg[v] -= 1
                if indeg[v] == 0:
                    q.append(v)
      `,
    },
    {
      topic: "dp",
      title: "0/1 knapsack",
      code: dedent`
        dp = [0] * (cap + 1)
        for i in range(n):
            for w in range(cap, wt[i] - 1, -1):
                dp[w] = max(dp[w], dp[w - wt[i]] + val[i])
        print(dp[cap])
      `,
    },
    {
      topic: "dp",
      title: "longest increasing subsequence",
      code: dedent`
        from bisect import bisect_left

        tails = []
        for x in a:
            idx = bisect_left(tails, x)
            if idx == len(tails):
                tails.append(x)
            else:
                tails[idx] = x
        print(len(tails))
      `,
    },
    {
      topic: "dp",
      title: "coin change",
      code: dedent`
        dp = [float("inf")] * (target + 1)
        dp[0] = 0
        for coin in coins:
            for v in range(coin, target + 1):
                dp[v] = min(dp[v], dp[v - coin] + 1)
      `,
    },
    {
      topic: "modular math",
      title: "modpow and inverse",
      code: dedent`
        MOD = 10 ** 9 + 7

        def power(b, e, mod=MOD):
            res = 1
            b %= mod
            while e > 0:
                if e & 1:
                    res = res * b % mod
                b = b * b % mod
                e >>= 1
            return res
      `,
    },
    {
      topic: "fenwick",
      title: "binary indexed tree",
      code: dedent`
        class BIT:
            def __init__(self, n):
                self.t = [0] * (n + 1)

            def add(self, i, v):
                while i < len(self.t):
                    self.t[i] += v
                    i += i & -i

            def query(self, i):
                s = 0
                while i > 0:
                    s += self.t[i]
                    i -= i & -i
                return s
      `,
    },
    {
      topic: "memoization",
      title: "lru_cache recursion",
      code: dedent`
        from functools import lru_cache

        @lru_cache(maxsize=None)
        def solve(i, remaining):
            if i == n or remaining == 0:
                return 0
            best = solve(i + 1, remaining)
            if wt[i] <= remaining:
                best = max(best, val[i] + solve(i + 1, remaining - wt[i]))
            return best
      `,
    },
    {
      topic: "graphs",
      title: "bipartite check",
      code: dedent`
        color = [-1] * n
        q = deque([0])
        color[0] = 0
        while q:
            u = q.popleft()
            for v in adj[u]:
                if color[v] == -1:
                    color[v] = color[u] ^ 1
                    q.append(v)
                elif color[v] == color[u]:
                    print("not bipartite")
                    return
      `,
    },
    {
      topic: "bitmask dp",
      title: "travelling salesman",
      code: dedent`
        dp = [[INF] * n for _ in range(1 << n)]
        dp[1][0] = 0
        for mask in range(1, 1 << n):
            for u in range(n):
                if not (mask >> u) & 1 or dp[mask][u] == INF:
                    continue
                for v in range(n):
                    if (mask >> v) & 1:
                        continue
                    nxt = mask | (1 << v)
                    dp[nxt][v] = min(dp[nxt][v], dp[mask][u] + cost[u][v])
      `,
    },
    {
      topic: "trees",
      title: "subtree sizes without recursion",
      code: dedent`
        order, par = [], [-1] * n
        stack = [0]
        while stack:
            u = stack.pop()
            order.append(u)
            for v in adj[u]:
                if v != par[u]:
                    par[v] = u
                    stack.append(v)
        for u in reversed(order):
            for v in adj[u]:
                if v != par[u]:
                    sz[u] += sz[v]
      `,
    },
    {
      topic: "dp",
      title: "grid paths with obstacles",
      code: dedent`
        dp = [[0] * C for _ in range(R)]
        dp[0][0] = 1 if grid[0][0] == "." else 0
        for i in range(R):
            for j in range(C):
                if grid[i][j] == "#":
                    continue
                if i:
                    dp[i][j] = (dp[i][j] + dp[i-1][j]) % MOD
                if j:
                    dp[i][j] = (dp[i][j] + dp[i][j-1]) % MOD
      `,
    },
  ],

  platinum: [
    {
      topic: "comprehensions",
      title: "nested comprehension with a guard",
      code: dedent`
        pairs = [(i, j) for i in range(n) for j in range(i + 1, n) if a[i] + a[j] == target]
        grid = [[0] * (c + 1) for _ in range(r + 1)]
      `,
    },
    {
      topic: "slicing",
      title: "slice assignment and reversal",
      code: dedent`
        a[l:r] = a[l:r][::-1]
        evens, odds = a[::2], a[1::2]
        rotated = a[k:] + a[:k]
      `,
    },
    {
      topic: "unpacking",
      title: "star unpacking and zip",
      code: dedent`
        xs, ys = zip(*pts)
        head, *rest = a
        merged = {**base, **override, "extra": (lambda x: x ** 2)(n)}
      `,
    },
    {
      topic: "bitsets",
      title: "bit manipulation",
      code: dedent`
        lowest = mask & -mask
        without = mask & ~(1 << bit)
        sub = mask
        while sub:
            best = min(best, dp[mask ^ sub] + cost[sub])
            sub = (sub - 1) & mask
        print(bin(mask).count("1"), (mask & -mask).bit_length() - 1)
      `,
    },
    {
      topic: "segment tree",
      title: "iterative segment tree",
      code: dedent`
        class SegTree:
            def __init__(self, data):
                self.size = len(data)
                self.tree = [0] * (2 * self.size)
                self.tree[self.size:] = data
                for i in range(self.size - 1, 0, -1):
                    self.tree[i] = self.tree[2*i] + self.tree[2*i+1]

            def update(self, i, v):
                i += self.size
                self.tree[i] = v
                while i > 1:
                    i >>= 1
                    self.tree[i] = self.tree[2*i] + self.tree[2*i+1]
      `,
    },
    {
      topic: "segment tree",
      title: "range query",
      code: dedent`
        def query(self, l, r):
            res = 0
            l += self.size
            r += self.size + 1
            while l < r:
                if l & 1:
                    res += self.tree[l]
                    l += 1
                if r & 1:
                    r -= 1
                    res += self.tree[r]
                l >>= 1
                r >>= 1
            return res
      `,
    },
    {
      topic: "scc",
      title: "iterative tarjan",
      code: dedent`
        disc = [0] * n
        low = [0] * n
        on_stack = [False] * n
        stack, timer = [], 0

        def strongconnect(root):
            nonlocal timer
            work = [(root, 0)]
            while work:
                u, pi = work.pop()
      `,
    },
    {
      topic: "geometry",
      title: "monotone chain convex hull",
      code: dedent`
        def cross(o, a, b):
            return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

        def hull(pts):
            pts = sorted(set(pts))
            lower = []
            for p in pts:
                while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
                    lower.pop()
                lower.append(p)
            return lower
      `,
    },
    {
      topic: "matrix",
      title: "matrix exponentiation",
      code: dedent`
        def mat_mul(a, b):
            n, k, m = len(a), len(b), len(b[0])
            c = [[0] * m for _ in range(n)]
            for i in range(n):
                for x in range(k):
                    if a[i][x]:
                        for j in range(m):
                            c[i][j] = (c[i][j] + a[i][x] * b[x][j]) % MOD
            return c
      `,
    },
    {
      topic: "lca",
      title: "binary lifting",
      code: dedent`
        def lca(u, v):
            if depth[u] < depth[v]:
                u, v = v, u
            diff = depth[u] - depth[v]
            for k in range(LOG):
                if (diff >> k) & 1:
                    u = up[k][u]
            if u == v:
                return u
            for k in range(LOG - 1, -1, -1):
                if up[k][u] != up[k][v]:
                    u, v = up[k][u], up[k][v]
            return up[0][u]
      `,
    },
    {
      topic: "strings",
      title: "z-function",
      code: dedent`
        def z_function(s):
            n = len(s)
            z = [0] * n
            l = r = 0
            for i in range(1, n):
                if i < r:
                    z[i] = min(r - i, z[i - l])
                while i + z[i] < n and s[z[i]] == s[i + z[i]]:
                    z[i] += 1
                if i + z[i] > r:
                    l, r = i, i + z[i]
            return z
      `,
    },
    {
      topic: "strings",
      title: "kmp prefix function",
      code: dedent`
        def prefix_function(s):
            pi = [0] * len(s)
            for i in range(1, len(s)):
                j = pi[i - 1]
                while j > 0 and s[i] != s[j]:
                    j = pi[j - 1]
                if s[i] == s[j]:
                    j += 1
                pi[i] = j
            return pi
      `,
    },
    {
      topic: "strings",
      title: "polynomial hashing",
      code: dedent`
        h = [0] * (n + 1)
        pw = [1] * (n + 1)
        for i, ch in enumerate(s):
            h[i + 1] = (h[i] * BASE + ord(ch)) % MOD
            pw[i + 1] = pw[i] * BASE % MOD
      `,
    },
    {
      topic: "flows",
      title: "dinic level graph",
      code: dedent`
        def bfs():
            level[:] = [-1] * n
            q = deque([src])
            level[src] = 0
            while q:
                u = q.popleft()
                for eid in adj[u]:
                    to, cap = edges[eid]
                    if cap > 0 and level[to] == -1:
                        level[to] = level[u] + 1
                        q.append(to)
            return level[sink] != -1
      `,
    },
    {
      topic: "sqrt decomposition",
      title: "mo's algorithm ordering",
      code: dedent`
        BLOCK = int(n ** 0.5) + 1
        queries.sort(key=lambda q: (q[0] // BLOCK, q[1] if (q[0] // BLOCK) % 2 == 0 else -q[1]))
      `,
    },
    {
      topic: "sparse table",
      title: "range minimum query",
      code: dedent`
        LOG = n.bit_length()
        sparse = [[0] * n for _ in range(LOG)]
        sparse[0] = a[:]
        for k in range(1, LOG):
            for i in range(n - (1 << k) + 1):
                sparse[k][i] = min(sparse[k-1][i], sparse[k-1][i + (1 << (k-1))])
      `,
    },
    {
      topic: "combinatorics",
      title: "factorials and inverses",
      code: dedent`
        fact = [1] * (MAXN + 1)
        for i in range(1, MAXN + 1):
            fact[i] = fact[i-1] * i % MOD
        inv = [1] * (MAXN + 1)
        inv[MAXN] = power(fact[MAXN], MOD - 2)
        for i in range(MAXN, 0, -1):
            inv[i-1] = inv[i] * i % MOD
      `,
    },
    {
      topic: "recursion",
      title: "raise the recursion limit",
      code: dedent`
        import sys
        from threading import Thread

        sys.setrecursionlimit(1 << 25)

        def main():
            solve()

        Thread(target=main).start()
      `,
    },
  ],
};
