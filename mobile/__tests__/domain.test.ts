import {
  validateLogin,
  stepComplete,
  validateSubmission,
} from '../src/domain/validation';
import { demoQuestionnaire } from '../src/data/mockApi';
import { decode, isQuestionnaire, isStudy } from '../src/data/decoders';
describe('validation boundaries', () => {
  test('rejects malformed email and missing password, permits trimmed email', () => {
    expect(validateLogin('bad', 'short')).toEqual({
      email: expect.any(String),
      password: expect.any(String),
    });
    expect(validateLogin(' alex@example.com ', 'password1')).toEqual({
      email: undefined,
      password: undefined,
    });
  });
  test('requires a valid choice for every question', () => {
    expect(
      stepComplete(demoQuestionnaire.steps[0]!, { pain: 'Mild pain' }),
    ).toBe(false);
    expect(
      stepComplete(demoQuestionnaire.steps[0]!, {
        pain: 'Mild pain',
        location: 'Hands',
      }),
    ).toBe(true);
    expect(() =>
      validateSubmission(demoQuestionnaire, { pain: 'invented answer' }),
    ).toThrow();
  });
  test('rejects empty, malformed and duplicated questionnaires before rendering', () => {
    expect(isQuestionnaire(demoQuestionnaire)).toBe(true);
    expect(isQuestionnaire({ ...demoQuestionnaire, steps: [] })).toBe(false);
    expect(
      isQuestionnaire({
        ...demoQuestionnaire,
        steps: [demoQuestionnaire.steps[0], demoQuestionnaire.steps[0]],
      }),
    ).toBe(false);
    expect(() => decode({ day: -1 }, isStudy)).toThrow('server returned data');
  });
});
