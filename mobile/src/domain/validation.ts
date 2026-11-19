import { Answers, AppError, Questionnaire, Question } from './models';
export function validateLogin(email: string, password: string) {
  return {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ? undefined
      : 'Enter a valid email address.',
    password: password.length >= 8 ? undefined : 'Enter at least 8 characters.',
  };
}
export function stepComplete(questions: Question[], answers: Answers): boolean {
  return (
    questions.length > 0 &&
    questions.every((q) => q.options.includes(answers[q.id] ?? ''))
  );
}
export function validateSubmission(
  questionnaire: Questionnaire,
  answers: Answers,
): void {
  if (
    !questionnaire.steps.length ||
    !questionnaire.steps.every((s) => stepComplete(s, answers))
  ) {
    throw new AppError(
      'validation',
      'Answer every question before submitting.',
    );
  }
}
