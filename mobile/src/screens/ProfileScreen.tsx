import { useState, useRef } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../navigation/types';
import { useApp } from '../application/AppProvider';
import { errorMessage } from '../domain/models';
import { Card, Notice, Screen, Typography, layout } from '../design/components';
import { tokens as t } from '../design/tokens';
import { ConfirmDialog } from '../design/ConfirmDialog';
import { CheckInTimePreferences } from '../design/CheckInTimePreferences';
export function ProfileScreen() {
  const { session, updateReminders, updateCheckInTimes, signOut, demo } =
    useApp();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const pending = useRef(false);
  async function action(run: () => Promise<void>) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError(undefined);
    setMessage(undefined);
    try {
      await run();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
      pending.current = false;
    }
  }
  return (
    <Screen style={layout.stack}>
      <View style={{ gap: t.space.sm }}>
        <Typography variant="title" accessibilityRole="header">
          Your Profile
        </Typography>
        <Typography>Manage your profile and preferences</Typography>
      </View>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Update your profile on the Empower Health Research website"
        onPress={() =>
          void action(async () => {
            await Linking.openURL('https://www.empowerhealthresearch.ca');
          })
        }
      >
        <Card style={{ gap: t.space.lg }}>
          <View style={layout.row}>
            <View style={s.avatar}>
              <Typography variant="heading" style={{ color: t.color.surface }}>
                {session?.participant.firstName.charAt(0)}
              </Typography>
            </View>
            <Typography style={{ flex: 1 }}>
              {session?.participant.email}
            </Typography>
          </View>
          <Typography variant="small">
            Update your profile by signing on to{'\n'}
            www.empowerhealthresearch.ca
          </Typography>
        </Card>
      </Pressable>
      <View style={s.preference}>
        <View style={s.icon}>
          <Feather
            name="bell"
            size={20}
            color={t.color.primary}
            accessible={false}
          />
        </View>
        <View style={[layout.grow, { gap: t.space.sm }]}>
          <Typography variant="question">Reminders</Typography>
          <Typography style={{ color: t.color.muted }}>
            Get reminders for each check-in
          </Typography>
        </View>
        <Switch
          {...(Platform.OS === 'web'
            ? { activeThumbColor: t.color.surface }
            : {})}
          hitSlop={{
            top: t.space.lg,
            bottom: t.space.lg,
            left: t.space.sm,
            right: t.space.sm,
          }}
          accessibilityLabel="Check-in reminders"
          accessibilityHint={
            demo
              ? 'Demo preference only; no notifications are sent'
              : 'Saves your reminder preference'
          }
          value={session?.participant.reminders ?? false}
          disabled={busy}
          trackColor={{ false: t.color.border, true: t.color.primary }}
          thumbColor={t.color.surface}
          onValueChange={(enabled) =>
            void action(async () => {
              await updateReminders(enabled);
              setMessage(
                demo
                  ? 'Demo preference saved. Notifications are not sent in this preview.'
                  : 'Reminder preference saved.',
              );
            })
          }
        />
      </View>
      <CheckInTimePreferences
        saved={session?.participant.checkInTimes}
        demo={demo}
        disabled={busy}
        onSave={async (times) => {
          pending.current = true;
          setBusy(true);
          setMessage(undefined);
          setError(undefined);
          try {
            await updateCheckInTimes(times);
          } finally {
            pending.current = false;
            setBusy(false);
          }
        }}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Your Insights, results are available after 7 days"
        onPress={() => navigation.navigate('Insights')}
        style={s.preference}
      >
        <View style={[s.icon, { backgroundColor: t.color.morning }]}>
          <Feather
            name="trending-up"
            size={20}
            color={t.color.morningInk}
            accessible={false}
          />
        </View>
        <View style={[layout.grow, { gap: t.space.sm }]}>
          <Typography variant="question">Your Insights</Typography>
          <Typography style={{ color: t.color.muted }}>
            Results are available after 7 days
          </Typography>
        </View>
        <Feather
          name="chevron-right"
          size={20}
          color={t.color.text}
          accessible={false}
        />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Log out"
        accessibilityState={{ disabled: busy }}
        disabled={busy}
        onPress={() => setConfirmLogout(true)}
        style={s.preference}
      >
        <View style={[s.icon, { backgroundColor: t.color.errorTint }]}>
          <Feather
            name="log-out"
            size={20}
            color={t.color.error}
            accessible={false}
          />
        </View>
        <View style={[layout.grow, { gap: t.space.sm }]}>
          <Typography variant="question" style={{ color: t.color.error }}>
            {busy ? 'Please wait…' : 'Log out'}
          </Typography>
          <Typography style={{ color: t.color.muted }}>
            Sign out of your account
          </Typography>
        </View>
      </Pressable>
      <ConfirmDialog
        visible={confirmLogout}
        title="Log out?"
        message="You will need to sign in again to access your study."
        cancelLabel="Stay signed in"
        confirmLabel="Log out"
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => {
          setConfirmLogout(false);
          void action(signOut);
        }}
      />
      {error && <Notice message={error} />}
      {message && <Notice message={message} kind="success" />}
    </Screen>
  );
}
const s = StyleSheet.create({
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: t.color.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: t.color.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preference: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space.lg,
    minHeight: t.size.touch,
    paddingVertical: t.space.md,
  },
});
