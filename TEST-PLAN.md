# Test plan — CheckVerify

## Scope

Testing covers the single-page app in `index.html` (token generation and
parsing, expiry computation, link creation and storage, the verification
verdicts) and the `handshake.js` inter-app message queue. Clipboard and
file-download mechanics, rendering, and styling are out of scope for the
automated suite and are checked manually in a browser before a release.
The tokens' unsigned design is a documented product property (README
accuracy note); the suite pins it with an explicit assertion so any future
signing change updates code, tests, and docs together.

## Suites

| Suite | Covers | Run it | Runs in CI |
|---|---|---|---|
| Smoke suite (`tests/smoke.test.js`) | Page structure (core element IDs, button wiring, the four link types and five expiry options); token round-trip via the page's own `genToken`/`parseToken` (payload preserved, expiry = creation + chosen hours, per-token nonce); malformed-token handling (parses to null); link creation (verify-URL shape, stored record, localStorage persistence, valid counts); verification verdicts (fresh → VALID, past-expiry → EXPIRED, garbage → Invalid token, hand-built unsigned token → VALID per the documented design); `handshake.js` send/receive round-trip | `node tests/smoke.test.js` | Yes — `.github/workflows/tests.yml` |
| Repository structure check | Presence of `index.html`, `README.md`, `LICENSE`, `.gitignore` | (shell steps in the workflow) | Yes — `.github/workflows/ci.yml` |

## CI gates

- Smoke suite green on every push and pull request to `main`.
- CodeQL (javascript-typescript) runs on push, pull request, and weekly; findings are dispositioned per the house SLA (Critical 48 h, High 7 d, Medium 14 d — fix, or a dismissal with the reason recorded).

## Cadence

- Every pull request: smoke suite + structure check + CodeQL.
- Weekly: CodeQL scheduled run.
- Every release candidate: the release-readiness run (checker + evidence reads), per the house Release-Readiness Standard.

## Coverage bar

No numeric floor; new functionality lands with tests per CONTRIBUTING.
