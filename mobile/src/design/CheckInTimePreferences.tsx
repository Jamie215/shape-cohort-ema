import { periodLabel } from './CheckInRow';
import { TimeField } from './TimeField';
import { useRef, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { CheckInTimes, errorMessage } from '../domain/models';
import { defaultCheckInTimes, validCheckInTimes } from '../domain/checkInTimes';
import { Button, Card, Notice, Typography, layout } from './components';
import { tokens as t } from './tokens';

export function CheckInTimePreferences({
  saved,
  onSave,
  demo,
  disabled = false,
}: {
  saved?: CheckInTimes;
  onSave: (times: CheckInTimes) => Promise<void>;
  demo: boolean;
  disabled?: boolean;
}) {
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 360 || fontScale > 1.3;
  const current = saved ?? defaultCheckInTimes;
  const [draft, setDraft] = useState<CheckInTimes>({ ...current });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);
  const pending = useRef(false);
  const changed = (Object.keys(current) as (keyof CheckInTimes)[]).some(
    (key) => draft[key] !== current[key],
  );
  async function save() {
    if (pending.current) return;
    setSuccess(false);
    if (!validCheckInTimes(draft)) {
      setError(
        'Choose three different valid times in first, second, third order within a 24-hour cycle. Times may cross midnight.',
      );
      return;
    }
    pending.current = true;
    setBusy(true);
    setError(undefined);
    try {
      await onSave({ ...draft });
      setSuccess(true);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <Card style={{ gap: t.space.lg }}>
      <Typography variant="question" accessibilityRole="header">
        Check-in times
      </Typography>
      <Typography variant="small" style={{ color: t.color.muted }}>
        Choose times that fit your routine.
      </Typography>
      {(['morning', 'afternoon', 'evening'] as const).map((period) => (
        <View
          key={period}
          style={{
            flexDirection: stacked ? 'column' : 'row',
            alignItems: stacked ? 'stretch' : 'center',
            justifyContent: 'space-between',
            gap: t.space.sm,
          }}
        >
          <Typography variant="question">
            {periodLabel[period]} check-in
          </Typography>
          <TimeField
            label={`${periodLabel[period]} check-in time`}
            value={draft[period]}
            disabled={busy || disabled}
            onChange={(text) => {
              setDraft((old) => ({ ...old, [period]: text }));
              setError(undefined);
              setSuccess(false);
            }}
          />
        </View>
      ))}
      <Typography variant="small" style={{ color: t.color.muted }}>
        Local time · Times can cross midnight. Completed check-ins stay
        unchanged.
      </Typography>
      <View style={layout.row}>
        <Button
          label="Cancel"
          variant="secondary"
          disabled={!changed || busy || disabled}
          style={layout.grow}
          onPress={() => {
            setDraft({ ...current });
            setError(undefined);
            setSuccess(false);
          }}
        />
        <Button
          label="Save times"
          disabled={!changed || disabled}
          busy={busy}
          style={layout.grow}
          onPress={() => void save()}
        />
      </View>
      {error && <Notice message={error} />}
      {success && (
        <Notice
          kind="success"
          message={
            demo
              ? 'Check-in times saved for this demo session. No notifications are sent.'
              : 'Check-in time preferences saved.'
          }
        />
      )}
    </Card>
  );
}
