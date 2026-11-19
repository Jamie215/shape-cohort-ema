# EMA Study mobile app

A working React Native / Expo project for iOS and Android, with a web review preview. Six supplied EMA screens are connected; shared tokens and controls follow the Healthcare Cost App design system. **The default app uses fictional demo data. This is an implementation for review, not a verified production release.**

## Run

Use Node.js 24 LTS and pnpm 11.19.0 (the versions used for verification). Install pnpm if needed with `npm install -g pnpm@11.19.0`.

```sh
pnpm install --frozen-lockfile
pnpm start
# Press a for Android, i for iOS on a Mac, or scan the QR code.
pnpm web
```

Use an Expo Go version compatible with SDK 57, or build the app with your native toolchain. `pnpm android` needs an Android emulator/device; `pnpm ios` needs macOS and an iOS simulator. To generate and build native projects locally:

```sh
pnpm exec expo run:android
pnpm exec expo run:ios
```

The Android SDK/JDK and Xcode are required respectively. Generated `android/` and `ios/` folders are ignored; Expo config and config plugins remain the source of truth.

Demo sign-in: `alex@example.com` / `password1`. Any syntactically valid email and password of at least eight characters works. `wrongpass` deliberately produces an authentication error. No real account is created.

## Check and build

```sh
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm exec expo install --check
pnpm export
```

`export` generates iOS/Android Hermes bundles and a web bundle in `dist/`; it does **not** produce signed IPA/APK files or verify device behavior.

For installable cloud builds, configure your own Expo account, app identifiers and signing credentials:

```sh
pnpm dlx eas-cli@latest login
pnpm dlx eas-cli@latest build:configure
pnpm build:android
pnpm build:ios
```

The preview profile is for internal distribution. Cloud build scripts download the current official EAS CLI; application dependencies are pinned by `pnpm-lock.yaml`. Cloud builds were not submitted during this task. `com.example.emastudy` is a placeholder identifier; replace it before distribution. Supply app-store icons, privacy descriptions and account configuration before release.

## Configuration and demo states

Copy `.env.example` to `.env` and restart Expo after changing it. Every `EXPO_PUBLIC_*` value is public in the bundle; never store credentials or secrets there.

| Variable                    | Default  | Purpose                                                           |
| --------------------------- | -------- | ----------------------------------------------------------------- |
| `EXPO_PUBLIC_DATA_MODE`     | `mock`   | `mock` or `http`                                                  |
| `EXPO_PUBLIC_DEMO_SCENARIO` | `normal` | `normal`, `empty`, `load-error`, `submit-error`, `insights-ready` |
| `EXPO_PUBLIC_API_BASE_URL`  | none     | HTTPS base URL for the proposed HTTP adapter                      |

Scenarios deterministically expose otherwise uncommon states. `submit-error` intentionally keeps failing so error handling and retries can be inspected; switch back to `normal` and restart to succeed. Mock submissions/preferences live in memory and reset when the app process restarts. Native session tokens use SecureStore; web sessions stay in memory and reset on reload. The mock study is fixed to day 3 and second check-in availability; it does not advance with the clock.

## What works

- Welcome → Login → Home; Home/Profile tabs; questionnaire → confirmation → refreshed Home; logout clears authenticated navigation.
- Email/password validation, password visibility, keyboard next/submit, loading and authentication errors.
- Required single-choice answers, three steps, answer retention, unsaved-answer protection, disabled controls during submission, retry keys and completion only after a receipt.
- Loading/error/retry/empty study and insights views, reminder preference updates, study guide and profile website link.
- Safe-area handling, scrolling, capped tablet content width, text scaling, adaptive choice columns, accessible labels, radio/switch/progress states and enlarged controls.

Authentication, research responses, study schedules, insights and preference persistence are **mocked** by default. The HTTP adapter is implemented against a **proposed, unconfirmed** backend contract. Push notifications are **not integrated**. Video playback is implemented using expo-video, but the approved video source is missing. Set `EXPO_PUBLIC_STUDY_VIDEO_URL` to a direct HTTPS MP4 or supported stream URL and rebuild/restart; webpage links such as YouTube watch URLs are not media sources. Until configured, Play uses the bundled 18-second silent placeholder guide, clearly labeled as demo content. The written guide remains available. Device accessibility, native keyboard behavior and signed builds remain unverified.

See [design review](docs/DESIGN_REVIEW.md), [developer handoff](docs/HANDOFF.md), [API contract](docs/API.md) and [verification report](docs/VERIFICATION.md). Screenshots are in [the preview gallery](docs/PREVIEWS.md).

The stack follows the [Expo project approach](https://docs.expo.dev/get-started/create-a-project/), using SDK-compatible modules from [Expo's SDK reference](https://docs.expo.dev/versions/latest/). SDK 57 template dependency versions were read from the official package registry, then the actual project was type-checked, tested and bundled locally.

Profile check-in times can be edited in local 24-hour format and saved or cancelled. Saved demo times update available/upcoming Home rows; completed check-ins keep their original time. Preferences reset with the demo adapter process. The proposed HTTP preferences endpoint supports the same typed values, but real scheduling and notifications remain backend responsibilities.
