import {
  defaultCheckInTimes,
  validCheckInTimes,
  displayCheckInTime,
} from '../domain/checkInTimes';
import { EmaApi } from './contracts';
import {
  AppError,
  Participant,
  Questionnaire,
  Study,
  Receipt,
} from '../domain/models';
import { validateLogin, validateSubmission } from '../domain/validation';
export type DemoScenario =
  'normal' | 'empty' | 'load-error' | 'submit-error' | 'insights-ready';
export const demoQuestionnaire: Questionnaire = {
  version: 'demo-v1',
  demo: true,
  steps: [
    [
      {
        id: 'pain',
        label: 'How is your pain right now?',
        options: ['No pain', 'Mild pain', 'Moderate pain', 'Severe pain'],
        layout: 'radio',
      },
      {
        id: 'location',
        label: 'Where do you feel it most?',
        options: ['Hands', 'Wrists', 'Knees', 'Hips', 'Other', 'No pain'],
        layout: 'grid',
      },
    ],
    [
      {
        id: 'energy',
        label: 'How is your energy right now?',
        options: ['Very low', 'Low', 'Good', 'Very good'],
        layout: 'radio',
      },
      {
        id: 'activity',
        label: 'What have you been doing?',
        options: [
          'Resting',
          'Working',
          'Walking',
          'Exercise',
          'Housework',
          'Other',
        ],
        layout: 'grid',
      },
    ],
    [
      {
        id: 'mood',
        label: 'How are you feeling right now?',
        options: ['Very low', 'Low', 'Good', 'Very good'],
        layout: 'radio',
      },
      {
        id: 'impact',
        label: 'How much are symptoms affecting your day?',
        options: [
          'Not at all',
          'A little',
          'Somewhat',
          'Quite a bit',
          'A lot',
          'Unsure',
        ],
        layout: 'grid',
      },
    ],
  ],
};
// Deterministic fictional fixtures, scoped to this adapter instance. No patient data.
export function createMockApi(
  scenario: DemoScenario = 'normal',
  latency = 450,
): EmaApi {
  let participant: Participant = {
    id: 'demo-alex',
    firstName: 'Alex',
    email: 'alex@example.com',
    reminders: true,
    checkInTimes: { ...defaultCheckInTimes },
  };
  const token = 'demo-session';
  let signedIn = false;
  const study: Study = {
    id: 'ema-demo-study',
    day: scenario === 'insights-ready' ? 7 : 3,
    totalDays: 7,
    checkIns:
      scenario === 'empty'
        ? []
        : [
            {
              id: 'day3-morning',
              period: 'morning',
              time: '8:00 AM',
              status: 'completed',
            },
            {
              id: 'day3-afternoon',
              period: 'afternoon',
              time: '1:00 PM',
              status: 'available',
            },
            {
              id: 'day3-evening',
              period: 'evening',
              time: '8:00 PM',
              status: 'upcoming',
            },
          ],
  };
  const receipts = new Map<string, { submission: string; receipt: Receipt }>();
  const wait = () =>
    new Promise<void>((resolve) => setTimeout(resolve, latency));
  function authorize(value: string) {
    if (!signedIn || value !== token)
      throw new AppError(
        'auth',
        'Your session has expired. Please sign in again.',
      );
  }
  const session = () => ({ token, participant: { ...participant } });
  return {
    async signIn(email, password) {
      await wait();
      const errors = validateLogin(email, password);
      if (errors.email || errors.password)
        throw new AppError('validation', 'Check your email and password.');
      if (password === 'wrongpass')
        throw new AppError('auth', 'Email or password is incorrect.');
      signedIn = true;
      participant = { ...participant, email: email.trim().toLowerCase() };
      return session();
    },
    async restoreSession(value) {
      await wait();
      if (value !== token) throw new AppError('auth', 'Please sign in again.');
      signedIn = true;
      return session();
    },
    async signOut(value) {
      await wait();
      authorize(value);
      signedIn = false;
    },
    async getStudy(value) {
      await wait();
      authorize(value);
      if (scenario === 'load-error')
        throw new AppError(
          'network',
          'Study data could not be loaded. Please try again.',
        );
      return { ...study, checkIns: study.checkIns.map((c) => ({ ...c })) };
    },
    async getQuestionnaire(value, id) {
      await wait();
      authorize(value);
      if (!study.checkIns.some((c) => c.id === id && c.status === 'available'))
        throw new AppError('conflict', 'This check-in is not available.');
      return demoQuestionnaire;
    },
    async submit(value, submission) {
      await wait();
      authorize(value);
      validateSubmission(demoQuestionnaire, submission.answers);
      if (submission.questionnaireVersion !== demoQuestionnaire.version)
        throw new AppError(
          'conflict',
          'The questionnaire changed. Please start again.',
        );
      const fingerprint = JSON.stringify(submission);
      const existing = receipts.get(submission.idempotencyKey);
      if (existing) {
        if (existing.submission !== fingerprint)
          throw new AppError(
            'conflict',
            'This submission key has already been used.',
          );
        return existing.receipt;
      }
      const checkIn = study.checkIns.find((c) => c.id === submission.checkInId);
      if (!checkIn || checkIn.status !== 'available')
        throw new AppError('conflict', 'This check-in is no longer available.');
      if (scenario === 'submit-error')
        throw new AppError(
          'network',
          'Your check-in could not be saved. Your answers are still here. Please try again.',
        );
      const receipt = {
        id: `receipt-${submission.idempotencyKey}`,
        completedAt: new Date().toISOString(),
      };
      checkIn.status = 'completed';
      receipts.set(submission.idempotencyKey, {
        submission: fingerprint,
        receipt,
      });
      return receipt;
    },
    async setCheckInTimes(value, times) {
      await wait();
      authorize(value);
      if (!validCheckInTimes(times))
        throw new AppError(
          'validation',
          'Choose different valid times in first, second, third order within a 24-hour cycle; times may cross midnight.',
        );
      participant = { ...participant, checkInTimes: { ...times } };
      for (const checkIn of study.checkIns) {
        if (checkIn.status !== 'completed')
          checkIn.time = displayCheckInTime(times[checkIn.period]);
      }
      return { ...participant, checkInTimes: { ...times } };
    },
    async setReminders(value, enabled) {
      await wait();
      authorize(value);
      participant = { ...participant, reminders: enabled };
      return { ...participant };
    },
    async getInsights(value) {
      await wait();
      authorize(value);
      return scenario === 'insights-ready'
        ? [
            { label: 'Completed demo check-ins', value: '19 of 21' },
            { label: 'Study duration', value: '7 days' },
          ]
        : [];
    },
  };
}
