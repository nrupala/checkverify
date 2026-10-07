# Contributing to CheckVerify

## How changes land (PR-flow)

1. Create a branch from `main` for each workstream (`feat/...`, `fix/...`, `chore/...`).
2. Open a **draft PR** early; mark it ready for review when everything is green.
3. The owner (Nrupal Akolkar) merges. **No direct pushes to `main` — ever.**
   (Until branch protection with required checks is enabled, this is manual discipline — say so plainly, and say it again in the PR.)
4. Each PR adds its entry under `## [Unreleased]` in `CHANGELOG.md`.
5. Releases are tagged `vX.Y.Z` after merge; merge commits reference the PR number.
6. Versioning: this repo currently has no version file (the version is a
   `<meta name="version">` marker in `index.html`). If one is introduced,
   follow SemVer (patch = fix, minor = feature, major = breaking).

## Build / test

There is no build step — CheckVerify is a static HTML/JS app.

- CI (`.github/workflows/ci.yml`) verifies the key files exist.
- To test manually: open `index.html` in a browser, generate a link, and verify it.

## License

MIT — see `LICENSE`. Add the MIT header to any new source file.
