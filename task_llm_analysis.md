# task_llm_analysis.md
# Module 7: LLM-powered debugging
# Module 8: AI log summarisation + Release readiness scoring

---

## Sample failure output (terminal / JUnit)

```
FAILED  src/tests/bookingAndData.spec.ts > Positive Booking + Data Integrity

  Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

  Locator: locator('#confirm')
  Expected: visible
  Received: hidden

  Call log:
    - waiting for locator('#confirm')
    - locator resolved to <div id="confirm" style="display:none">…</div>
    - unexpected value "hidden"

    at BookingPage.getConfirmationMessage (src/pages/bookingPage.ts:32:12)
    at src/tests/bookingAndData.spec.ts:21:34
```

---

## Prompt submitted to Claude

```
You are helping a QA engineer debug a Playwright test failure on a
taxi booking web application.

The test submits a booking form and reads a confirmation message
from an element with ID #confirm.

Here is the failure output:
[pasted failure above]

The application is at:
https://webapps.tekstac.com/SeleniumApp2/CallTaxiService/booking.html

Please:
1. Explain the root cause in plain English — is this a test code
   issue or an application defect?
2. Give a specific code fix with the exact Playwright call to add.
3. State whether this failure should block a release and why.
```

---

## AI response (Claude)

**Root cause:**
The `#confirm` div exists in the DOM from page load but has
`style="display:none"` initially. It becomes visible only after
the form submission JS handler runs and changes the display style.
The test is reading `#confirm` immediately after `submitForm()` —
before the JS event has had time to show the element.
This is a **test code timing issue**, not an application defect.

**Specific fix — add waitFor before reading the message:**

```typescript
async getConfirmationMessage(): Promise<string> {
    await this.helper.waitForVisible('#confirm', 8000);
    return await this.helper.getText('#confirm');
}
```

Moving the wait inside `getConfirmationMessage()` means every caller
gets it automatically — no test can forget to wait.

**Release impact:**
This failure **should not block the release** — the booking feature
works correctly in the application. However the fix must be applied
before the next sprint because the unguarded timing assumption will
produce intermittent failures on slower CI runners, making the suite
an unreliable regression signal.

---

## Learner's assessment

The AI diagnosis is **correct**. The `#confirm` element starts as
`display:none` — confirmed by inspecting the live page source.
The fix is also correct and cleaner than adding a raw `waitFor`
in each test file, because it lives in the page object where it
belongs.

One gap in the AI response: it did not notice that `waitForVisible()`
already exists in `Helper.ts`. The fix reuses that existing method
rather than writing new Playwright code — the AI suggested the right
pattern but missed the existing abstraction in the codebase.

---

## Release Readiness Score
### Module 8: structured release readiness summary

| Metric                        | Value             | Status                       |
|------------------------------|-------------------|------------------------------|
| Total tests                   | 12                | —                            |
| Passing                       | 11                | ✓                            |
| Failing                       | 1                 | ✗                            |
| Pass rate                     | 91.7%             | ⚠ Below 95% threshold        |
| Failure type                  | Test timing issue | Not a functional defect      |
| Booking happy path            | Passing after fix | ✓                            |
| Navigation flow               | Passing           | ✓                            |
| Form validation               | Passing           | ✓                            |
| API page responses            | Passing           | ✓                            |
| Session isolation             | Passing           | ✓                            |
| Blocker defects found         | 0                 | ✓                            |
| CI pipeline status            | 1 failure         | ✗ (test code, not app)       |

**AI-generated recommendation:**
> Pass rate 91.7% (11/12). The single failure is a test timing issue —
> not an application regression. All critical user journeys confirmed
> working. Recommendation: apply the one-line waitFor fix, re-run CI
> to confirm green, then release. Do not block on this failure.

**Learner verdict:** Agree. The fix is a single line and the application
is functionally correct. Blocking a release for a test infrastructure
issue is the wrong call.
