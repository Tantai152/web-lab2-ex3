# Work Breakdown Structure (WBS) — Exercise 3: Resilient State Machine & Skeleton Loader

| Task ID | Sub-task | Output file | Contract | Acceptance Criteria | Commit message |
|---------|----------|-------------|----------|---------------------|----------------|
| 0.1 | WBS definition | TASK_DECOMPOSITION.md | 6-col table; chỉ Ex 3 | Committed before any code | docs(spec): add exercise 3 WBS |
| 0.2 | Project rules | project-rules.md | Banned: var, innerHTML, inline handlers, keypress/keyCode; CSP; semantic HTML; vanilla only | Khớp Lab 2 constraints | docs(spec): add project rules |
| 3.1 | ViewState reducer | src/state/view-state.js | STATUS = {IDLE, LOADING, SUCCESS, ERROR}; createViewState(); transition(state, action) pure function | Không transition nào ngoài 4 states; transition invalid throw Error | feat(state): implement ViewState reducer |
| 3.2 | DataFeed component | src/app/data-feed.js | export function DataFeed(); dùng useState cho {status, data, error}; fetch mock có delay + random fail; requestId guard chống race | 4 state render đúng; stale response bị ignore | feat(ui): implement multi-state data component |
| 3.3 | Skeleton loader CSS | styles/skeleton.css | .skeleton, .skeleton--pulse; @keyframes pulse; prefers-reduced-motion fallback | Pulse animation mượt; contrast ≥ 4.5:1 | feat(css): add skeleton loader styles |
| 3.4 | Error retry path | src/app/data-feed.js (update) | data-action="retry"; aria-live="polite"; button retry reset về LOADING | Retry works; stale request canceled | fix(ui): add error retry path |
| 3.5 | Entry point mount | src/main.js | Import DataFeed; mount vào #app; wire setRenderer + resetCursor + delegation hub | Mount thành công; no console error | feat(js): mount data feed |
| 3.6 | Harness HTML | index.html | Meta CSP; semantic tags; exactly 1 h1; aria-live status; link styles/main.css + styles/skeleton.css | Live Server 5500 sạch; zero horizontal scroll 375px | feat(html): add data feed harness |
| 3.6b | Base CSS | styles/main.css | Reset + typography + layout cho data feed | Mobile-first 375px; contrast AA | feat(css): add base styles |
| 3.7 | Verification report | VERIFICATION_REPORT.md | Audit banned pattern + 4 state test + race condition test + a11y + responsive | All PASS | chore(verify): final exercise audit |

**Tổng: 9 tasks. Mỗi task produce đúng 1 file. Commit theo Conventional Commits.**