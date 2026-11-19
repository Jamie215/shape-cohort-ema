import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../navigation/types';
import { useApp, useResource } from '../application/AppProvider';
import {
  Card,
  Progress,
  ResourceState,
  Screen,
  Typography,
  layout,
} from '../design/components';
import { StudyVideo } from '../design/StudyVideo';
import { CheckInRow } from '../design/CheckInRow';
import { tokens as t } from '../design/tokens';
export function HomeScreen() {
  const { api, session, demo } = useApp();
  const token = session?.token ?? '';
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const load = useCallback(() => api.getStudy(token), [api, token]);
  const { state, reload } = useResource(load);
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );
  return (
    <Screen style={layout.stack}>
      <Typography variant="title" accessibilityRole="header">
        Hello, {session?.participant.firstName}
      </Typography>
      {state.status !== 'ready' ? (
        <ResourceState
          loading={state.status === 'loading'}
          message={state.status === 'error' ? state.message : undefined}
          retry={reload}
        />
      ) : (
        <>
          <Card style={s.studyCard}>
            <Feather
              name="calendar"
              size={32}
              color={t.color.primary}
              accessible={false}
            />
            <View style={[layout.grow, { gap: t.space.xs }]}>
              <Typography variant="question">
                Day {state.data.day} of {state.data.totalDays}
              </Typography>
              <Typography variant="small">
                {state.data.checkIns.length} check-ins today
                {demo ? ' • Demo' : ''}
              </Typography>
              <Progress
                value={state.data.day / state.data.totalDays}
                label={`Study day ${state.data.day} of ${state.data.totalDays}`}
              />
            </View>
          </Card>
          <View style={layout.section}>
            <Typography variant="title" accessibilityRole="header">
              Today’s check-ins
            </Typography>
            <Typography>
              Help us understand how your pain and symptoms change throughout
              the day
            </Typography>
            {state.data.checkIns.length ? (
              <View>
                {state.data.checkIns.map((c) => (
                  <CheckInRow
                    key={c.id}
                    checkIn={c}
                    onStart={() =>
                      navigation.navigate('Questionnaire', { checkIn: c })
                    }
                  />
                ))}
              </View>
            ) : (
              <Card>
                <Typography>No check-ins scheduled today.</Typography>
                <Typography variant="small" style={{ color: t.color.muted }}>
                  Your next check-in will appear here when available.
                </Typography>
              </Card>
            )}
          </View>
          <View style={layout.section}>
            <Typography variant="title" accessibilityRole="header">
              About the EMA Study
            </Typography>
            <StudyVideo />
          </View>
        </>
      )}
    </Screen>
  );
}
const s = StyleSheet.create({
  studyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space.xl,
    backgroundColor: t.color.page,
    minHeight: 108,
  },
});
