import { validCheckInTimes } from '../domain/checkInTimes';
import {
  AppError,
  Participant,
  Session,
  Study,
  Questionnaire,
  Receipt,
  Insight,
} from '../domain/models';
type Guard<T> = (value: unknown) => value is T;
function object(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
function text(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}
export const isParticipant: Guard<Participant> = (v): v is Participant =>
  object(v) &&
  text(v.id) &&
  text(v.firstName) &&
  text(v.email) &&
  typeof v.reminders === 'boolean' &&
  (v.checkInTimes === undefined || validCheckInTimes(v.checkInTimes));
export const isSession: Guard<Session> = (v): v is Session =>
  object(v) && text(v.token) && isParticipant(v.participant);
export const isStudy: Guard<Study> = (v): v is Study =>
  object(v) &&
  text(v.id) &&
  Number.isInteger(v.day) &&
  Number.isInteger(v.totalDays) &&
  Number(v.day) >= 1 &&
  Number(v.day) <= Number(v.totalDays) &&
  Array.isArray(v.checkIns) &&
  v.checkIns.every(
    (c) =>
      object(c) &&
      text(c.id) &&
      ['morning', 'afternoon', 'evening'].includes(String(c.period)) &&
      text(c.time) &&
      ['completed', 'available', 'upcoming'].includes(String(c.status)),
  ) &&
  new Set(v.checkIns.map((c) => c.id)).size === v.checkIns.length;
export const isQuestionnaire: Guard<Questionnaire> = (
  v,
): v is Questionnaire => {
  if (
    !object(v) ||
    !text(v.version) ||
    typeof v.demo !== 'boolean' ||
    !Array.isArray(v.steps) ||
    !v.steps.length
  )
    return false;
  const ids: string[] = [];
  const valid = v.steps.every(
    (step) =>
      Array.isArray(step) &&
      step.length > 0 &&
      step.every((q) => {
        if (
          !object(q) ||
          !text(q.id) ||
          !text(q.label) ||
          !['radio', 'grid'].includes(String(q.layout)) ||
          !Array.isArray(q.options) ||
          q.options.length < 2 ||
          !q.options.every(text) ||
          new Set(q.options).size !== q.options.length
        )
          return false;
        ids.push(q.id);
        return true;
      }),
  );
  return valid && new Set(ids).size === ids.length;
};
export const isReceipt: Guard<Receipt> = (v): v is Receipt =>
  object(v) &&
  text(v.id) &&
  text(v.completedAt) &&
  Number.isFinite(Date.parse(v.completedAt));
export const isInsights: Guard<Insight[]> = (v): v is Insight[] =>
  Array.isArray(v) &&
  v.every((i) => object(i) && text(i.label) && text(i.value));
export function decode<T>(value: unknown, guard: Guard<T>): T {
  if (!guard(value))
    throw new AppError(
      'configuration',
      'The server returned data the app cannot display. Please contact the study team.',
    );
  return value;
}
