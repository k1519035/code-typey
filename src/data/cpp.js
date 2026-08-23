import { dedent } from "./dedent.js";

/**
 * Original C++ implementations of the patterns that show up constantly in
 * USACO / Codeforces / ICPC rounds. These are written from scratch for typing
 * practice — they are idiomatic contest code, not copies of anyone's
 * submissions.
 */
export const CPP = {
  bronze: [
    {
      topic: "fast io",
      title: "contest main skeleton",
      code: dedent`
        #include <bits/stdc++.h>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n;
            cin >> n;
            cout << n * 2 << "\n";
        }
      `,
    },
    {
      topic: "arrays",
      title: "read n values",
      code: dedent`
        int n;
        cin >> n;
        vector<int> a(n);
        for (int i = 0; i < n; i++) {
            cin >> a[i];
        }
      `,
    },
    {
      topic: "arrays",
      title: "sum and maximum",
      code: dedent`
        long long total = 0;
        int best = INT_MIN;
        for (int i = 0; i < n; i++) {
            total += a[i];
            best = max(best, a[i]);
        }
        cout << total << " " << best << "\n";
      `,
    },
    {
      topic: "branching",
      title: "three-way compare",
      code: dedent`
        if (a > b && b > c) {
            cout << "decreasing\n";
        } else if (a < b && b < c) {
            cout << "increasing\n";
        } else {
            cout << "neither\n";
        }
      `,
    },
    {
      topic: "grids",
      title: "read a character grid",
      code: dedent`
        int r, c;
        cin >> r >> c;
        vector<string> grid(r);
        for (int i = 0; i < r; i++) {
            cin >> grid[i];
        }
      `,
    },
    {
      topic: "strings",
      title: "palindrome check",
      code: dedent`
        bool isPalindrome(const string &s) {
            int lo = 0, hi = (int)s.size() - 1;
            while (lo < hi) {
                if (s[lo] != s[hi]) return false;
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
        int freq[26] = {};
        for (char ch : s) {
            freq[ch - 'a']++;
        }
        for (int i = 0; i < 26; i++) {
            if (freq[i] > 0) cout << char('a' + i) << ":" << freq[i] << "\n";
        }
      `,
    },
    {
      topic: "simulation",
      title: "walk a direction string",
      code: dedent`
        int x = 0, y = 0;
        for (char mv : path) {
            if (mv == 'N') y++;
            else if (mv == 'S') y--;
            else if (mv == 'E') x++;
            else x--;
        }
        cout << x << " " << y << "\n";
      `,
    },
    {
      topic: "brute force",
      title: "all pairs",
      code: dedent`
        int best = 0;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                best = max(best, a[i] * a[j]);
            }
        }
      `,
    },
    {
      topic: "math",
      title: "euclidean gcd",
      code: dedent`
        long long gcd(long long a, long long b) {
            while (b != 0) {
                long long t = a % b;
                a = b;
                b = t;
            }
            return a;
        }
      `,
    },
    {
      topic: "math",
      title: "digit sum",
      code: dedent`
        int digitSum(long long n) {
            int total = 0;
            while (n > 0) {
                total += (int)(n % 10);
                n /= 10;
            }
            return total;
        }
      `,
    },
    {
      topic: "sorting",
      title: "sort and print",
      code: dedent`
        sort(a.begin(), a.end());
        for (int i = 0; i < n; i++) {
            cout << a[i] << " \n"[i == n - 1];
        }
      `,
    },
    {
      topic: "pairs",
      title: "read pairs",
      code: dedent`
        vector<pair<int, int>> pts(n);
        for (int i = 0; i < n; i++) {
            cin >> pts[i].first >> pts[i].second;
        }
        sort(pts.begin(), pts.end());
      `,
    },
    {
      topic: "io",
      title: "multiple test cases",
      code: dedent`
        int t;
        cin >> t;
        while (t--) {
            int n;
            cin >> n;
            solve(n);
        }
      `,
    },
  ],

  silver: [
    {
      topic: "sorting",
      title: "sort by custom comparator",
      code: dedent`
        sort(items.begin(), items.end(), [](const Item &x, const Item &y) {
            if (x.weight != y.weight) return x.weight < y.weight;
            return x.value > y.value;
        });
      `,
    },
    {
      topic: "binary search",
      title: "lower_bound on a sorted vector",
      code: dedent`
        auto it = lower_bound(a.begin(), a.end(), target);
        if (it != a.end() && *it == target) {
            cout << "found at " << (it - a.begin()) << "\n";
        } else {
            cout << "absent\n";
        }
      `,
    },
    {
      topic: "two pointers",
      title: "pair summing to target",
      code: dedent`
        int lo = 0, hi = n - 1;
        while (lo < hi) {
            long long sum = a[lo] + a[hi];
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
        vector<long long> pre(n + 1, 0);
        for (int i = 0; i < n; i++) {
            pre[i + 1] = pre[i] + a[i];
        }
        long long rangeSum = pre[r + 1] - pre[l];
      `,
    },
    {
      topic: "prefix sums",
      title: "2D prefix sums",
      code: dedent`
        vector<vector<long long>> pre(r + 1, vector<long long>(c + 1, 0));
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
        queue<pair<int, int>> q;
        q.push({sr, sc});
        seen[sr][sc] = true;
        while (!q.empty()) {
            auto [r, c] = q.front();
            q.pop();
            for (int d = 0; d < 4; d++) {
                int nr = r + dr[d], nc = c + dc[d];
                if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;
                if (seen[nr][nc] || grid[nr][nc] == '#') continue;
                seen[nr][nc] = true;
                q.push({nr, nc});
            }
        }
      `,
    },
    {
      topic: "dfs",
      title: "recursive dfs",
      code: dedent`
        void dfs(int u) {
            visited[u] = true;
            for (int v : adj[u]) {
                if (!visited[v]) dfs(v);
            }
        }
      `,
    },
    {
      topic: "maps",
      title: "count occurrences",
      code: dedent`
        map<string, int> freq;
        for (const string &w : words) {
            freq[w]++;
        }
        for (auto &[word, count] : freq) {
            cout << word << " " << count << "\n";
        }
      `,
    },
    {
      topic: "greedy",
      title: "interval scheduling",
      code: dedent`
        sort(iv.begin(), iv.end(), [](auto &x, auto &y) { return x.second < y.second; });
        int taken = 0, lastEnd = INT_MIN;
        for (auto &[start, end] : iv) {
            if (start >= lastEnd) {
                taken++;
                lastEnd = end;
            }
        }
      `,
    },
    {
      topic: "sliding window",
      title: "max window sum",
      code: dedent`
        long long window = 0, best = 0;
        for (int i = 0; i < n; i++) {
            window += a[i];
            if (i >= k) window -= a[i - k];
            if (i >= k - 1) best = max(best, window);
        }
      `,
    },
    {
      topic: "binary search",
      title: "binary search on the answer",
      code: dedent`
        long long lo = 1, hi = 1e18;
        while (lo < hi) {
            long long mid = lo + (hi - lo) / 2;
            if (feasible(mid)) hi = mid;
            else lo = mid + 1;
        }
        cout << lo << "\n";
      `,
    },
    {
      topic: "compression",
      title: "coordinate compression",
      code: dedent`
        vector<int> vals = a;
        sort(vals.begin(), vals.end());
        vals.erase(unique(vals.begin(), vals.end()), vals.end());
        for (int i = 0; i < n; i++) {
            a[i] = lower_bound(vals.begin(), vals.end(), a[i]) - vals.begin();
        }
      `,
    },
    {
      topic: "difference array",
      title: "range increment",
      code: dedent`
        vector<long long> diff(n + 1, 0);
        for (auto &[l, r, v] : updates) {
            diff[l] += v;
            diff[r + 1] -= v;
        }
        for (int i = 1; i < n; i++) diff[i] += diff[i - 1];
      `,
    },
    {
      topic: "intervals",
      title: "merge overlapping intervals",
      code: dedent`
        sort(iv.begin(), iv.end());
        vector<pair<int, int>> merged;
        for (auto &cur : iv) {
            if (!merged.empty() && cur.first <= merged.back().second) {
                merged.back().second = max(merged.back().second, cur.second);
            } else {
                merged.push_back(cur);
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
        priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;
        vector<long long> dist(n, LLONG_MAX);
        dist[src] = 0;
        pq.push({0, src});
        while (!pq.empty()) {
            auto [d, u] = pq.top();
            pq.pop();
            if (d > dist[u]) continue;
            for (auto &[v, w] : adj[u]) {
                if (d + w < dist[v]) {
                    dist[v] = d + w;
                    pq.push({dist[v], v});
                }
            }
        }
      `,
    },
    {
      topic: "dsu",
      title: "union-find with path compression",
      code: dedent`
        struct DSU {
            vector<int> par, sz;
            DSU(int n) : par(n), sz(n, 1) {
                iota(par.begin(), par.end(), 0);
            }
            int find(int x) {
                return par[x] == x ? x : par[x] = find(par[x]);
            }
            bool unite(int a, int b) {
                a = find(a), b = find(b);
                if (a == b) return false;
                if (sz[a] < sz[b]) swap(a, b);
                par[b] = a;
                sz[a] += sz[b];
                return true;
            }
        };
      `,
    },
    {
      topic: "mst",
      title: "kruskal",
      code: dedent`
        sort(edges.begin(), edges.end());
        DSU dsu(n);
        long long total = 0;
        for (auto &[w, u, v] : edges) {
            if (dsu.unite(u, v)) total += w;
        }
      `,
    },
    {
      topic: "topological sort",
      title: "kahn's algorithm",
      code: dedent`
        queue<int> q;
        for (int i = 0; i < n; i++) {
            if (indeg[i] == 0) q.push(i);
        }
        vector<int> order;
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            order.push_back(u);
            for (int v : adj[u]) {
                if (--indeg[v] == 0) q.push(v);
            }
        }
      `,
    },
    {
      topic: "dp",
      title: "0/1 knapsack",
      code: dedent`
        vector<long long> dp(cap + 1, 0);
        for (int i = 0; i < n; i++) {
            for (int w = cap; w >= wt[i]; w--) {
                dp[w] = max(dp[w], dp[w - wt[i]] + val[i]);
            }
        }
        cout << dp[cap] << "\n";
      `,
    },
    {
      topic: "dp",
      title: "longest increasing subsequence",
      code: dedent`
        vector<int> tails;
        for (int x : a) {
            auto it = lower_bound(tails.begin(), tails.end(), x);
            if (it == tails.end()) tails.push_back(x);
            else *it = x;
        }
        cout << tails.size() << "\n";
      `,
    },
    {
      topic: "dp",
      title: "coin change",
      code: dedent`
        vector<int> dp(target + 1, INT_MAX);
        dp[0] = 0;
        for (int c : coins) {
            for (int v = c; v <= target; v++) {
                if (dp[v - c] != INT_MAX) dp[v] = min(dp[v], dp[v - c] + 1);
            }
        }
      `,
    },
    {
      topic: "modular math",
      title: "modpow and nCr",
      code: dedent`
        long long power(long long b, long long e, long long mod) {
            long long res = 1;
            b %= mod;
            while (e > 0) {
                if (e & 1) res = res * b % mod;
                b = b * b % mod;
                e >>= 1;
            }
            return res;
        }

        long long nCr(int n, int r) {
            return fact[n] * power(fact[r] * fact[n-r] % MOD, MOD - 2, MOD) % MOD;
        }
      `,
    },
    {
      topic: "fenwick",
      title: "binary indexed tree",
      code: dedent`
        struct BIT {
            vector<long long> t;
            BIT(int n) : t(n + 1, 0) {}
            void add(int i, long long v) {
                for (; i < (int)t.size(); i += i & -i) t[i] += v;
            }
            long long query(int i) {
                long long s = 0;
                for (; i > 0; i -= i & -i) s += t[i];
                return s;
            }
        };
      `,
    },
    {
      topic: "graphs",
      title: "bipartite check",
      code: dedent`
        vector<int> color(n, -1);
        queue<int> q;
        q.push(0);
        color[0] = 0;
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int v : adj[u]) {
                if (color[v] == -1) {
                    color[v] = color[u] ^ 1;
                    q.push(v);
                } else if (color[v] == color[u]) {
                    cout << "not bipartite\n";
                    return;
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
      title: "travelling salesman",
      code: dedent`
        vector<vector<int>> dp(1 << n, vector<int>(n, INF));
        dp[1][0] = 0;
        for (int mask = 1; mask < (1 << n); mask++) {
            for (int u = 0; u < n; u++) {
                if (!(mask >> u & 1) || dp[mask][u] == INF) continue;
                for (int v = 0; v < n; v++) {
                    if (mask >> v & 1) continue;
                    dp[mask | 1 << v][v] = min(dp[mask | 1 << v][v], dp[mask][u] + cost[u][v]);
                }
            }
        }
      `,
    },
    {
      topic: "trees",
      title: "subtree sizes",
      code: dedent`
        void dfs(int u, int p) {
            sz[u] = 1;
            for (int v : adj[u]) {
                if (v == p) continue;
                dfs(v, u);
                sz[u] += sz[v];
            }
        }
      `,
    },
    {
      topic: "dp",
      title: "grid paths with obstacles",
      code: dedent`
        dp[0][0] = (grid[0][0] == '.');
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
      topic: "templates",
      title: "variadic debug macro",
      code: dedent`
        template <typename... Args>
        void dbg(Args &&...args) {
            ((cerr << args << ' '), ...);
            cerr << '\n';
        }

        #define all(x) (x).begin(), (x).end()
        #define rep(i, a, b) for (int i = (a); i < (b); ++i)
      `,
    },
    {
      topic: "templates",
      title: "generic segment tree node",
      code: dedent`
        template <typename T, typename F = function<T(const T &, const T &)>>
        struct SegTree {
            int n;
            vector<T> t;
            F op;
            T id;
            SegTree(int n_, F op_, T id_) : n(n_), t(2 * n_, id_), op(op_), id(id_) {}
        };
      `,
    },
    {
      topic: "bitsets",
      title: "bit tricks",
      code: dedent`
        int lowest = mask & -mask;
        int without = mask & ~(1 << bit);
        for (int sub = mask; sub; sub = (sub - 1) & mask) {
            best = min(best, dp[mask ^ sub] + cost[sub]);
        }
        cout << __builtin_popcount(mask) << " " << __builtin_ctz(mask) << "\n";
      `,
    },
    {
      topic: "lambdas",
      title: "recursive lambda",
      code: dedent`
        auto dfs = [&](auto &&self, int u, int p) -> void {
            for (int v : adj[u]) {
                if (v == p) continue;
                self(self, v, u);
                sz[u] += sz[v];
            }
        };
        dfs(dfs, 0, -1);
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

        void update(int node, int lo, int hi, int l, int r, long long v) {
            push(node, lo, hi);
            if (r < lo || hi < l) return;
            if (l <= lo && hi <= r) {
                lazy[node] += v;
                push(node, lo, hi);
                return;
            }
            int mid = (lo + hi) / 2;
            update(2*node, lo, mid, l, r, v);
            update(2*node+1, mid+1, hi, l, r, v);
            tree[node] = tree[2*node] + tree[2*node+1];
        }
      `,
    },
    {
      topic: "scc",
      title: "tarjan strongly connected components",
      code: dedent`
        void dfs(int u) {
            low[u] = disc[u] = ++timer;
            stk.push_back(u);
            onStack[u] = true;
            for (int v : adj[u]) {
                if (!disc[v]) {
                    dfs(v);
                    low[u] = min(low[u], low[v]);
                } else if (onStack[v]) {
                    low[u] = min(low[u], disc[v]);
                }
            }
            if (low[u] == disc[u]) {
                while (true) {
                    int v = stk.back();
                    stk.pop_back();
                    onStack[v] = false;
                    comp[v] = u;
                    if (v == u) break;
                }
            }
        }
      `,
    },
    {
      topic: "geometry",
      title: "monotone chain convex hull",
      code: dedent`
        long long cross(const P &o, const P &a, const P &b) {
            return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
        }

        vector<P> hull(vector<P> pts) {
            sort(pts.begin(), pts.end());
            vector<P> h;
            for (int pass = 0; pass < 2; pass++) {
                size_t start = h.size();
                for (const P &p : pts) {
                    while (h.size() >= start + 2 && cross(h[h.size()-2], h.back(), p) <= 0) {
                        h.pop_back();
                    }
                    h.push_back(p);
                }
                h.pop_back();
                reverse(pts.begin(), pts.end());
            }
            return h;
        }
      `,
    },
    {
      topic: "matrix",
      title: "matrix exponentiation",
      code: dedent`
        Mat mul(const Mat &a, const Mat &b) {
            Mat c(a.size(), vector<long long>(b[0].size(), 0));
            for (size_t i = 0; i < a.size(); i++) {
                for (size_t k = 0; k < b.size(); k++) {
                    if (!a[i][k]) continue;
                    for (size_t j = 0; j < b[0].size(); j++) {
                        c[i][j] = (c[i][j] + a[i][k] * b[k][j]) % MOD;
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
        int lca(int u, int v) {
            if (depth[u] < depth[v]) swap(u, v);
            int diff = depth[u] - depth[v];
            for (int k = 0; k < LOG; k++) {
                if (diff >> k & 1) u = up[k][u];
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
      topic: "hld",
      title: "heavy-light decomposition",
      code: dedent`
        void decompose(int u, int h) {
            head[u] = h;
            pos[u] = curPos++;
            if (heavy[u] != -1) decompose(heavy[u], h);
            for (int v : adj[u]) {
                if (v != par[u] && v != heavy[u]) decompose(v, v);
            }
        }
      `,
    },
    {
      topic: "convex hull trick",
      title: "li chao tree insert",
      code: dedent`
        void insert(int node, int lo, int hi, Line line) {
            int mid = (lo + hi) / 2;
            bool leftBetter = line(lo) < seg[node](lo);
            if (line(mid) < seg[node](mid)) {
                swap(seg[node], line);
            }
            if (lo == hi) return;
            if (leftBetter != (line(mid) < seg[node](mid))) {
                insert(2*node, lo, mid, line);
            } else {
                insert(2*node+1, mid+1, hi, line);
            }
        }
      `,
    },
    {
      topic: "trees",
      title: "centroid of a tree",
      code: dedent`
        int findCentroid(int u, int p, int total) {
            for (int v : adj[u]) {
                if (v == p || removed[v]) continue;
                if (sz[v] * 2 > total) return findCentroid(v, u, total);
            }
            return u;
        }
      `,
    },
    {
      topic: "strings",
      title: "z-function",
      code: dedent`
        vector<int> zFunction(const string &s) {
            int n = s.size();
            vector<int> z(n, 0);
            for (int i = 1, l = 0, r = 0; i < n; i++) {
                if (i < r) z[i] = min(r - i, z[i - l]);
                while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
                if (i + z[i] > r) {
                    l = i;
                    r = i + z[i];
                }
            }
            return z;
        }
      `,
    },
    {
      topic: "strings",
      title: "kmp prefix function",
      code: dedent`
        vector<int> prefixFunction(const string &s) {
            int n = s.size();
            vector<int> pi(n, 0);
            for (int i = 1; i < n; i++) {
                int j = pi[i - 1];
                while (j > 0 && s[i] != s[j]) j = pi[j - 1];
                if (s[i] == s[j]) j++;
                pi[i] = j;
            }
            return pi;
        }
      `,
    },
    {
      topic: "flows",
      title: "dinic level graph",
      code: dedent`
        bool bfs() {
            fill(level.begin(), level.end(), -1);
            queue<int> q;
            q.push(src);
            level[src] = 0;
            while (!q.empty()) {
                int u = q.front();
                q.pop();
                for (int id : adj[u]) {
                    if (edges[id].cap - edges[id].flow < 1) continue;
                    if (level[edges[id].to] != -1) continue;
                    level[edges[id].to] = level[u] + 1;
                    q.push(edges[id].to);
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
        sort(queries.begin(), queries.end(), [&](const Q &a, const Q &b) {
            int ba = a.l / BLOCK, bb = b.l / BLOCK;
            if (ba != bb) return ba < bb;
            return (ba & 1) ? a.r > b.r : a.r < b.r;
        });
      `,
    },
    {
      topic: "sparse table",
      title: "range minimum query",
      code: dedent`
        for (int k = 1; k < LOG; k++) {
            for (int i = 0; i + (1 << k) <= n; i++) {
                sparse[k][i] = min(sparse[k-1][i], sparse[k-1][i + (1 << (k-1))]);
            }
        }

        int query(int l, int r) {
            int k = log2Table[r - l + 1];
            return min(sparse[k][l], sparse[k][r - (1 << k) + 1]);
        }
      `,
    },
    {
      topic: "dp optimization",
      title: "divide and conquer dp",
      code: dedent`
        void compute(int layer, int lo, int hi, int optLo, int optHi) {
            if (lo > hi) return;
            int mid = (lo + hi) / 2;
            pair<long long, int> best = {LLONG_MAX, -1};
            for (int k = optLo; k <= min(mid, optHi); k++) {
                best = min(best, {dp[layer-1][k-1] + cost(k, mid), k});
            }
            dp[layer][mid] = best.first;
            compute(layer, lo, mid - 1, optLo, best.second);
            compute(layer, mid + 1, hi, best.second, optHi);
        }
      `,
    },
  ],
};
