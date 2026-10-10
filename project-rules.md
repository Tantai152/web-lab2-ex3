# Project Rules — Lab 2 Exercise 3

## Ngôn ngữ & Runtime
- Vanilla HTML5 + Modern CSS + ES6+ JavaScript
- KHÔNG framework, KHÔNG thư viện, KHÔNG CDN
- Local server: http://localhost:5500 (Live Server). file:/// BANNED.

## Quy tắc code (BANNED → MUST USE)
| BANNED | MUST USE |
|--------|----------|
| var / implicit global | const (default), let (chỉ khi reassign) |
| keypress / e.keyCode | keydown / e.key / e.code |
| innerHTML với user input | textContent hoặc DOM APIs (createTextNode, replaceChildren) |
| Inline event handler (onclick=, oninput=, ...) | Event Delegation tập trung tại root |
| Array index làm key | stable unique ID (crypto.randomUUID()) |
| setInterval cho countdown/timing | requestAnimationFrame + Date.now() delta |

## Semantic HTML
- KHÔNG dùng <div> cho cấu trúc — dùng section, article, header, footer, nav, figure, main
- Exactly 1 <h1> mỗi document, không skip heading level (h1→h2→h3)

## Accessibility (WCAG 2.2 AA)
- Contrast ≥ 4.5:1
- Full keyboard Tab/Enter/Space flow
- :focus-visible outline 3px
- aria-live="polite" cho dynamic status (LOADING/SUCCESS/ERROR)
- aria-busy="true" trên container khi đang LOADING
- Skeleton loader phải có prefers-reduced-motion fallback (tắt pulse animation)

## Security
- Meta CSP trong <head>:
  `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; media-src 'self'">`
- KHÔNG innerHTML với user input (XSS prevention)
- Error message từ fetch PHẢI escape qua textContent, KHÔNG nhét vào template string HTML

## Responsive
- Mobile-first: verify ở 375px trước desktop
- Zero horizontal scrollbar

## State Machine Invariants (QUAN TRỌNG)
- ViewState CHỈ có 4 status: 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'
- KHÔNG có state trung gian nào khác (VD: 'FETCHING', 'PENDING', 'RETRYING' — BANNED)
- Transition hợp lệ:
    IDLE    → LOADING
    LOADING → SUCCESS | ERROR
    SUCCESS → LOADING (khi retry/refetch)
    ERROR   → LOADING (khi bấm Retry)
- Transition KHÔNG hợp lệ phải throw Error rõ ràng — không silent fail.
- Mỗi state render PHẢI mutually exclusive:
    IDLE    → không có skeleton, không có data, có thể có nút "Load"
    LOADING → CHỈ có skeleton, KHÔNG có data cũ, KHÔNG có error
    SUCCESS → CHỈ có data, KHÔNG có skeleton, KHÔNG có error
    ERROR   → CHỈ có error message + Retry button, KHÔNG có skeleton, KHÔNG có data

## Race Condition Prevention (QUAN TRỌNG)
- Mỗi lần fetch PHẢI có requestId (tăng dần) hoặc AbortController.
- Khi response về, check requestId có khớp request hiện tại không:
    Nếu KHÔNG khớp (stale) → ignore response, KHÔNG setState.
- Retry button khi đang LOADING → disabled (không cho bấm 2 lần).
- Không dùng setInterval cho delay fetch — dùng Promise + setTimeout.

## Git Workflow
- 1 task = 1 file = 1 commit
- Commit message format: type(scope): description
- Types: docs(spec), feat(html), feat(css), feat(js), feat(core), feat(state), feat(events), feat(ui), fix(a11y), fix(nav), fix(sec), perf, chore

**Rules bất biến — không thay đổi giữa chừng.**