import { useCallback } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams } from '../navigation/types';
import { useApp, useResource } from '../application/AppProvider';
import {
  Button,
  ResourceState,
  Screen,
  Typography,
  layout,
} from '../design/components';
import { CheckInRow, periodLabel } from '../design/CheckInRow';
import { tokens as t } from '../design/tokens';
export function ConfirmationScreen({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParams, 'Confirmation'>) {
  const { api, session, demo } = useApp();
  const token = session?.token ?? '';
  const load = useCallback(() => api.getStudy(token), [api, token]);
  const { state, reload } = useResource(load);
  const next =
    state.status === 'ready'
      ? state.data.checkIns.find(
          (c) => c.status === 'upcoming' || c.status === 'available',
        )
      : undefined;
  return (
    <Screen
      style={layout.stack}
      footer={
        <Button label="Back to Home" onPress={() => navigation.popTo('Main')} />
      }
    >
      <Typography
        variant="title"
        accessibilityRole="header"
        accessibilityLiveRegion="polite"
        style={layout.centered}
      >
        Check-in complete!
      </Typography>
      <Image
        source={require('../../assets/art-3.png')}
        style={s.art}
        resizeMode="contain"
        accessible={false}
      />
      <Typography style={layout.centered}>
        Thank you, {session?.participant.firstName}! Your{' '}
        {periodLabel[route.params.checkIn.period].toLowerCase()} check-in is
        complete.
      </Typography>
      <View style={[layout.section, { marginTop: t.space.xl }]}>
        <Typography variant="title" accessibilityRole="header">
          What’s next?
        </Typography>
        {state.status !== 'ready' ? (
          <ResourceState
            loading={state.status === 'loading'}
            message={state.status === 'error' ? state.message : undefined}
            retry={reload}
          />
        ) : next ? (
          <>
            <Typography>
              {demo
                ? 'Your next scheduled check-in'
                : session?.participant.reminders
                  ? 'Your reminder preference is on'
                  : 'Your reminders are off'}
            </Typography>
            <CheckInRow checkIn={next} showStatus={false} />
          </>
        ) : (
          <Typography>
            You’re all done for today. Thank you for checking in.
          </Typography>
        )}
        {demo && (
          <Typography variant="small" style={{ color: t.color.muted }}>
            Saved in this demo session. No notifications are sent.
          </Typography>
        )}
      </View>
    </Screen>
  );
}
const s = StyleSheet.create({
  art: { width: 200, height: 200, alignSelf: 'center' },
});
