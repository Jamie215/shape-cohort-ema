# Developer handoff

## Architecture

React Native 0.86 / React 19.2 / Expo SDK 57 with TypeScript strict mode. React Navigation native stack and bottom tabs provide platform back behavior and authentication boundaries. No existing repository architecture was provided.

`src/design/` owns tokens and reusable controls. `src/screens/` is presentation. `src/application/AppProvider.tsx` owns session restoration, sign-in/out, preference updates, stale-request protection and resource loading. `src/domain/` contains typed research models and validation. `src/data/` defines `EmaApi`/`SessionStore`, deterministic mock adapters, HTTPS transport, response decoders and native secure storage. `src/navigation/` owns typed route parameters and authenticated/anonymous stacks.

Replace the adapter at the composition root in `App.tsx`, or select HTTP mode through environment configuration. Screens depend on contracts rather than fetch calls. Backend responses are decoded before use. Authentication failures clear the session, timeouts/network errors show safe messages, and request details/credentials are not logged. Native SecureStore holds only session tokens. Health responses remain in memory until sent to the configured service; no analytics SDK or offline response persistence is added.

## Implemented and mocked

UI navigation, validation, loading/error/empty/success/disabled states, Back/answer retention, discard protection and receipt-driven completion work. Mock authentication accepts demo credentials; mock data fixes day 3 with first check-in complete, second available and third upcoming. Submission idempotency keys are stable for unchanged retries, and the mock adapter rejects a second completion or changed payload for an existing key. Reminder preferences save to the adapter; no notifications are scheduled or delivered. Insights are fixtures; no clinical scoring is performed.

The HTTP adapter has transport and runtime shape validation plus adapter tests, but has not contacted a real service. Endpoints, authentication policy, token refresh, approved survey content, timezone rules and notification delivery need backend agreement. Eight-character login validation is a demo assumption to replace with the authentication provider's policy.

## Design decisions

User confirmed design-system blue and demo questions. Foundations' Inter scale and spacing win over EMA differences. Original artwork is used; Feather icons approximate source icons. Larger touch targets and scrolling are intentional. Full conflict and assumption details are in `DESIGN_REVIEW.md`.

## Remaining release dependencies

- Approved research questionnaire, consent/enrollment process and final study schedule; backend-enforced availability/day transitions.
- Real identity provider, refresh/revocation policy, server authorization, response retention and privacy requirements.
- Notification permissions, platform delivery/scheduling, device token registration, timezone/DST handling and opt-out synchronization.
- Approved study-video URL (player implemented; actual-media playback remains unverified), updated guide thumbnail (2 PM artwork vs 1 PM mock schedule), exact Iconoir assets if pixel-level icon matching is required.
- Real application identifiers, Expo project/account, signing credentials, app icons/store metadata.
- Device/simulator QA: VoiceOver/TalkBack, large text, keyboard avoidance, hardware back and offline conditions; signed iOS/Android builds.

Verification is reported in `VERIFICATION.md`. Passing a JavaScript/Hermes bundle export is not evidence of a signed native build or production readiness.

Profile now edits check-in time preferences with Save/Cancel, 24-hour validation, busy/error/success states and adapter-backed updates. Demo preferences persist in the adapter instance and reset on process restart; remaining Home check-ins update, completed times stay unchanged. Real scheduling and notification delivery require the server contract and timezone policy.

7 October 2026: User selected mockup option 1. Profile now uses an inline three-row time-picker card with shared Save/Cancel. Web uses browser time inputs; iOS/Android use the system time picker. Compact layouts stack labels/controls for narrow screens or larger text. Validation, retry, and remaining Home schedule updates are retained. Native picker/device behavior remains unverified.
