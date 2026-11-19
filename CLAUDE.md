# CLAUDE.md

Guidance for Claude Code (and other contributors) working in this repository.

## Project

SHAPE Cohort EMA: a standalone React Native + Expo + TypeScript app for
iOS and Android. Participants complete three check-ins a day during 7-day
bursts; answers go to Empower. The Empower team owns the backend; this repo
owns the app and the API contract.

## Layout

- `mobile/` is the app and its own pnpm workspace root. Run all commands there.
- `mobile/src/design` shared tokens and controls; `src/screens` screens;
  `src/application/AppProvider.tsx` session and preference state;
  `src/domain` models and validation; `src/data` the `EmaApi` and
  `SessionStore` contracts with mock and HTTP adapters.
- Screens depend on `EmaApi`, never on `fetch`. New backend work goes behind
  that interface, so the mock adapter keeps working.
- Documentation is Markdown only.

## Commands (from `mobile/`)

- Install: `pnpm install --frozen-lockfile` (Node 24, pnpm 11.19.0)
- All checks: `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test`
- Dependency/SDK compatibility: `pnpm exec expo install --check`
  (needs network access to api.expo.dev)
- Add a library: `pnpm exec expo install <package>` so the version matches
  the Expo SDK.

## Rules

- Never commit real participant data. Fixtures and screenshots use fictional
  people only.
- Notification and lock-screen text stays neutral; no health or identity
  details.
- No third-party analytics, crash reporting or server push without a privacy
  review (data must stay in Canada).
- Every `EXPO_PUBLIC_*` value is bundled into the app; never put secrets there.
- Schedule logic (time zones, daylight saving, midnight crossings) needs unit
  tests for those cases.
- Conventional Commits; one logical change per commit; work on a branch.
