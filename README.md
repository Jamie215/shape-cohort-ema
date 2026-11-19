# SHAPE Cohort EMA

A mobile app for the SHAPE Cohort, a community-governed study of
2S/LGBTQIA+ adults living with arthritis in Canada. During 7-day "burst"
periods, participants answer three short check-ins a day about their
symptoms and daily experiences. Answers are stored in Empower, the study's
existing data platform.

EMA stands for _ecological momentary assessment_: short questionnaires
answered several times a day, in normal life, so answers reflect the moment
rather than memory.

> **Status:** early development. The app runs on demo data only. Sign-in,
> saving answers to Empower, reminders and offline mode are not built yet.

## What is in this repository

| Folder               | What it holds                                                                                   |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| [`mobile/`](mobile/) | The iPhone and Android app (React Native, Expo, TypeScript). Started from the MSK-IF prototype. |
| `.github/`           | Automatic checks that run on every pull request, and the pull request template.                 |

## Who does what

- **App (this repository):** Jamie Kim.
- **Backend API and database:** the Empower team, built to an API contract
  written in this repository.
- **Questionnaire content, schedule and burst rules:** the research team
  (Codie Primeau, PI) with the Patient and Community Co-Governance Group.

## Tech stack

The app is built with **React Native**, **Expo** and **TypeScript**, the
same stack as the MSK-IF prototype.

- **React Native** lets one codebase run as a real installed app on both
  iPhone and Android.
- **Expo** is a toolkit around React Native. It provides ready-made phone
  features (notifications, secure storage, video) and builds and signs the
  apps, so we write no iOS- or Android-specific code.
- **TypeScript** is JavaScript with type checking, which catches many
  mistakes before the app runs.

### Why this stack

The app must run on iPhone and Android, remind people even when offline,
keep answers encrypted on the phone until they upload, and work with screen
readers. It is built by one developer working part time, so a rewrite or a
second codebase would cost hours the plan does not have.

| Option                                    | Verdict  | Main reason                                                                                                                                     |
| ----------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| React Native + Expo + TypeScript          | Chosen   | The prototype's screens, data layer and tests already exist, and Expo has modules for every requirement.                                        |
| Installable website (progressive web app) | Rejected | On iPhone, reminders only work after adding the site to the home screen, scheduled reminders need a server, and Safari can delete offline data. |
| Flutter                                   | Rejected | A full rewrite in a new language (Dart), losing the prototype.                                                                                  |
| Separate Swift and Kotlin apps            | Rejected | Two codebases for one part-time developer.                                                                                                      |
| Wrapping SPINA's web app (Capacitor)      | Rejected | SPINA is a different app, and the prototype would be thrown away.                                                                               |

### In use now

| Purpose          | Tool                                                              |
| ---------------- | ----------------------------------------------------------------- |
| App framework    | React Native 0.86, React 19.2, Expo SDK 57                        |
| Screens and tabs | React Navigation 7                                                |
| Sign-in token    | `expo-secure-store` (iPhone Keychain, Android Keystore)           |
| Video guide      | `expo-video`                                                      |
| Time picker      | `@react-native-community/datetimepicker` (the phone's own picker) |
| Tests            | Jest with `jest-expo` and React Native Testing Library            |
| Code quality     | ESLint and Prettier, run in CI                                    |
| Tooling versions | Node.js 24, pnpm 11.19                                            |

### Planned additions

Each library is added with the feature that uses it, not before. Unused
libraries still need updating and testing.

| Feature                   | Library                                                 | Why                                                                                                  |
| ------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Reminders                 | `expo-notifications` (local notifications)              | The phone schedules reminders itself, so they arrive offline and need no push server outside Canada. |
| Offline answers           | `expo-sqlite` with encryption (SQLCipher)               | Answers wait encrypted on the phone and are deleted once Empower confirms the upload.                |
| Check-in schedule         | `luxon` (date and time library)                         | Handles time zones, daylight saving and overnight schedules explicitly.                              |
| Questionnaire content     | `zod` (data validation)                                 | Checks the questionnaire sent by Empower, so wording can change without a new app release.           |
| API contract with Empower | OpenAPI file, types generated with `openapi-typescript` | One precise description of the requests that both teams work from.                                   |
| End-to-end tests          | Maestro                                                 | Taps through the real app on a simulator; simpler for one developer than the alternative, Detox.     |
| Builds and pilot release  | EAS Build, TestFlight, Google Play internal testing     | Signed builds in the cloud; pilot users install without a public store listing.                      |

Add libraries with `pnpm exec expo install <package>` so the version
matches the Expo SDK.

### Deliberately left out

- **Our own server.** Empower owns the backend and database.
- **Server push notifications, analytics and crash reporting.** Most of
  these services send data outside Canada. Revisit only after Western's
  privacy review.
- **Over-the-air updates.** Changing the app mid-study may need research
  ethics board (REB) approval. Decide with the research team first.
- **A web version for participants.** The web preview is for design review
  only.

## Running the app on your computer

You need [Node.js 24](https://nodejs.org/) and pnpm 11.19.0.

```bash
npm install -g pnpm@11.19.0
```

```bash
cd mobile
```

```bash
pnpm install --frozen-lockfile
```

```bash
pnpm web
```

`pnpm web` opens a browser preview. To try it on a phone, run `pnpm start`
and scan the QR code with Expo Go. Demo sign-in: `alex@example.com` /
`password1`. More detail, including native builds, is in
[`mobile/README.md`](mobile/README.md).

## Checks

Run these from `mobile/` before opening a pull request. GitHub runs the same
checks automatically.

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test
```

## Privacy

This study involves health information and information about sexual
orientation and gender identity. Never put real participant data in this
repository, in test files, or in screenshots. Use fictional data only.
