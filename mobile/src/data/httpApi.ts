import { EmaApi } from './contracts';
import { AppError } from '../domain/models';
import {
  decode,
  isParticipant,
  isSession,
  isStudy,
  isQuestionnaire,
  isReceipt,
  isInsights,
} from './decoders';
// Proposed endpoint contract: validate responses before presentation consumes them.
export function createHttpApi(baseUrl: string): EmaApi {
  if (!/^https:\/\//.test(baseUrl))
    throw new AppError('configuration', 'API base URL must use HTTPS.');
  async function request(
    path: string,
    token?: string,
    body?: unknown,
    method = body === undefined ? 'GET' : 'POST',
  ): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
        method,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      if (!response.ok)
        throw new AppError(
          response.status === 401
            ? 'auth'
            : response.status === 409
              ? 'conflict'
              : 'network',
          response.status === 401
            ? 'Your session has expired. Please sign in again.'
            : 'The request could not be completed. Please try again.',
        );
      if (response.status === 204) return undefined;
      return await response.json();
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        'network',
        'Unable to connect. Check your connection and try again.',
      );
    } finally {
      clearTimeout(timeout);
    }
  }
  return {
    signIn: async (email, password) =>
      decode(
        await request('/v1/sessions', undefined, { email, password }),
        isSession,
      ),
    restoreSession: async (token) =>
      decode(await request('/v1/session', token), isSession),
    signOut: async (token) => {
      await request('/v1/session', token, undefined, 'DELETE');
    },
    getStudy: async (token) =>
      decode(await request('/v1/study', token), isStudy),
    getQuestionnaire: async (token, id) =>
      decode(
        await request(
          `/v1/check-ins/${encodeURIComponent(id)}/questionnaire`,
          token,
        ),
        isQuestionnaire,
      ),
    submit: async (token, submission) =>
      decode(
        await request(
          `/v1/check-ins/${encodeURIComponent(submission.checkInId)}/submissions`,
          token,
          submission,
        ),
        isReceipt,
      ),
    setReminders: async (token, enabled) =>
      decode(
        await request(
          '/v1/participant/preferences',
          token,
          { reminders: enabled },
          'PATCH',
        ),
        isParticipant,
      ),
    setCheckInTimes: async (token, times) =>
      decode(
        await request(
          '/v1/participant/preferences',
          token,
          { checkInTimes: times },
          'PATCH',
        ),
        isParticipant,
      ),
    getInsights: async (token) =>
      decode(await request('/v1/insights', token), isInsights),
  };
}
