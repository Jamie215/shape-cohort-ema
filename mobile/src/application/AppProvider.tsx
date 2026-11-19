import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import { EmaApi, SessionStore } from '../data/contracts';
import {
  AppError,
  Session,
  CheckInTimes,
  errorMessage,
} from '../domain/models';
interface AppContextValue {
  api: EmaApi;
  session: Session | null;
  restoring: boolean;
  sessionMessage: string | null;
  demo: boolean;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  updateReminders(enabled: boolean): Promise<void>;
  updateCheckInTimes(times: CheckInTimes): Promise<void>;
  expire(): void;
}
const AppContext = createContext<AppContextValue | null>(null);
export function AppProvider({
  api,
  store,
  demo,
  children,
}: {
  api: EmaApi;
  store: SessionStore;
  demo: boolean;
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);
  const generation = useRef(0);
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const token = await store.read();
        if (token) {
          const restored = await api.restoreSession(token);
          if (active) setSession(restored);
        }
      } catch {
        try {
          await store.clear();
        } catch {
          /* No credentials are surfaced in diagnostics. */
        }
        if (active)
          setSessionMessage(
            'Please sign in again. Your previous session could not be restored.',
          );
      } finally {
        if (active) setRestoring(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [api, store]);
  const expire = useCallback(() => {
    generation.current++;
    setSession(null);
    setSessionMessage('Your session has expired. Please sign in again.');
    void store
      .clear()
      .catch(() =>
        setSessionMessage(
          'Your session has expired. Local session storage could not be cleared.',
        ),
      );
  }, [store]);
  async function signIn(email: string, password: string) {
    const result = await api.signIn(email.trim().toLowerCase(), password);
    try {
      await store.write(result.token);
    } catch {
      await api.signOut(result.token).catch(() => {});
      throw new AppError(
        'configuration',
        'Unable to save your session securely. Please try again.',
      );
    }
    generation.current++;
    setSession(result);
    setSessionMessage(null);
  }
  async function signOut() {
    if (!session) return;
    await store.clear(); // If secure deletion fails, allow explicit retry before claiming logout.
    generation.current++;
    setSession(null);
    setSessionMessage(null);
    try {
      await api.signOut(session.token);
    } catch {
      setSessionMessage(
        'Signed out on this device. The server session could not be revoked.',
      );
    }
  }
  async function updateReminders(enabled: boolean) {
    if (!session) return;
    const current = generation.current;
    try {
      const participant = await api.setReminders(session.token, enabled);
      if (current === generation.current)
        setSession((old) => (old ? { ...old, participant } : old));
    } catch (error) {
      if (error instanceof AppError && error.code === 'auth') expire();
      throw error;
    }
  }
  async function updateCheckInTimes(times: CheckInTimes) {
    if (!session) return;
    const current = generation.current;
    try {
      const participant = await api.setCheckInTimes(session.token, times);
      if (current === generation.current)
        setSession((old) => (old ? { ...old, participant } : old));
    } catch (error) {
      if (error instanceof AppError && error.code === 'auth') expire();
      throw error;
    }
  }
  return (
    <AppContext.Provider
      value={{
        api,
        session,
        restoring,
        sessionMessage,
        demo,
        signIn,
        signOut,
        updateReminders,
        updateCheckInTimes,
        expire,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('AppProvider is required');
  return context;
}
export function useResource<T>(load: () => Promise<T>) {
  const [result, setResult] = useState<{
    load: () => Promise<T>;
    revision: number;
    state: import('../domain/models').Loadable<T>;
  }>();
  const [revision, setRevision] = useState(0);
  const { expire } = useApp();
  useEffect(() => {
    let active = true;
    void load()
      .then((data) => {
        if (active)
          setResult({ load, revision, state: { status: 'ready', data } });
      })
      .catch((error) => {
        if (!active) return;
        if (error instanceof AppError && error.code === 'auth') expire();
        else
          setResult({
            load,
            revision,
            state: { status: 'error', message: errorMessage(error) },
          });
      });
    return () => {
      active = false;
    };
  }, [load, revision, expire]);
  const state: import('../domain/models').Loadable<T> =
    result?.load === load && result.revision === revision
      ? result.state
      : { status: 'loading' };
  return { state, reload: useCallback(() => setRevision((r) => r + 1), []) };
}
