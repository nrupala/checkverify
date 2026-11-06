# CheckVerify — Verification Links

CheckVerify generates time-limited verification URLs for credentials and data, and checks them again later, entirely in your browser.

You choose a link type and an expiry — 1 hour, 24 hours, 7 days, 30 days, or 1 year — enter a name and the data to stand behind, and CheckVerify packs it into a self-contained token: a base64-encoded JSON payload carrying the data, the creation time, the expiry time, and a random nonce. The token travels in the URL (`https://checkinfo.me/verify?t=…`); pasting the URL or the token back into the Verify tab decodes it and reports VALID or EXPIRED by comparing the expiry against the current time. Generated links are kept in a local history and can be exported as JSON. There is no server and no account; links live in your browser's `localStorage`.

> Accuracy note — read this before relying on a link: tokens are **unsigned**. The token is an encoding, not a signature — nothing in it is encrypted or authenticated, the nonce comes from `Math.random()`, and the app uses no Web Crypto. Anyone can decode a token and read its contents, and anyone can construct a token that verifies as VALID. CheckVerify links are therefore a convenience format for carrying an expiry with a payload, **not** proof that a credential is genuine. The README of earlier versions called the check "verification"; what the code actually verifies is that a token is well-formed and unexpired.

## What it does

- **Four link types** — Credential, Certificate, Profile, and Custom.
- **Five expiries** — 1 hour, 24 hours, 7 days, 30 days, 1 year, computed from the creation time.
- **Token generation** — `genToken` builds the payload `{data, created, expiry, nonce}` and base64-encodes it; the link is `https://checkinfo.me/verify?t=<token>`.
- **Verification** — `verifyLink` accepts a full URL or a bare token, decodes the payload, and shows status (VALID/EXPIRED), type, name, creation and expiry times, remaining hours, and the payload data; malformed tokens are reported as invalid. **Test Link** checks the just-generated link the same way.
- **Link history** — the last 100 generated links are stored in `localStorage` with live valid/expired counts, can be re-loaded into the form ("Use"), and can be exported as a JSON file.
- **Handshake helper** — `handshake.js` provides a small localStorage-based message queue (`CheckinfoHandshake`) for inter-app communication between Checkinfo-family apps: register, discover, send, and receive.

## How to use it

1. Clone or download this repository.
2. Open `index.html` in any modern browser (no build step, no server needed).
3. On the **Create** tab, pick a type and an expiry, enter a name and the credential data, and click **Generate Link**. Copy it with **Copy**, or sanity-check it with **Test Link**.
4. To check a link later, paste it (or just its token) on the **Verify** tab and click **Verify**.
5. Manage past links on the **Links** tab; **Export** downloads them as JSON.

## Development

- Run the tests: `node tests/smoke.test.js` (Node 18+, no dependencies — the suite loads the page's own script and exercises token generation and parsing, the expiry maths, link creation, the valid/expired/invalid verdicts, and the handshake queue; one assertion pins the documented unsigned-token property so a future signing change must update the test and these docs together).
- CI runs the same suite on every push and pull request (`.github/workflows/tests.yml`), alongside the repository-structure check in `.github/workflows/ci.yml`.
- The test plan (scope, suites, gates, cadence) lives in [TEST-PLAN.md](TEST-PLAN.md).

## Security

Found a vulnerability? Please report it privately — see [SECURITY.md](SECURITY.md) for the reporting route (GitHub Private Vulnerability Reporting). Do not open a public issue for a security vulnerability.

## Contributing

Contributions are welcome — the process is in [CONTRIBUTING.md](CONTRIBUTING.md). Note its PR-flow discipline: changes land through draft pull requests, and every PR adds a CHANGELOG entry.

## License

MIT — see [LICENSE](LICENSE).
