import { dedent } from "./dedent.js";

/**
 * Original Java implementations of common contest patterns. Java punishes you
 * with generics, boxing and verbose I/O — which is exactly the symbol load
 * worth drilling.
 */
export const JAVA = {
  bronze: [
    {
      topic: "fast io",
      title: "buffered reader skeleton",
      code: dedent`
        public class Main {
            public static void main(String[] args) throws IOException {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                int n = Integer.parseInt(br.readLine().trim());
                System.out.println(n * 2);
            }
        }
      `,
    },
    {
      topic: "arrays",
      title: "read n values",
      code: dedent`
        StringTokenizer st = new StringTokenizer(br.readLine());
        int[] a = new int[n];
        for (int i = 0; i < n; i++) {
            a[i] = Integer.parseInt(st.nextToken());
        }
      `,
    },
    {
      topic: "arrays",
      title: "sum and maximum",
      code: dedent`
        long total = 0;
        int best = Integer.MIN_VALUE;
        for (int i = 0; i < n; i++) {
            total += a[i];
            best = Math.max(best, a[i]);
        }
        System.out.println(total + " " + best);
      `,
    },
    {
      topic: "branching",
      title: "three-way compare",
      code: dedent`
        if (a > b && b > c) {
            System.out.println("decreasing");
        } else if (a < b && b < c) {
            System.out.println("increasing");
        } else {
            System.out.println("neither");
        }
      `,
    },
    {
      topic: "grids",
      title: "read a character grid",
      code: dedent`
        char[][] grid = new char[r][c];
        for (int i = 0; i < r; i++) {
            grid[i] = br.readLine().toCharArray();
        }
      `,
    },
    {
      topic: "strings",
      title: "palindrome check",
      code: dedent`
        static boolean isPalindrome(String s) {
            int lo = 0, hi = s.length() - 1;
            while (lo < hi) {
                if (s.charAt(lo) != s.charAt(hi)) return false;
                lo++;
                hi--;
            }
            return true;
        }
      `,
    },
    {
      topic: "counting",
      title: "frequency table",
      code: dedent`
        int[] freq = new int[26];
        for (char ch : s.toCharArray()) {
            freq[ch - 'a']++;
        }
      `,
    },
    {
      topic: "simulation",
      title: "walk a direction string",
      code: dedent`
        int x = 0, y = 0;
        for (char mv : path.toCharArray()) {
            if (mv == 'N') y++;
            else if (mv == 'S') y--;
            else if (mv == 'E') x++;
            else x--;
        }
        System.out.println(x + " " + y);
      `,
    },
    {
      topic: "brute force",
      title: "all pairs",
      code: dedent`
        long best = 0;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                best = Math.max(best, (long) a[i] * a[j]);
            }
        }
      `,
    },
    {
      topic: "math",
      title: "euclidean gcd",
      code: dedent`
        static long gcd(long a, long b) {
            return b == 0 ? a : gcd(b, a % b);
        }
      `,
    },
    {
      topic: "output",
      title: "buffered output",
      code: dedent`
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            sb.append(a[i]).append('\n');
        }
        System.out.print(sb);
      `,
    },
    {
      topic: "sorting",
      title: "sort and print",
      code: dedent`
        Arrays.sort(a);
        for (int i = 0; i < n; i++) {
            System.out.print(a[i] + (i == n - 1 ? "\n" : " "));
        }
      `,
    },
    {
      topic: "objects",
      title: "comparable record",
      code: dedent`
        static class Point implements Comparable<Point> {
            int x, y;
            Point(int x, int y) {
                this.x = x;
                this.y = y;
            }
            public int compareTo(Point o) {
                return x != o.x ? Integer.compare(x, o.x) : Integer.compare(y, o.y);
            }
        }
      `,
    },
    {
      topic: "io",
      title: "multiple test cases",
      code: dedent`
        int t = Integer.parseInt(br.readLine().trim());
        while (t-- > 0) {
            int n = Integer.parseInt(br.readLine().trim());
            solve(n);
        }
      `,
    },
  ],

  silver: [
    {
      topic: "sorting",
      title: "sort with a comparator",
      code: dedent`
        Arrays.sort(items, (x, y) -> {
            if (x.weight != y.weight) return Integer.compare(x.weight, y.weight);
            return Integer.compare(y.value, x.value);
        });
      `,
    },
    {
      topic: "binary search",
      title: "binarySearch on a sorted array",
      code: dedent`
        int idx = Arrays.binarySearch(a, target);
        if (idx >= 0) {
            System.out.println("found at " + idx);
        } else {
            System.out.println("insert at " + (-idx - 1));
        }
      `,
    },
    {
      topic: "two pointers",
      title: "pair summing to target",
      code: dedent`
        int lo = 0, hi = n - 1;
        while (lo < hi) {
            long sum = a[lo] + a[hi];
            if (sum == target) break;
            if (sum < target) lo++;
            else hi--;
        }
      `,
    },
    {
      topic: "prefix sums",
      title: "1D prefix sums",
      code: dedent`
        long[] pre = new long[n + 1];
        for (int i = 0; i < n; i++) {
            pre[i + 1] = pre[i] + a[i];
        }
        long rangeSum = pre[r + 1] - pre[l];
      `,
    },
    {
      topic: "prefix sums",
      title: "2D prefix sums",
      code: dedent`
        long[][] pre = new long[r + 1][c + 1];
        for (int i = 1; i <= r; i++) {
            for (int j = 1; j <= c; j++) {
                pre[i][j] = grid[i-1][j-1] + pre[i-1][j] + pre[i][j-1] - pre[i-1][j-1];
            }
        }
      `,
    },
    {
      topic: "bfs",
      title: "flood fill on a grid",
      code: dedent`
        Deque<int[]> q = new ArrayDeque<>();
        q.add(new int[]{sr, sc});
        seen[sr][sc] = true;
        while (!q.isEmpty()) {
            int[] cur = q.poll();
            for (int d = 0; d < 4; d++) {
                int nr = cur[0] + dr[d], nc = cur[1] + dc[d];
                if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;
                if (seen[nr][nc] || grid[nr][nc] == '#') continue;
                seen[nr][nc] = true;
                q.add(new int[]{nr, nc});
            }
        }
      `,
    },
    {
      topic: "graphs",
      title: "adjacency list",
      code: dedent`
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
        for (int i = 0; i < m; i++) {
            st = new StringTokenizer(br.readLine());
            int u = Integer.parseInt(st.nextToken());
            int v = Integer.parseInt(st.nextToken());
            adj.get(u).add(v);
            adj.get(v).add(u);
        }
      `,
    },
    {
      topic: "maps",
      title: "count occurrences",
      code: dedent`
        Map<String, Integer> freq = new HashMap<>();
        for (String w : words) {
            freq.merge(w, 1, Integer::sum);
        }
        for (Map.Entry<String, Integer> e : freq.entrySet()) {
            System.out.println(e.getKey() + " " + e.getValue());
        }
      `,
    },
    {
      topic: "greedy",
      title: "interval scheduling",
      code: dedent`
        Arrays.sort(iv, (x, y) -> Integer.compare(x[1], y[1]));
        int taken = 0, lastEnd = Integer.MIN_VALUE;
        for (int[] cur : iv) {
            if (cur[0] >= lastEnd) {
                taken++;
                lastEnd = cur[1];
            }
        }
      `,
    },
    {
      topic: "sliding window",
      title: "max window sum",
      code: dedent`
        long window = 0, best = 0;
        for (int i = 0; i < n; i++) {
            window += a[i];
            if (i >= k) window -= a[i - k];
            if (i >= k - 1) best = Math.max(best, window);
        }
      `,
    },
    {
      topic: "binary search",
      title: "binary search on the answer",
      code: dedent`
        long lo = 1, hi = (long) 1e18;
        while (lo < hi) {
            long mid = lo + (hi - lo) / 2;
            if (feasible(mid)) hi = mid;
            else lo = mid + 1;
        }
        System.out.println(lo);
      `,
    },
    {
      topic: "sets",
      title: "treeset floor and ceiling",
      code: dedent`
        TreeSet<Integer> set = new TreeSet<>();
        for (int x : a) set.add(x);
        Integer below = set.floor(target);
        Integer above = set.ceiling(target);
      `,
    },
    {
      topic: "difference array",
      title: "range increment",
      code: dedent`
        long[] diff = new long[n + 1];
        for (int[] u : updates) {
            diff[u[0]] += u[2];
            diff[u[1] + 1] -= u[2];
        }
        for (int i = 1; i < n; i++) diff[i] += diff[i - 1];
      `,
    },
    {
      topic: "intervals",
      title: "merge overlapping intervals",
      code: dedent`
        Arrays.sort(iv, (x, y) -> Integer.compare(x[0], y[0]));
        List<int[]> merged = new ArrayList<>();
        for (int[] cur : iv) {
            if (!merged.isEmpty() && cur[0] <= merged.get(merged.size() - 1)[1]) {
                merged.get(merged.size() - 1)[1] = Math.max(merged.get(merged.size() - 1)[1], cur[1]);
            } else {
                merged.add(cur);
            }
        }
      `,
    },
  ],

  gold: [
    {
      topic: "shortest paths",
      title: "dijkstra",
      code: dedent`
        PriorityQueue<long[]> pq = new PriorityQueue<>((x, y) -> Long.compare(x[0], y[0]));
        long[] dist = new long[n];
        Arrays.fill(dist, Long.MAX_VALUE);
        dist[src] = 0;
        pq.offer(new long[]{0, src});
        while (!pq.isEmpty()) {
            long[] cur = pq.poll();
            int u = (int) cur[1];
            if (cur[0] > dist[u]) continue;
            for (int[] e : adj.get(u)) {
                if (cur[0] + e[1] < dist[e[0]]) {
                    dist[e[0]] = cur[0] + e[1];
                    pq.offer(new long[]{dist[e[0]], e[0]});
                }
            }
        }
      `,
    },
    {
      topic: "dsu",
      title: "union-find with path compression",
      code: dedent`
        static class DSU {
            int[] par, sz;
            DSU(int n) {
                par = new int[n];
                sz = new int[n];
                for (int i = 0; i < n; i++) {
                    par[i] = i;
                    sz[i] = 1;
                }
            }
            int find(int x) {
                return par[x] == x ? x : (par[x] = find(par[x]));
            }
            boolean unite(int a, int b) {
                a = find(a);
                b = find(b);
                if (a == b) return false;
                if (sz[a] < sz[b]) { int t = a; a = b; b = t; }
                par[b] = a;
                sz[a] += sz[b];
                return true;
            }
        }
      `,
    },
    {
      topic: "mst",
      title: "kruskal",
      code: dedent`
        Arrays.sort(edges, (x, y) -> Integer.compare(x[0], y[0]));
        DSU dsu = new DSU(n);
        long total = 0;
        for (int[] e : edges) {
            if (dsu.unite(e[1], e[2])) total += e[0];
        }
      `,
    },
    {
      topic: "topological sort",
      title: "kahn's algorithm",
      code: dedent`
        Deque<Integer> q = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            if (indeg[i] == 0) q.add(i);
        }
        List<Integer> order = new ArrayList<>();
        while (!q.isEmpty()) {
            int u = q.poll();
            order.add(u);
            for (int v : adj.get(u)) {
                if (--indeg[v] == 0) q.add(v);
            }
        }
      `,
    },
    {
      topic: "dp",
      title: "0/1 knapsack",
      code: dedent`
        long[] dp = new long[cap + 1];
        for (int i = 0; i < n; i++) {
            for (int w = cap; w >= wt[i]; w--) {
                dp[w] = Math.max(dp[w], dp[w - wt[i]] + val[i]);
            }
        }
        System.out.println(dp[cap]);
      `,
    },
    {
      topic: "dp",
      title: "longest increasing subsequence",
      code: dedent`
        List<Integer> tails = new ArrayList<>();
        for (int x : a) {
            int idx = Collections.binarySearch(tails, x);
            if (idx < 0) idx = -idx - 1;
            if (idx == tails.size()) tails.add(x);
            else tails.set(idx, x);
        }
      `,
    },
    {
      topic: "dp",
      title: "coin change",
      code: dedent`
        int[] dp = new int[target + 1];
        Arrays.fill(dp, Integer.MAX_VALUE);
        dp[0] = 0;
        for (int c : coins) {
            for (int v = c; v <= target; v++) {
                if (dp[v - c] != Integer.MAX_VALUE) dp[v] = Math.min(dp[v], dp[v - c] + 1);
            }
        }
      `,
    },
    {
      topic: "modular math",
      title: "modpow",
      code: dedent`
        static long power(long b, long e, long mod) {
            long res = 1;
            b %= mod;
            while (e > 0) {
                if ((e & 1) == 1) res = res * b % mod;
                b = b * b % mod;
                e >>= 1;
            }
            return res;
        }
      `,
    },
    {
      topic: "fenwick",
      title: "binary indexed tree",
      code: dedent`
        static class BIT {
            long[] t;
            BIT(int n) { t = new long[n + 1]; }
            void add(int i, long v) {
                for (; i < t.length; i += i & -i) t[i] += v;
            }
            long query(int i) {
                long s = 0;
                for (; i > 0; i -= i & -i) s += t[i];
                return s;
            }
        }
      `,
    },
    {
      topic: "graphs",
      title: "bipartite check",
      code: dedent`
        int[] color = new int[n];
        Arrays.fill(color, -1);
        Deque<Integer> q = new ArrayDeque<>();
        q.add(0);
        color[0] = 0;
        while (!q.isEmpty()) {
            int u = q.poll();
            for (int v : adj.get(u)) {
                if (color[v] == -1) {
                    color[v] = color[u] ^ 1;
                    q.add(v);
                } else if (color[v] == color[u]) {
                    return false;
                }
            }
        }
      `,
    },
    {
      topic: "shortest paths",
      title: "floyd-warshall",
      code: dedent`
        for (int k = 0; k < n; k++) {
            for (int i = 0; i < n; i++) {
                for (int j = 0; j < n; j++) {
                    if (dist[i][k] + dist[k][j] < dist[i][j]) {
                        dist[i][j] = dist[i][k] + dist[k][j];
                    }
                }
            }
        }
      `,
    },
    {
      topic: "bitmask dp",
      title: "subset enumeration",
      code: dedent`
        for (int mask = 0; mask < (1 << n); mask++) {
            for (int sub = mask; sub > 0; sub = (sub - 1) & mask) {
                dp[mask] = Math.min(dp[mask], dp[mask ^ sub] + cost[sub]);
            }
        }
      `,
    },
    {
      topic: "trees",
      title: "iterative subtree sizes",
      code: dedent`
        Deque<Integer> stack = new ArrayDeque<>();
        stack.push(root);
        while (!stack.isEmpty()) {
            int u = stack.pop();
            order.add(u);
            for (int v : adj.get(u)) {
                if (v != par[u]) {
                    par[v] = u;
                    stack.push(v);
                }
            }
        }
      `,
    },
    {
      topic: "dp",
      title: "grid paths with obstacles",
      code: dedent`
        dp[0][0] = grid[0][0] == '.' ? 1 : 0;
        for (int i = 0; i < R; i++) {
            for (int j = 0; j < C; j++) {
                if (grid[i][j] == '#') continue;
                if (i > 0) dp[i][j] = (dp[i][j] + dp[i-1][j]) % MOD;
                if (j > 0) dp[i][j] = (dp[i][j] + dp[i][j-1]) % MOD;
            }
        }
      `,
    },
  ],

  platinum: [
    {
      topic: "generics",
      title: "nested generic declarations",
      code: dedent`
        Map<String, List<Map.Entry<Integer, long[]>>> index = new HashMap<>();
        index.computeIfAbsent(key, k -> new ArrayList<>())
             .add(Map.entry(id, new long[]{lo, hi}));
      `,
    },
    {
      topic: "streams",
      title: "stream pipeline",
      code: dedent`
        long best = IntStream.range(0, n)
                .filter(i -> (mask >> i & 1) == 1)
                .mapToLong(i -> val[i])
                .max()
                .orElse(0L);
      `,
    },
    {
      topic: "bitsets",
      title: "bit manipulation",
      code: dedent`
        int lowest = mask & -mask;
        int without = mask & ~(1 << bit);
        for (int sub = mask; sub > 0; sub = (sub - 1) & mask) {
            best = Math.min(best, dp[mask ^ sub] + cost[sub]);
        }
        System.out.println(Integer.bitCount(mask) + " " + Integer.numberOfTrailingZeros(mask));
      `,
    },
    {
      topic: "comparators",
      title: "chained comparators",
      code: dedent`
        items.sort(Comparator
                .comparingInt((Item x) -> x.weight)
                .thenComparing(x -> -x.value)
                .thenComparing(x -> x.name));
      `,
    },
    {
      topic: "segment tree",
      title: "iterative segment tree",
      code: dedent`
        void update(int i, long v) {
            for (tree[i += size] = v; i > 1; i >>= 1) {
                tree[i >> 1] = tree[i] + tree[i ^ 1];
            }
        }

        long query(int l, int r) {
            long res = 0;
            for (l += size, r += size + 1; l < r; l >>= 1, r >>= 1) {
                if ((l & 1) != 0) res += tree[l++];
                if ((r & 1) != 0) res += tree[--r];
            }
            return res;
        }
      `,
    },
    {
      topic: "segment tree",
      title: "lazy propagation range add",
      code: dedent`
        void push(int node, int lo, int hi) {
            if (lazy[node] == 0) return;
            tree[node] += lazy[node] * (hi - lo + 1);
            if (lo != hi) {
                lazy[2*node] += lazy[node];
                lazy[2*node+1] += lazy[node];
            }
            lazy[node] = 0;
        }
      `,
    },
    {
      topic: "scc",
      title: "tarjan strongly connected components",
      code: dedent`
        void dfs(int u) {
            low[u] = disc[u] = ++timer;
            stack.push(u);
            onStack[u] = true;
            for (int v : adj.get(u)) {
                if (disc[v] == 0) {
                    dfs(v);
                    low[u] = Math.min(low[u], low[v]);
                } else if (onStack[v]) {
                    low[u] = Math.min(low[u], disc[v]);
                }
            }
        }
      `,
    },
    {
      topic: "geometry",
      title: "cross product orientation",
      code: dedent`
        static long cross(long[] o, long[] a, long[] b) {
            return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
        }
      `,
    },
    {
      topic: "matrix",
      title: "matrix multiplication mod p",
      code: dedent`
        static long[][] mul(long[][] a, long[][] b) {
            int n = a.length, m = b[0].length, k = b.length;
            long[][] c = new long[n][m];
            for (int i = 0; i < n; i++) {
                for (int x = 0; x < k; x++) {
                    if (a[i][x] == 0) continue;
                    for (int j = 0; j < m; j++) {
                        c[i][j] = (c[i][j] + a[i][x] * b[x][j]) % MOD;
                    }
                }
            }
            return c;
        }
      `,
    },
    {
      topic: "lca",
      title: "binary lifting",
      code: dedent`
        static int lca(int u, int v) {
            if (depth[u] < depth[v]) { int t = u; u = v; v = t; }
            int diff = depth[u] - depth[v];
            for (int k = 0; k < LOG; k++) {
                if ((diff >> k & 1) == 1) u = up[k][u];
            }
            if (u == v) return u;
            for (int k = LOG - 1; k >= 0; k--) {
                if (up[k][u] != up[k][v]) {
                    u = up[k][u];
                    v = up[k][v];
                }
            }
            return up[0][u];
        }
      `,
    },
    {
      topic: "strings",
      title: "kmp prefix function",
      code: dedent`
        static int[] prefixFunction(String s) {
            int n = s.length();
            int[] pi = new int[n];
            for (int i = 1; i < n; i++) {
                int j = pi[i - 1];
                while (j > 0 && s.charAt(i) != s.charAt(j)) j = pi[j - 1];
                if (s.charAt(i) == s.charAt(j)) j++;
                pi[i] = j;
            }
            return pi;
        }
      `,
    },
    {
      topic: "strings",
      title: "polynomial hashing",
      code: dedent`
        long[] h = new long[n + 1];
        long[] pw = new long[n + 1];
        pw[0] = 1;
        for (int i = 0; i < n; i++) {
            h[i + 1] = (h[i] * BASE + s.charAt(i)) % MOD;
            pw[i + 1] = pw[i] * BASE % MOD;
        }
      `,
    },
    {
      topic: "flows",
      title: "dinic level graph",
      code: dedent`
        boolean bfs() {
            Arrays.fill(level, -1);
            Deque<Integer> q = new ArrayDeque<>();
            q.add(src);
            level[src] = 0;
            while (!q.isEmpty()) {
                int u = q.poll();
                for (int id : adj.get(u)) {
                    if (cap[id] - flow[id] < 1) continue;
                    if (level[to[id]] != -1) continue;
                    level[to[id]] = level[u] + 1;
                    q.add(to[id]);
                }
            }
            return level[sink] != -1;
        }
      `,
    },
    {
      topic: "sqrt decomposition",
      title: "mo's algorithm ordering",
      code: dedent`
        Arrays.sort(queries, (x, y) -> {
            int bx = x[0] / BLOCK, by = y[0] / BLOCK;
            if (bx != by) return Integer.compare(bx, by);
            return (bx & 1) == 1 ? Integer.compare(y[1], x[1]) : Integer.compare(x[1], y[1]);
        });
      `,
    },
    {
      topic: "sparse table",
      title: "range minimum query",
      code: dedent`
        for (int k = 1; k < LOG; k++) {
            for (int i = 0; i + (1 << k) <= n; i++) {
                sparse[k][i] = Math.min(sparse[k-1][i], sparse[k-1][i + (1 << (k-1))]);
            }
        }
      `,
    },
    {
      topic: "trees",
      title: "heavy child selection",
      code: dedent`
        void computeHeavy(int u) {
            heavy[u] = -1;
            int maxSize = 0;
            for (int v : adj.get(u)) {
                if (v == par[u]) continue;
                if (sz[v] > maxSize) {
                    maxSize = sz[v];
                    heavy[u] = v;
                }
            }
        }
      `,
    },
    {
      topic: "dp optimization",
      title: "convex hull trick line insert",
      code: dedent`
        void addLine(long m, long b) {
            while (size >= 2 && bad(size - 2, size - 1, m, b)) size--;
            slope[size] = m;
            intercept[size] = b;
            size++;
        }
      `,
    },
    {
      topic: "combinatorics",
      title: "factorials and inverses",
      code: dedent`
        fact[0] = 1;
        for (int i = 1; i <= MAXN; i++) fact[i] = fact[i-1] * i % MOD;
        inv[MAXN] = power(fact[MAXN], MOD - 2, MOD);
        for (int i = MAXN; i > 0; i--) inv[i-1] = inv[i] * i % MOD;
      `,
    },
  ],
};
