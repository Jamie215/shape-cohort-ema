import { createHttpApi } from '../src/data/httpApi';
describe('HTTP adapter', () => {
  const fetchMock = jest.fn();
  const original = globalThis.fetch;
  beforeEach(() => {
    globalThis.fetch = fetchMock;
    fetchMock.mockReset();
  });
  afterAll(() => {
    globalThis.fetch = original;
  });
  test('rejects insecure configuration', () => {
    expect(() => createHttpApi('http://example.com')).toThrow('HTTPS');
  });
  test('encodes identifiers, sends bearer auth and rejects malformed responses', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ steps: [] }),
    });
    await expect(
      createHttpApi('https://api.example.com').getQuestionnaire(
        'token',
        'id/unsafe',
      ),
    ).rejects.toMatchObject({ code: 'configuration' });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/v1/check-ins/id%2Funsafe/questionnaire',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer token' }),
      }),
    );
  });
  test('maps unauthorized and network failures without leaking server content', async () => {
    const api = createHttpApi('https://api.example.com');
    fetchMock.mockResolvedValueOnce({ ok: false, status: 401 });
    await expect(api.getStudy('token')).rejects.toMatchObject({ code: 'auth' });
    fetchMock.mockRejectedValueOnce(new Error('private server detail'));
    await expect(api.getStudy('token')).rejects.toMatchObject({
      code: 'network',
      message: 'Unable to connect. Check your connection and try again.',
    });
  });
});
