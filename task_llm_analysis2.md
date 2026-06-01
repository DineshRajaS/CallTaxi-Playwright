# task_llm_analysis.md
# Module 7 — LLM-Powered Debugging
# Module 8 — AI Log Summarisation + Release Readiness Scoring

---

## 📌 STUDENT INSTRUCTIONS — READ BEFORE STARTING

This file is your deliverable for Module 7 and Module 8.
You will fill it in yourself using your actual test results.
Do not copy someone else's output — the AI analysis must come from your real test run.

### How to complete this file

**Step 1 — Run your tests and capture a failure**
```bash
npx playwright test
```
If all tests pass, deliberately break one assertion to generate a failure. For example,
in `happyPath.spec.ts` change:
```typescript
expect(await booking.getConfirmationMessage()).toContain('Your Booking has been Confirmed');
```
to:
```typescript
expect(await booking.getConfirmationMessage()).toContain('WRONG TEXT');
```
Run the tests, note the failure output in the terminal, then restore the original assertion.

**Step 2 — Copy the failure output**
Copy the full error block from your terminal. It will look like:
```
FAILED  src/tests/happyPath.spec.ts > ...
  Error: expect(received).toContain(expected)
  ...
```

**Step 3 — Open ChatGPT or Claude**
Paste your failure output and use the prompt template in Section 2 below.
Copy the full AI response into Section 3.

**Step 4 — Write your own assessment**
In Section 4, write 3–5 sentences of your own judgment:
- Was the AI correct?
- What did it miss?
- What would you do differently with the prompt?

**Step 5 — Complete the Release Readiness Score table in Section 5**
Fill in your actual pass/fail numbers from your test run.

---

## Section 1 — Your Test Failure Output

```
PASTE YOUR ACTUAL FAILURE OUTPUT HERE
```

*(Example for reference — replace with your real output)*
```
FAILED  src/tests/happyPath.spec.ts > Booking — Positive / Happy Path > TC01

  Error: Timed out 8000ms waiting for expect(locator).toBeVisible()

  Locator: locator('#confirm')
  Expected: visible
  Received: hidden

  Call log:
    - waiting for locator('#confirm')
    - locator resolved to <div id="confirm" style="display:none">…</div>

    at BookingPage.getConfirmationMessage (src/pages/bookingPage.ts:68:12)
    at src/tests/happyPath.spec.ts:22:51
```

---

## Section 2 — Your Prompt to the AI Tool

**AI tool used:** *(write: ChatGPT GPT-4o / Claude 3.5 / Gemini etc.)*

```
PASTE YOUR EXACT PROMPT HERE
```

*(Template to use — copy and fill in your real failure output)*

```
You are helping a QA engineer debug a Playwright test failure on a
live taxi booking web application called CallTaxi.

The application URL is:
https://webapps.tekstac.com/SeleniumApp2/CallTaxiService/booking.html

The test submits a booking form and reads a confirmation from #confirm.

Here is the failure output:
[PASTE YOUR FAILURE HERE]

Please:
1. Explain the root cause in plain English — is this a test code issue
   or an application defect?
2. Provide a specific code fix with the exact Playwright call to add or change.
3. State whether this failure should block a production release and why.
4. Identify whether this is likely to be an intermittent (flaky) failure
   or a consistent one, and explain your reasoning.
```

---

## Section 3 — Full AI Response

```
PASTE THE COMPLETE AI RESPONSE HERE
```

---

## Section 4 — Your Assessment of the AI Response

*(Write 3–5 sentences answering these questions)*

1. Was the AI's root cause diagnosis correct? How do you know?
2. Was the proposed fix accurate and specific enough to act on?
3. Did the AI miss anything important — e.g. an existing method in the codebase?
4. Would you change your prompt to get a better answer next time? How?

**Your assessment:**

```
WRITE YOUR ASSESSMENT HERE
```

---

## Section 5 — Release Readiness Score
### Module 8: Structured release readiness summary from your test run

Fill this table with your actual results after running `npx playwright test`.

| Metric                          | Your Value         | Status            |
|--------------------------------|--------------------|-------------------|
| Total tests run                 |                    |                   |
| Passing                         |                    |                   |
| Failing                         |                    |                   |
| Pass rate (passing/total × 100) |                    | ✓ if ≥95% / ⚠ if <95% |
| Failure type (code issue / app defect / unknown) |   |              |
| Happy path tests passing        |                    |                   |
| Negative validation passing     |                    |                   |
| API tests passing               |                    |                   |
| Context isolation passing       |                    |                   |
| Blocker defects found           |                    |                   |
| CI pipeline status              |                    |                   |

### AI-generated release recommendation

Paste the recommendation you got by using this prompt with your completed table above:

```
Based on these test results: [paste your completed table]

Please provide:
1. A one-paragraph release recommendation (safe to release / hold / fix and re-run)
2. The top 1-2 risks if released in this state
3. What single action would most improve confidence before release
```

**AI recommendation:**

```
PASTE AI RECOMMENDATION HERE
```

**Your verdict:**
*(Do you agree? Why or why not? — 2-3 sentences)*

```
WRITE YOUR VERDICT HERE
```

---

## Section 6 — AI Log Pattern Analysis
### Module 8: Defect prediction from test run patterns

After running your full suite multiple times (at least 2 runs), use this prompt:

```
I ran a Playwright test suite against a taxi booking web app across two runs.
Here are the results:

Run 1: [X] passed, [Y] failed — failing tests: [list test names]
Run 2: [X] passed, [Y] failed — failing tests: [list test names]

Please:
1. Identify which failures appear in both runs (consistent defects) vs.
   only one run (likely flaky/intermittent)
2. Predict which test areas are highest risk for the next release
3. Suggest what type of defect is most likely causing the consistent failures
```

**Your run results:**

| Run | Passed | Failed | Failing tests |
|-----|--------|--------|---------------|
| 1   |        |        |               |
| 2   |        |        |               |

**AI pattern analysis:**

```
PASTE AI RESPONSE HERE
```

**Your assessment:**

```
WRITE YOUR ASSESSMENT HERE
```