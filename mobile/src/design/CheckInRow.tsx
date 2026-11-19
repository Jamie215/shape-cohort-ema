import { Pressable, StyleSheet, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { CheckIn, Period } from '../domain/models';
import { Typography } from './components';
import { tokens as t } from './tokens';
export const periodLabel: Record<Period, string> = {
  morning: 'First',
  afternoon: 'Second',
  evening: 'Third',
};
export function PeriodIcon({ period }: { period: Period }) {
  return (
    <View style={[s.icon, { backgroundColor: t.color.evening }]}>
      <Typography variant="button" style={{ color: t.color.primary }}>
        {{ morning: '1', afternoon: '2', evening: '3' }[period]}
      </Typography>
    </View>
  );
}
export function CheckInRow({
  checkIn,
  onStart,
  showStatus = true,
}: {
  checkIn: CheckIn;
  onStart?: () => void;
  showStatus?: boolean;
}) {
  const actionable = checkIn.status === 'available' && !!onStart;
  return (
    <Pressable
      onPress={onStart}
      disabled={!actionable}
      accessibilityRole={actionable ? 'button' : undefined}
      accessible
      accessibilityLabel={`${periodLabel[checkIn.period]} check-in, ${checkIn.time}${showStatus ? `, ${checkIn.status === 'available' ? 'Start' : checkIn.status}` : ''}`}
      accessibilityHint={
        actionable ? 'Opens the check-in questionnaire' : undefined
      }
      style={({ pressed }) => [
        s.row,
        pressed && { backgroundColor: t.color.page },
      ]}
    >
      <PeriodIcon period={checkIn.period} />
      <View style={s.details}>
        <Typography>{periodLabel[checkIn.period]} check-in</Typography>
        <Typography style={{ color: t.color.muted }}>{checkIn.time}</Typography>
      </View>
      {showStatus &&
        (checkIn.status === 'completed' ? (
          <View style={s.status}>
            <Feather
              name="check-circle"
              size={16}
              color={t.color.success}
              accessible={false}
            />
            <Typography variant="button" style={{ color: t.color.success }}>
              Completed
            </Typography>
          </View>
        ) : (
          <View style={[s.badge, actionable && s.start]}>
            <Typography
              variant="button"
              style={{ color: actionable ? t.color.surface : t.color.primary }}
            >
              {checkIn.status === 'available' ? 'Start' : 'Upcoming'}
            </Typography>
            {actionable && (
              <Feather
                name="chevron-right"
                size={16}
                color={t.color.surface}
                accessible={false}
              />
            )}
          </View>
        ))}
    </Pressable>
  );
}
const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    padding: t.space.md,
    gap: t.space.md,
    borderWidth: 1,
    borderColor: t.color.border,
    borderRadius: t.radius.card,
    flexWrap: 'wrap',
  },
  details: { flexGrow: 1, flexBasis: 96 },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  status: { flexDirection: 'row', alignItems: 'center', gap: t.space.xs },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space.sm,
    paddingVertical: t.space.xs,
    paddingHorizontal: t.space.lg,
    borderRadius: t.radius.control,
  },
  start: {
    backgroundColor: t.color.primary,
    minHeight: t.size.touch,
    borderWidth: 1,
    borderColor: t.color.primary,
  },
});
