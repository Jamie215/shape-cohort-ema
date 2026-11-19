import { Component, ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { AppProvider } from './src/application/AppProvider';
import { createMockApi, DemoScenario } from './src/data/mockApi';
import { createHttpApi } from './src/data/httpApi';
import { sessionStore } from './src/data/sessionStore';
import { AppNavigator } from './src/navigation/AppNavigator';
import {
  Button,
  Notice,
  ResourceState,
  Screen,
  Typography,
} from './src/design/components';
const demo = process.env.EXPO_PUBLIC_DATA_MODE !== 'http';
const scenario = process.env.EXPO_PUBLIC_DEMO_SCENARIO ?? 'normal';
const allowedScenarios: DemoScenario[] = [
  'normal',
  'empty',
  'load-error',
  'submit-error',
  'insights-ready',
];
function configureApi() {
  try {
    return {
      api: demo
        ? createMockApi(
            allowedScenarios.includes(scenario as DemoScenario)
              ? (scenario as DemoScenario)
              : 'normal',
          )
        : createHttpApi(process.env.EXPO_PUBLIC_API_BASE_URL ?? ''),
    };
  } catch {
    return {
      error:
        'The app is not configured. Set a valid HTTPS API base URL or use demo mode.',
    };
  }
}
const configuration = configureApi();
class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <Screen>
        <Typography variant="heading">Unable to display the app</Typography>
        <Notice message="Please reload the app. If this keeps happening, contact the study team." />
        <Button
          label="Try again"
          onPress={() => this.setState({ failed: false })}
        />
      </Screen>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular: require('./assets/fonts/Inter-Regular.ttf'),
    Inter_600SemiBold: require('./assets/fonts/Inter-SemiBold.ttf'),
    feather: require('./assets/fonts/Feather.ttf'),
    ionicons: require('./assets/fonts/Ionicons.ttf'),
  });
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <ErrorBoundary>
        {fontError ? (
          <Screen>
            <Notice message="App fonts could not be loaded. Please reload the app." />
          </Screen>
        ) : !fontsLoaded ? (
          <Screen>
            <ResourceState loading />
          </Screen>
        ) : configuration.api ? (
          <AppProvider api={configuration.api} store={sessionStore} demo={demo}>
            <AppNavigator />
          </AppProvider>
        ) : (
          <Screen>
            <Notice message={configuration.error ?? 'Invalid configuration.'} />
          </Screen>
        )}
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
