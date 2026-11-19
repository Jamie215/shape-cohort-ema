import { useRef, useState } from 'react';
import { Keyboard, StyleSheet, TextInput, View } from 'react-native';
import {
  Button,
  Field,
  IconButton,
  Notice,
  Screen,
  Typography,
} from '../design/components';
import { tokens as t } from '../design/tokens';
import { useApp } from '../application/AppProvider';
import { validateLogin } from '../domain/validation';
import { errorMessage } from '../domain/models';
export function LoginScreen() {
  const { signIn, demo, sessionMessage } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string>();
  const passwordRef = useRef<TextInput>(null);
  const pending = useRef(false);
  const errors = validateLogin(email, password);
  async function submit() {
    setTouched(true);
    setError(undefined);
    if (errors.email || errors.password || pending.current) return;
    pending.current = true;
    setBusy(true);
    Keyboard.dismiss();
    try {
      await signIn(email, password);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <Screen style={s.content}>
      <Typography variant="heading" accessibilityRole="header">
        Sign in
      </Typography>
      <Typography>Enter your email and password to log in</Typography>
      <View style={s.fields}>
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="test@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          editable={!busy}
          error={touched ? errors.email : undefined}
        />
        <Field
          ref={passwordRef}
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={() => void submit()}
          editable={!busy}
          error={touched ? errors.password : undefined}
          trailing={
            <IconButton
              name={visible ? 'eye-off' : 'eye'}
              label={visible ? 'Hide password' : 'Show password'}
              onPress={() => setVisible((v) => !v)}
              disabled={busy}
            />
          }
        />
      </View>
      {sessionMessage && <Notice message={sessionMessage} kind="info" />}
      {error && <Notice message={error} />}
      <Button label="Sign in" onPress={() => void submit()} busy={busy} />
      {demo && (
        <Notice
          kind="info"
          message="Demo: use any valid email and a password of 8 or more characters. No real account is created."
        />
      )}
    </Screen>
  );
}
const s = StyleSheet.create({
  content: { gap: t.space.xxl, paddingTop: t.space.xxl },
  fields: { gap: t.space.xl },
});
