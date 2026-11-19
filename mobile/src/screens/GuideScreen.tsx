import { StudyVideo } from '../design/StudyVideo';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams } from '../navigation/types';
import { Button, Screen, Typography, layout } from '../design/components';
export function GuideScreen({
  navigation,
}: NativeStackScreenProps<RootStackParams, 'Guide'>) {
  return (
    <Screen
      style={layout.stack}
      footer={
        <Button label="Back to Home" onPress={() => navigation.goBack()} />
      }
    >
      <Typography variant="heading" accessibilityRole="header">
        About the EMA Study
      </Typography>
      <StudyVideo />
      <Typography variant="title">Three check-ins each day</Typography>
      <Typography>
        Complete your first, second, and third check-ins at times that fit your
        routine over seven days. Available check-ins show a Start button on
        Home.
      </Typography>
      <Typography variant="title">Complete your check-in</Typography>
      <Typography>
        Choose an answer to each question, then tap Continue. You can go back to
        change answers before submitting. A confirmation appears when your
        check-in is saved.
      </Typography>
      <Typography variant="title">See your insights</Typography>
      <Typography>
        Your Profile includes reminder preferences and a link to your insights,
        which become available after seven days.
      </Typography>
    </Screen>
  );
}
