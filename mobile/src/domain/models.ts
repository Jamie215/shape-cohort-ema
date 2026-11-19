export type Period = 'morning' | 'afternoon' | 'evening';
export type CheckInTimes = Record<Period, string>;
export type CheckInStatus = 'completed' | 'available' | 'upcoming';
export interface Participant {
  id: string;
  firstName: string;
  email: string;
  reminders: boolean;
  checkInTimes?: CheckInTimes;
}
export interface Session {
  token: string;
  participant: Participant;
}
export interface CheckIn {
  id: string;
  period: Period;
  time: string;
  status: CheckInStatus;
}
export interface Study {
  id: string;
  day: number;
  totalDays: number;
  checkIns: CheckIn[];
}
export interface Question {
  id: string;
  label: string;
  options: string[];
  layout: 'radio' | 'grid';
}
export interface Questionnaire {
  version: string;
  demo: boolean;
  steps: Question[][];
}
export type Answers = Record<string, string>;
export interface Submission {
  checkInId: string;
  questionnaireVersion: string;
  answers: Answers;
  idempotencyKey: string;
}
export interface Receipt {
  id: string;
  completedAt: string;
}
export interface Insight {
  label: string;
  value: string;
}
export type Loadable<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: T };
export class AppError extends Error {
  constructor(
    public code:
      'auth' | 'network' | 'validation' | 'conflict' | 'configuration',
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
export function errorMessage(error: unknown): string {
  return error instanceof AppError
    ? error.message
    : 'Something went wrong. Please try again.';
}
