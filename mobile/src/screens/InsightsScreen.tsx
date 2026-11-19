import { useCallback } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams } from '../navigation/types';
import { useApp, useResource } from '../application/AppProvider';
import {
  Button,
  Card,
  ResourceState,
  Screen,
  Typography,
  layout,
} from '../design/components';
export function InsightsScreen({
  navigation,
}: NativeStackScreenProps<RootStackParams, 'Insights'>) {
  const { api, session, demo } = useApp();
  const token = session?.token ?? '';
  const load = useCallback(() => api.getInsights(token), [api, token]);
  const { state, reload } = useResource(load);
  return (
    <Screen
      style={layout.stack}
      footer={
        <Button label="Back to Profile" onPress={() => navigation.goBack()} />
      }
    >
      <Typography variant="heading" accessibilityRole="header">
        Your Insights
      </Typography>
      {state.status !== 'ready' ? (
        <ResourceState
          loading={state.status === 'loading'}
          message={state.status === 'error' ? state.message : undefined}
          retry={reload}
        />
      ) : state.data.length ? (
        state.data.map((insight) => (
          <Card key={insight.label}>
            <Typography variant="title">{insight.value}</Typography>
            <Typography>{insight.label}</Typography>
          </Card>
        ))
      ) : (
        <Card>
          <Typography variant="title">
            Your insights are on their way
          </Typography>
          <Typography>
            Results are available after 7 days. Keep sharing your daily
            experiences to help build a picture of your week.
          </Typography>
        </Card>
      )}
      {demo && (
        <Typography variant="small">
          Demo study data • no clinical results
        </Typography>
      )}
    </Screen>
  );
}
