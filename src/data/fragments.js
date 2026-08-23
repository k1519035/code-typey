import { dedent } from "./dedent.js";

/**
 * Single-line building blocks for generated drills.
 *
 * A full snippet makes you type 250 characters to hit your worst key six times.
 * These are chosen for symbol density instead: the drill generator picks the
 * ones that cover your weak characters and stacks them, so the same effort
 * lands ten times as many repetitions of what you're actually bad at.
 */
export const FRAGMENTS = {
  cpp: [
    dedent`vector<vector<int>> adj(n + 1);`,
    dedent`for (auto &[k, v] : freq) cout << k << ':' << v << '\n';`,
    dedent`priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;`,
    dedent`dp[i][j] = max(dp[i - 1][j], dp[i][j - 1] + cost[i][j]);`,
    dedent`sort(all(v), [](auto &a, auto &b) { return a.second < b.second; });`,
    dedent`cin >> n >> m; cout << (n * m) % MOD << "\n";`,
    dedent`if (!(mask >> i & 1)) continue;`,
    dedent`auto it = lower_bound(v.begin(), v.end(), x) - v.begin();`,
    dedent`t[node] = t[2 * node] + t[2 * node + 1];`,
    dedent`long long res = 1LL * a[i] * b[j] % MOD;`,
    dedent`struct Edge { int to, w; bool operator<(const Edge &o) const { return w < o.w; } };`,
    dedent`memset(dist, 0x3f, sizeof(dist));`,
  ],
  java: [
    dedent`Map<String, List<Integer>> index = new HashMap<>();`,
    dedent`index.computeIfAbsent(key, k -> new ArrayList<>()).add(id);`,
    dedent`PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);`,
    dedent`dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1] + cost[i][j]);`,
    dedent`st = new StringTokenizer(br.readLine());`,
    dedent`for (Map.Entry<String, Integer> e : freq.entrySet()) sb.append(e.getKey());`,
    dedent`if ((mask >> i & 1) == 0) continue;`,
    dedent`long res = (a[i] % MOD) * (b[j] % MOD) % MOD;`,
    dedent`Arrays.sort(items, Comparator.comparingInt(x -> x.weight));`,
    dedent`List<List<Integer>> adj = new ArrayList<>();`,
    dedent`System.out.println(sb.toString().trim());`,
    dedent`int[][] grid = new int[r + 1][c + 1];`,
  ],
  python: [
    dedent`adj = defaultdict(list)`,
    dedent`dp = [[0] * (c + 1) for _ in range(r + 1)]`,
    dedent`heapq.heappush(pq, (dist[v], v))`,
    dedent`for i, (u, v) in enumerate(edges):`,
    dedent`a[l:r] = a[l:r][::-1]`,
    dedent`print(*(x for x in a if x % 2 == 0), sep=" ")`,
    dedent`freq[w] = freq.get(w, 0) + 1`,
    dedent`if not (0 <= nr < R and 0 <= nc < C):`,
    dedent`best = max(best, dp[mask ^ sub] + cost[sub])`,
    dedent`xs, ys = zip(*pts)`,
    dedent`return (self.par[x] := self.find(self.par[x]))`,
    dedent`sys.setrecursionlimit(1 << 25)`,
  ],
  rust: [
    dedent`let mut adj: Vec<Vec<usize>> = vec![Vec::new(); n + 1];`,
    dedent`let a: Vec<i64> = line.split_whitespace().map(|x| x.parse().unwrap()).collect();`,
    dedent`pq.push(Reverse((dist[v], v)));`,
    dedent`while let Some((r, c)) = q.pop_front() {`,
    dedent`dp[w] = dp[w].max(dp[w - wt[i]] + val[i]);`,
    dedent`*freq.entry(ch).or_insert(0) += 1;`,
    dedent`if e & 1 == 1 { res = res * b % m; }`,
    dedent`let total: i64 = a.iter().sum::<i64>();`,
    dedent`impl Ord for Item { fn cmp(&self, o: &Self) -> Ordering { self.w.cmp(&o.w) } }`,
    dedent`for (dr, dc) in [(0i32, 1i32), (0, -1), (1, 0), (-1, 0)] {`,
  ],
  go: [
    dedent`adj := make([][]int, n+1)`,
    dedent`fmt.Fscan(reader, &n, &m)`,
    dedent`sort.Slice(a, func(i, j int) bool { return a[i] < a[j] })`,
    dedent`dp[w] = max(dp[w], dp[w-wt[i]]+val[i])`,
    dedent`for _, e := range adj[u] {`,
    dedent`if _, ok := seen[x]; ok {`,
    dedent`queue = append(queue, [2]int{nr, nc})`,
    dedent`defer writer.Flush()`,
    dedent`res = res * b % mod`,
    dedent`freq := map[string]int{}`,
  ],
  javascript: [
    dedent`const adj = Array.from({ length: n + 1 }, () => []);`,
    dedent`const [u, v] = next().split(' ').map(Number);`,
    dedent`items.sort((x, y) => x.weight - y.weight || y.value - x.value);`,
    dedent`dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1] + cost[i][j]);`,
    dedent`freq.set(w, (freq.get(w) ?? 0) + 1);`,
    dedent`for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {`,
    dedent`if ((mask >> i) & 1) continue;`,
    dedent`process.stdout.write(out.join('\n') + '\n');`,
    dedent`const mid = (lo + hi) >> 1;`,
    dedent`res = (res * b) % mod;`,
  ],
};

export function fragmentsFor(lang) {
  return FRAGMENTS[lang] || FRAGMENTS.cpp;
}
