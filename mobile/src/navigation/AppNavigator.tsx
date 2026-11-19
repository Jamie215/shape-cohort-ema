import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useApp } from '../application/AppProvider';
import { RootStackParams, TabParams } from './types';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { QuestionnaireScreen } from '../screens/QuestionnaireScreen';
import { ConfirmationScreen } from '../screens/ConfirmationScreen';
import { GuideScreen } from '../screens/GuideScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
import { ResourceState, Screen } from '../design/components';
import { tokens as t } from '../design/tokens';
import { BottomNavigation } from '../design/BottomNavigation';
const Stack = createNativeStackNavigator<RootStackParams>();
const Tabs = createBottomTabNavigator<TabParams>();
function MainTabs() {
  return (
    <Tabs.Navigator
      tabBar={(props) => <BottomNavigation {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}
export function AppNavigator() {
  const { session, restoring, sessionMessage } = useApp();
  if (restoring)
    return (
      <Screen>
        <ResourceState loading />
      </Screen>
    );
  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: t.color.primary,
          background: t.color.surface,
          card: t.color.surface,
          text: t.color.text,
          border: t.color.border,
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <Stack.Group navigationKey="authenticated">
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="Questionnaire"
              component={QuestionnaireScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen
              name="Confirmation"
              component={ConfirmationScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="Guide" component={GuideScreen} />
            <Stack.Screen name="Insights" component={InsightsScreen} />
          </Stack.Group>
        ) : (
          <Stack.Group navigationKey="anonymous">
            {!sessionMessage && (
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
            )}
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
