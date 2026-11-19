import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationAction, usePreventRemove } from '@react-navigation/native';
import * as Crypto from 'expo-crypto';
import { RootStackParams } from '../navigation/types';
import { useApp, useResource } from '../application/AppProvider';
import { Answers, AppError, Receipt, errorMessage } from '../domain/models';
import { stepComplete, validateSubmission } from '../domain/validation';
import {
  Button,
  Choice,
  IconButton,
  Notice,
  Progress,
  ResourceState,
  Screen,
  Typography,
  layout,
} from '../design/components';
import { ConfirmDialog } from '../design/ConfirmDialog';
import { periodLabel } from '../design/CheckInRow';
import { tokens as t } from '../design/tokens';
export function QuestionnaireScreen({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParams, 'Questionnaire'>) {
  const { api, session, expire } = useApp();
  const token = session?.token ?? '';
  const { checkIn } = route.params;
  const load = useCallback(
    () => api.getQuestionnaire(token, checkIn.id),
    [api, token, checkIn.id],
  );
  const { state, reload } = useResource(load);
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [receipt, setReceipt] = useState<Receipt>();
  const [leaveAction, setLeaveAction] = useState<NavigationAction>();
  const [discard, setDiscard] = useState(false);
  const pending = useRef(false);
  const retry = useRef<{ fingerprint: string; key: string } | undefined>(
    undefined,
  );
  const { fontScale, width } = useWindowDimensions();
  usePreventRemove(
    !receipt && !discard && Object.keys(answers).length > 0,
    ({ data }) => {
      if (pending.current) {
        AccessibilityInfo.announceForAccessibility(
          'Please wait until your check-in finishes saving.',
        );
        return;
      }
      setLeaveAction(data.action);
    },
  );
  useEffect(() => {
    if (receipt) navigation.replace('Confirmation', { checkIn, receipt });
  }, [receipt, navigation, checkIn]);
  useEffect(() => {
    if (discard && leaveAction) navigation.dispatch(leaveAction);
  }, [discard, leaveAction, navigation]);
  const questions =
    state.status === 'ready' ? (state.data.steps[step] ?? []) : [];
  const complete = stepComplete(questions, answers);
  const finalStep =
    state.status === 'ready' && step === state.data.steps.length - 1;
  function select(id: string, answer: string) {
    setAnswers((old) => ({ ...old, [id]: answer }));
    setError(undefined);
  }
  function back() {
    if (pending.current) return;
    if (step > 0) {
      setStep((n) => n - 1);
      setError(undefined);
    } else navigation.goBack();
  }
  async function next() {
    if (state.status !== 'ready' || !complete || pending.current) return;
    if (!finalStep) {
      setStep((n) => n + 1);
      AccessibilityInfo.announceForAccessibility(
        `Step ${step + 2} of ${state.data.steps.length}`,
      );
      return;
    }
    pending.current = true;
    setBusy(true);
    setError(undefined);
    try {
      validateSubmission(state.data, answers);
      const fingerprint = JSON.stringify(answers);
      if (retry.current?.fingerprint !== fingerprint)
        retry.current = { fingerprint, key: Crypto.randomUUID() };
      const result = await api.submit(session!.token, {
        checkInId: checkIn.id,
        questionnaireVersion: state.data.version,
        answers,
        idempotencyKey: retry.current.key,
      });
      setReceipt(result);
    } catch (e) {
      if (e instanceof AppError && e.code === 'auth') expire();
      else setError(errorMessage(e));
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      <Screen
        style={layout.stack}
        footer={
          state.status === 'ready' ? (
            <View style={s.actions}>
              <Button
                label="Back"
                variant="secondary"
                onPress={back}
                disabled={busy}
                style={{ flex: 0.75 }}
              />
              <Button
                label={finalStep ? 'Submit check-in' : 'Continue'}
                onPress={() => void next()}
                disabled={!complete}
                busy={busy}
                style={{ flex: 1 }}
              />
            </View>
          ) : undefined
        }
      >
        <View style={s.header}>
          <IconButton
            name="arrow-left"
            label="Back"
            onPress={back}
            disabled={busy}
          />
          <Typography
            variant="title"
            accessibilityRole="header"
            style={{ flex: 1, textAlign: 'center' }}
          >
            {periodLabel[checkIn.period]} Check-in
          </Typography>
          <View style={{ width: t.size.touch }} />
        </View>
        {state.status !== 'ready' ? (
          <ResourceState
            loading={state.status === 'loading'}
            message={state.status === 'error' ? state.message : undefined}
            retry={reload}
          />
        ) : (
          <>
            <View style={{ gap: t.space.sm }}>
              <Typography variant="small">
                Step {step + 1} of {state.data.steps.length}
              </Typography>
              <Progress
                value={(step + 1) / state.data.steps.length}
                label={`Step ${step + 1} of ${state.data.steps.length}`}
              />
            </View>
            {state.data.demo && (
              <Typography variant="small" style={{ color: t.color.muted }}>
                Demo questions • for preview only
              </Typography>
            )}
            {questions.map((q) => (
              <View key={q.id} style={layout.section}>
                <Typography variant="question" accessibilityRole="header">
                  {q.label}
                </Typography>
                <View
                  accessibilityRole="radiogroup"
                  accessibilityLabel={q.label}
                >
                  {q.layout === 'grid'
                    ? Array.from(
                        {
                          length: Math.ceil(
                            q.options.length /
                              (fontScale > 1.3 || width < 360 ? 2 : 3),
                          ),
                        },
                        (_, row) => {
                          const columns =
                            fontScale > 1.3 || width < 360 ? 2 : 3;
                          return (
                            <View key={row} style={s.grid}>
                              {q.options
                                .slice(row * columns, (row + 1) * columns)
                                .map((option) => (
                                  <Choice
                                    key={option}
                                    label={option}
                                    selected={answers[q.id] === option}
                                    disabled={busy}
                                    onPress={() => {
                                      if (!pending.current)
                                        select(q.id, option);
                                    }}
                                    grid
                                  />
                                ))}
                            </View>
                          );
                        },
                      )
                    : q.options.map((option) => (
                        <Choice
                          key={option}
                          label={option}
                          selected={answers[q.id] === option}
                          disabled={busy}
                          onPress={() => {
                            if (!pending.current) select(q.id, option);
                          }}
                        />
                      ))}
                </View>
              </View>
            ))}
            {!complete && (
              <Typography variant="small" style={{ color: t.color.muted }}>
                Choose an answer for each question to continue.
              </Typography>
            )}
            {error && <Notice message={error} />}
          </>
        )}
      </Screen>
      <ConfirmDialog
        visible={!!leaveAction && !discard}
        onCancel={() => setLeaveAction(undefined)}
        onConfirm={() => setDiscard(true)}
      />
    </>
  );
}
const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: -t.space.md,
  },
  actions: { flexDirection: 'row', gap: t.space.sm },
  grid: { flexDirection: 'row', gap: t.space.sm, marginBottom: t.space.sm },
});
