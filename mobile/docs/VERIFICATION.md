# Verification — 6 October 2026

This is a working Expo / React Native implementation with mock services. It is not a certified production release.

| Check                                      | Result                                                         |
| ------------------------------------------ | -------------------------------------------------------------- |
| TypeScript `tsc --noEmit`                  | Passed                                                         |
| ESLint                                     | Passed, no warnings                                            |
| Prettier check                             | Passed                                                         |
| Jest                                       | Passed: 4 suites, 14 tests                                     |
| Expo online dependency compatibility check | Passed: dependencies are up to date                            |
| Expo export, web                           | Passed                                                         |
| Expo export, Android Hermes bundle         | Passed                                                         |
| Expo export, iOS Hermes bundle             | Passed                                                         |
| Signed APK/AAB/IPA build                   | Not run                                                        |
| Native simulator/device checks             | Not run; native SDK tools were unavailable in this environment |
| VoiceOver / TalkBack / native Dynamic Type | Not run                                                        |
| Real backend integration                   | Not run; backend contract is proposed                          |

Tests cover required-answer validation, login validation, adapter loading/error scenarios, successful submission and idempotency, conflicting retries, malformed HTTP responses, authentication failures, form gating, answer retention when navigating back, pending submission protection, and failed-submit retry with the same key.

The browser review exercised Welcome → Login → Home → all three questionnaire steps → saved confirmation → updated Home → Profile → Insights, plus logout, password visibility, inline errors, loading, discard protection, preference changes, and the written guide. The compiled web export was also served locally and exercised through sign-in, questionnaire submission, confirmation, updated check-in status, and Profile. Its font-loading failure was fixed by bundling fonts under short local asset paths; the exported app then rendered successfully.

Screens were compared visually with the supplied Figma frames at 402 × 874. Compact 320 × 712 and tablet-width 768 × 1024 Profile layouts were inspected. Text wraps and content stays within the screen; the tab bar reserves space for labels, safe-area insets, and text scaling. This is limited browser evidence, not verification of every native size or assistive technology.

Intentional discrepancies and remaining source dependencies are recorded in DESIGN_REVIEW.md and HANDOFF.md: blue actions approved by the user, demo questionnaire content, equivalent Feather icons, larger touch targets, corrected day progress, and missing video/updated guide artwork.

Reproduce the checks with `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test`, `pnpm exec expo install --check`, and `pnpm export`. Platform exports compile application bundles; they do not create installable native binaries. Follow README.md for EAS native build commands and device verification before release.

Follow-up button/video update: Start uses an outlined blue action with a chevron, matching the healthcare Home reference. expo-video is integrated inline and in the guide, with native controls and loading/error/retry handling. The user approved a placeholder: an original 18-second silent local MP4 guide is bundled. Placeholder playback was reviewed in the browser; approved final media and native playback remain unverified. TypeScript, lint, formatting, all 14 existing tests, and all-platform exports were rechecked.

Check-in time preference update: 17 tests across 5 suites pass, including malformed/unordered times, decoder validation, saving/restoring preferences, retaining completed timestamps, and form validation/failure/cancel behavior. Type checks, lint, formatting and all-platform exports pass. Browser verification saved afternoon 14:30 and confirmed Home shows 2:30 PM.

7 October 2026: User selected mockup option 1. Profile now uses an inline three-row time-picker card with shared Save/Cancel. Web uses browser time inputs; iOS/Android use the system time picker. Compact layouts stack labels/controls for narrow screens or larger text. Validation, retry, and remaining Home schedule updates are retained. Native picker/device behavior remains unverified.

Night-shift update: 18 tests across 5 suites pass, including midnight rollover acceptance, duplicate/multi-day rejection and saved overnight preferences. Type check and lint pass. Browser saved 22:00 / 02:00 / 08:00 and verified the remaining Home times. Web/iOS/Android exports pass; native device behavior and actual notification scheduling remain unverified.

Study section formatting review: removed the overlapping play action, used shared spacing and typography, placed the action inside the preview card, and sized playback using its actual container at 16:9. Browser verified the card and placeholder playback (readyState 4); type check, lint and all-platform exports pass. Native device layout remains unverified. Screenshot: screenshots/about-study.jpg.

Sign-in update: removed the logo and corrected the Feather font registration to its lowercase family name so icons load before the screen renders. Browser confirmed the eye icon is visible and Show/Hide switches password masking and accessibility labels. Type check, lint, formatting, 18 tests and all-platform exports pass. Updated screenshot: screenshots/login.jpg.

Home action and logout update: removed Read study guide and the placeholder caption, made Start a filled primary action and Play video outlined, and reused the confirmation dialog for logout. Placeholder media remains demo content. Browser verified the new hierarchy, cancel staying signed in and confirmed logout returning to Welcome. Type check, lint, 18 tests and all-platform exports pass. Screenshots: screenshots/about-study.jpg and screenshots/logout-confirmation.jpg.

Status typography update: Completed and Upcoming both use the shared 14px Inter SemiBold button token. Browser computed styles confirm matching font family and size; lint and all-platform exports pass. Screenshot: screenshots/home.jpg.
