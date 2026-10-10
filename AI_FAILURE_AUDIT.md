# AI Failure Mode Audit — Exercise 3

This document records three AI failure modes observed when generating async data fetching + state machine code for Lab 2 Exercise 3. Each entry includes the faulty AI output, root cause, detection method, and the engineering refactor that fixes it.

---

### Entry 1 — Race Condition on Fetch (Stale Response Overwrite)

- **Sample AI Prompt:** "Implement async data fetch that updates state"
- **AI Generated Code (WRONG):**

```js
async function loadData() {
  setState({ status: 'LOADING' });
  try {
    const data = await fetch('/api/data').then(r => r.json());
    setState({ status: 'SUCCESS', data });   // BUG: no stale check
  } catch (err) {
    setState({ status: 'ERROR', error: err.message });
  }
}
```

- **Risk:** User clicks Load 3 times rapidly → 3 parallel requests. Response from request 1 arrives last → overwrites data from request 3. UI shows stale data.
- **Detection Method:** DevTools → Network → throttle Slow 3G → click Load 3 times quickly → wait → displayed data does not match the last request. Console log timestamps of each response to see arrival order.
- **Engineering Refactor:**

```js
let currentRequestId = 0;
async function loadData() {
  currentRequestId += 1;
  const myRequestId = currentRequestId;
  setState({ status: 'LOADING' });
  try {
    const data = await fetch('/api/data').then(r => r.json());
    if (myRequestId !== currentRequestId) return;   // stale → ignore
    setState({ status: 'SUCCESS', data });
  } catch (err) {
    if (myRequestId !== currentRequestId) return;
    setState({ status: 'ERROR', error: err.message });
  }
}
```

- **Verified Fix:** Spam-click Load 3 times → ONLY the last response is applied.

---

### Entry 2 — setInterval for Polling / Countdown

- **Sample AI Prompt:** "Countdown timer 10 seconds then auto-reload data"
- **AI Generated Code (WRONG):**

```js
let remaining = 10;
const intervalId = setInterval(() => {
  remaining -= 1;
  if (remaining <= 0) {
    clearInterval(intervalId);
    loadData();
  }
}, 1000);
```

- **Risk:** `setInterval` drift — callback delayed when tab is background → countdown drifts. No cleanup on component unmount → interval runs forever, memory leak.
- **Detection Method:** DevTools → switch to another tab for 30s → return → countdown out of sync with real time. Performance Monitor → CPU rises despite no interaction.
- **Engineering Refactor:** Use `Date.now()` target timestamp + `requestAnimationFrame` for zero drift, cleanup with `cancelAnimationFrame` on unmount.
- **Verified Fix:** Countdown matches `Date.now()` delta, no drift when tab background.

---

### Entry 3 — innerHTML for Error Message (XSS + Layout Break)

- **Sample AI Prompt:** "Display error message from server response"
- **AI Generated Code (WRONG):**

```js
errorEl.innerHTML = `<p class="error">${error.message}</p>`;
```

- **Risk:**
  - (a) XSS: if server returns error message containing `<img src=x onerror=...>` → executes.
  - (b) Layout break: message 10,000 chars long → breaks layout, obscures other UI.
- **Detection Method:** DevTools → Network → mock response body with `<img onerror=alert(1)>` → alert popup. Test long error → layout breaks.
- **Engineering Refactor:**

```js
const p = document.createElement('p');
p.className = 'error';
p.setAttribute('role', 'alert');
p.textContent = String(error.message || 'Unknown error').slice(0, 200);
p.title = String(error.message || '');
errorEl.replaceChildren(p);
```

- **Verified Fix:** Error message containing HTML → literal text, no execution. Long message → truncated to 200 chars, `title` retains full text.

---

## Summary

| # | Failure Mode | Severity | Status |
|---|--------------|----------|--------|
| 1 | Race condition (stale response) | Critical (Data integrity) | Fixed |
| 2 | setInterval drift + leak | Medium (Timing + memory) | Fixed |
| 3 | innerHTML error message | High (XSS + layout) | Fixed |