import { createMockApi, demoQuestionnaire } from '../src/data/mockApi';
import { Submission } from '../src/domain/models';
const answers = Object.fromEntries(
  demoQuestionnaire.steps.flat().map((q) => [q.id, q.options[0]!]),
);
const submission: Submission = {
  checkInId: 'day3-afternoon',
  questionnaireVersion: 'demo-v1',
  answers,
  idempotencyKey: 'attempt-1',
};
describe('study workflow', () => {
  test('protects unauthenticated data and rejects incorrect demo credentials', async () => {
    const api = createMockApi('normal', 0);
    await expect(api.getStudy('unknown')).rejects.toMatchObject({
      code: 'auth',
    });
    await expect(
      api.signIn('alex@example.com', 'wrongpass'),
    ).rejects.toMatchObject({ code: 'auth' });
  });
  test('saves once, returns identical receipt on retry, prevents editing a completed check-in', async () => {
    const api = createMockApi('normal', 0);
    const { token } = await api.signIn('Alex@example.com', 'password1');
    const receipt = await api.submit(token, submission);
    expect(await api.submit(token, submission)).toEqual(receipt);
    expect(
      (await api.getStudy(token)).checkIns.find(
        (c) => c.id === submission.checkInId,
      )?.status,
    ).toBe('completed');
    await expect(
      api.getQuestionnaire(token, submission.checkInId),
    ).rejects.toMatchObject({ code: 'conflict' });
    await expect(
      api.submit(token, { ...submission, idempotencyKey: 'another-key' }),
    ).rejects.toMatchObject({ code: 'conflict' });
    await expect(
      api.submit(token, {
        ...submission,
        answers: { ...answers, pain: 'Mild pain' },
      }),
    ).rejects.toMatchObject({ code: 'conflict' });
  });
  test('failed submissions do not mark check-ins complete', async () => {
    const api = createMockApi('submit-error', 0);
    const { token } = await api.signIn('alex@example.com', 'password1');
    await expect(api.submit(token, submission)).rejects.toMatchObject({
      code: 'network',
    });
    expect(
      (await api.getStudy(token)).checkIns.find(
        (c) => c.id === submission.checkInId,
      )?.status,
    ).toBe('available');
  });
  test('rejects incomplete answers and wrong questionnaire versions', async () => {
    const api = createMockApi('normal', 0);
    const { token } = await api.signIn('alex@example.com', 'password1');
    await expect(
      api.submit(token, { ...submission, answers: {} }),
    ).rejects.toMatchObject({ code: 'validation' });
    await expect(
      api.submit(token, { ...submission, questionnaireVersion: 'old' }),
    ).rejects.toMatchObject({ code: 'conflict' });
  });
  test('updates reminders and invalidates authorization after logout', async () => {
    const api = createMockApi('normal', 0);
    const { token } = await api.signIn('alex@example.com', 'password1');
    expect((await api.setReminders(token, false)).reminders).toBe(false);
    await api.signOut(token);
    await expect(api.getStudy(token)).rejects.toMatchObject({ code: 'auth' });
  });
});
