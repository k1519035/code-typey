import { dedent } from "./dedent.js";

/**
 * Go contest patterns. Verbose I/O, explicit error handling and `:=` make for a
 * very different rhythm from C++ — lots of colons, braces and short names.
 */
export const GO = {
  bronze: [
    {
      topic: "fast io",
      title: "buffered reader skeleton",
      code: dedent`
        package main

        import (
            "bufio"
            "fmt"
            "os"
        )

        func main() {
            reader := bufio.NewReader(os.Stdin)
            writer := bufio.NewWriter(os.Stdout)
            defer writer.Flush()

            var n int
            fmt.Fscan(reader, &n)
            fmt.Fprintln(writer, n*2)
        }
      `,
    },
    {
      topic: "arrays",
      title: "read n values",
      code: dedent`
        a := make([]int, n)
        for i := 0; i < n; i++ {
            fmt.Fscan(reader, &a[i])
        }
      `,
    },
    {
      topic: "arrays",
      title: "sum and maximum",
      code: dedent`
        total, best := 0, math.MinInt64
        for _, x := range a {
            total += x
            if x > best {
                best = x
            }
        }
      `,
    },
    {
      topic: "branching",
      title: "switch without a condition",
      code: dedent`
        switch {
        case a > b && b > c:
            fmt.Println("decreasing")
        case a < b && b < c:
            fmt.Println("increasing")
        default:
            fmt.Println("neither")
        }
      `,
    },
    {
      topic: "strings",
      title: "palindrome check",
      code: dedent`
        func isPalindrome(s string) bool {
            for lo, hi := 0, len(s)-1; lo < hi; lo, hi = lo+1, hi-1 {
                if s[lo] != s[hi] {
                    return false
                }
            }
            return true
        }
      `,
    },
    {
      topic: "counting",
      title: "frequency map",
      code: dedent`
        freq := make(map[string]int)
        for _, w := range words {
            freq[w]++
        }
      `,
    },
    {
      topic: "grids",
      title: "allocate a 2D slice",
      code: dedent`
        grid := make([][]byte, r)
        for i := range grid {
            grid[i] = make([]byte, c)
        }
      `,
    },
    {
      topic: "math",
      title: "gcd",
      code: dedent`
        func gcd(a, b int) int {
            for b != 0 {
                a, b = b, a%b
            }
            return a
        }
      `,
    },
  ],

  silver: [
    {
      topic: "sorting",
      title: "sort.Slice with a tiebreak",
      code: dedent`
        sort.Slice(items, func(i, j int) bool {
            if items[i].weight != items[j].weight {
                return items[i].weight < items[j].weight
            }
            return items[i].value > items[j].value
        })
      `,
    },
    {
      topic: "binary search",
      title: "sort.SearchInts",
      code: dedent`
        idx := sort.SearchInts(a, target)
        if idx < len(a) && a[idx] == target {
            fmt.Println("found at", idx)
        }
      `,
    },
    {
      topic: "two pointers",
      title: "pair summing to target",
      code: dedent`
        lo, hi := 0, n-1
        for lo < hi {
            sum := a[lo] + a[hi]
            if sum == target {
                break
            } else if sum < target {
                lo++
            } else {
                hi--
            }
        }
      `,
    },
    {
      topic: "prefix sums",
      title: "1D prefix sums",
      code: dedent`
        pre := make([]int64, n+1)
        for i := 0; i < n; i++ {
            pre[i+1] = pre[i] + int64(a[i])
        }
        rangeSum := pre[r+1] - pre[l]
      `,
    },
    {
      topic: "bfs",
      title: "flood fill on a grid",
      code: dedent`
        queue := [][2]int{{sr, sc}}
        seen[sr][sc] = true
        for len(queue) > 0 {
            cur := queue[0]
            queue = queue[1:]
            for _, d := range [][2]int{{0, 1}, {0, -1}, {1, 0}, {-1, 0}} {
                nr, nc := cur[0]+d[0], cur[1]+d[1]
                if nr < 0 || nr >= rows || nc < 0 || nc >= cols {
                    continue
                }
                if seen[nr][nc] || grid[nr][nc] == '#' {
                    continue
                }
                seen[nr][nc] = true
                queue = append(queue, [2]int{nr, nc})
            }
        }
      `,
    },
    {
      topic: "graphs",
      title: "adjacency list",
      code: dedent`
        adj := make([][]int, n+1)
        for i := 0; i < m; i++ {
            var u, v int
            fmt.Fscan(reader, &u, &v)
            adj[u] = append(adj[u], v)
            adj[v] = append(adj[v], u)
        }
      `,
    },
    {
      topic: "greedy",
      title: "interval scheduling",
      code: dedent`
        sort.Slice(iv, func(i, j int) bool { return iv[i][1] < iv[j][1] })
        taken, lastEnd := 0, math.MinInt64
        for _, cur := range iv {
            if int64(cur[0]) >= lastEnd {
                taken++
                lastEnd = int64(cur[1])
            }
        }
      `,
    },
    {
      topic: "sets",
      title: "set via struct{} map",
      code: dedent`
        seen := make(map[int]struct{})
        for _, x := range a {
            if _, ok := seen[x]; ok {
                continue
            }
            seen[x] = struct{}{}
        }
      `,
    },
  ],

  gold: [
    {
      topic: "shortest paths",
      title: "dijkstra with container/heap",
      code: dedent`
        dist := make([]int64, n)
        for i := range dist {
            dist[i] = math.MaxInt64
        }
        dist[src] = 0
        pq := &PQ{{node: src, cost: 0}}
        heap.Init(pq)
        for pq.Len() > 0 {
            cur := heap.Pop(pq).(Item)
            if cur.cost > dist[cur.node] {
                continue
            }
            for _, e := range adj[cur.node] {
                if nd := cur.cost + e.w; nd < dist[e.to] {
                    dist[e.to] = nd
                    heap.Push(pq, Item{node: e.to, cost: nd})
                }
            }
        }
      `,
    },
    {
      topic: "heaps",
      title: "heap.Interface boilerplate",
      code: dedent`
        func (p PQ) Len() int            { return len(p) }
        func (p PQ) Less(i, j int) bool  { return p[i].cost < p[j].cost }
        func (p PQ) Swap(i, j int)       { p[i], p[j] = p[j], p[i] }
        func (p *PQ) Push(x interface{}) { *p = append(*p, x.(Item)) }
      `,
    },
    {
      topic: "dsu",
      title: "union-find",
      code: dedent`
        func find(x int) int {
            for par[x] != x {
                par[x] = par[par[x]]
                x = par[x]
            }
            return x
        }

        func unite(a, b int) bool {
            a, b = find(a), find(b)
            if a == b {
                return false
            }
            par[b] = a
            return true
        }
      `,
    },
    {
      topic: "dp",
      title: "0/1 knapsack",
      code: dedent`
        dp := make([]int64, cap+1)
        for i := 0; i < n; i++ {
            for w := cap; w >= wt[i]; w-- {
                if v := dp[w-wt[i]] + val[i]; v > dp[w] {
                    dp[w] = v
                }
            }
        }
      `,
    },
    {
      topic: "modular math",
      title: "modpow",
      code: dedent`
        func power(b, e, mod int64) int64 {
            res := int64(1)
            b %= mod
            for e > 0 {
                if e&1 == 1 {
                    res = res * b % mod
                }
                b = b * b % mod
                e >>= 1
            }
            return res
        }
      `,
    },
    {
      topic: "topological sort",
      title: "kahn's algorithm",
      code: dedent`
        queue := make([]int, 0, n)
        for i := 0; i < n; i++ {
            if indeg[i] == 0 {
                queue = append(queue, i)
            }
        }
        for len(queue) > 0 {
            u := queue[0]
            queue = queue[1:]
            order = append(order, u)
            for _, v := range adj[u] {
                indeg[v]--
                if indeg[v] == 0 {
                    queue = append(queue, v)
                }
            }
        }
      `,
    },
    {
      topic: "fenwick",
      title: "binary indexed tree",
      code: dedent`
        func (t *BIT) Add(i int, v int64) {
            for ; i < len(t.a); i += i & (-i) {
                t.a[i] += v
            }
        }

        func (t *BIT) Query(i int) int64 {
            var s int64
            for ; i > 0; i -= i & (-i) {
                s += t.a[i]
            }
            return s
        }
      `,
    },
    {
      topic: "strings",
      title: "builder for fast output",
      code: dedent`
        var sb strings.Builder
        for i, x := range a {
            if i > 0 {
                sb.WriteByte(' ')
            }
            sb.WriteString(strconv.Itoa(x))
        }
        fmt.Fprintln(writer, sb.String())
      `,
    },
  ],

  platinum: [
    {
      topic: "segment tree",
      title: "iterative segment tree",
      code: dedent`
        func (s *SegTree) Update(i int, v int64) {
            for i += s.size; i > 1; i >>= 1 {
                s.tree[i>>1] = s.tree[i] + s.tree[i^1]
            }
        }
      `,
    },
    {
      topic: "generics",
      title: "constrained generic helper",
      code: dedent`
        type Number interface {
            ~int | ~int64 | ~float64
        }

        func Max[T Number](a, b T) T {
            if a > b {
                return a
            }
            return b
        }
      `,
    },
    {
      topic: "strings",
      title: "kmp prefix function",
      code: dedent`
        func prefixFunction(s string) []int {
            pi := make([]int, len(s))
            for i := 1; i < len(s); i++ {
                j := pi[i-1]
                for j > 0 && s[i] != s[j] {
                    j = pi[j-1]
                }
                if s[i] == s[j] {
                    j++
                }
                pi[i] = j
            }
            return pi
        }
      `,
    },
    {
      topic: "geometry",
      title: "cross product",
      code: dedent`
        func cross(o, a, b [2]int64) int64 {
            return (a[0]-o[0])*(b[1]-o[1]) - (a[1]-o[1])*(b[0]-o[0])
        }
      `,
    },
    {
      topic: "bitsets",
      title: "bit manipulation",
      code: dedent`
        lowest := mask & (-mask)
        count := bits.OnesCount64(uint64(mask))
        for sub := mask; sub > 0; sub = (sub - 1) & mask {
            best = min(best, dp[mask^sub]+cost[sub])
        }
      `,
    },
    {
      topic: "lca",
      title: "binary lifting table",
      code: dedent`
        for k := 1; k < LOG; k++ {
            for v := 0; v < n; v++ {
                up[k][v] = up[k-1][up[k-1][v]]
            }
        }
      `,
    },
    {
      topic: "sqrt decomposition",
      title: "mo's algorithm ordering",
      code: dedent`
        sort.Slice(qs, func(i, j int) bool {
            bi, bj := qs[i].l/block, qs[j].l/block
            if bi != bj {
                return bi < bj
            }
            if bi&1 == 1 {
                return qs[i].r > qs[j].r
            }
            return qs[i].r < qs[j].r
        })
      `,
    },
    {
      topic: "concurrency",
      title: "parallel worker pool",
      code: dedent`
        var wg sync.WaitGroup
        results := make(chan int64, len(tasks))
        for _, t := range tasks {
            wg.Add(1)
            go func(t Task) {
                defer wg.Done()
                results <- solve(t)
            }(t)
        }
        wg.Wait()
        close(results)
      `,
    },
  ],
};
