import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams } from '../navigation/types';
import {
  Button,
  Screen,
  Typography,
  ResponsiveImage,
} from '../design/components';
import { tokens as t } from '../design/tokens';
export function WelcomeScreen({
  navigation,
}: NativeStackScreenProps<RootStackParams, 'Welcome'>) {
  return (
    <Screen style={s.content}>
      <View style={s.spacer} />
      <ResponsiveImage source={require('../../assets/art-1.png')} ratio={1.5} />
      <View style={s.copy}>
        <Typography variant="heading" accessibilityRole="header">
          Welcome to the EMA Study
        </Typography>
        <Typography>
          This study helps us understand how arthritis and daily experiences
          change throughout the day.
        </Typography>
        <Button
          label="Get Started"
          onPress={() => navigation.navigate('Login')}
        />
      </View>
      <View style={s.bottom} />
    </Screen>
  );
}
const s = StyleSheet.create({
  content: { gap: t.space.xxl },
  spacer: { flexGrow: 1, minHeight: t.space.xxl },
  copy: { gap: t.space.xxl },
  bottom: { flexGrow: 0.7, minHeight: t.space.xxl },
});
