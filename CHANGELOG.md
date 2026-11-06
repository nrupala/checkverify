# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Escape token fields when rendering the verification result, so a crafted
  token cannot inject markup into the page (CodeQL js/xss-through-dom).


### Added
- Portfolio certification rollout (draft PR; owner merges):
  - CONTRIBUTING.md — PR-flow discipline: draft PR → owner merges; no direct pushes to `main`; CHANGELOG entry under Unreleased per PR; releases tagged `vX.Y.Z`.
  - NOTICE.md — attribution ("Owned by Nrupal Akolkar · Built by Muse").
  - MIT license headers on `handshake.js` and `index.html`, matching the existing MIT LICENSE.
  - CHANGELOG.md itself — this entry.
