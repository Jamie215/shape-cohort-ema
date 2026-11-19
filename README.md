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
