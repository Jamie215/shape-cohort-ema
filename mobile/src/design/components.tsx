import React, { forwardRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  useWindowDimensions,
  type ImageSourcePropType,
  type TextProps,
  type TextInputProps,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { tokens as t } from './tokens';
export function ResponsiveImage({
  source,
  ratio,
  label,
}: {
  source: ImageSourcePropType;
  ratio: number;
  label?: string;
}) {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(
    t.size.maxContent,
    Math.max(1, width - t.space.xxl * 2),
  );
  return (
    <Image
      source={source}
      resizeMode="contain"
      style={{ width: '100%', height: contentWidth / ratio }}
      accessible={!!label}
      accessibilityLabel={label}
    />
  );
}

export function Typography({
  variant = 'body',
  style,
  ...props
}: TextProps & { variant?: keyof typeof t.type }) {
  return (
    <Text
      {...props}
      style={[t.type[variant], { color: t.color.text }, style]}
    />
  );
}
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  busy = false,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'text';
  disabled?: boolean;
  busy?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const inactive = disabled || busy;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy }}
      aria-disabled={inactive}
      aria-busy={busy}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        variant === 'primary'
          ? {
              backgroundColor: inactive
                ? t.color.disabled
                : pressed
                  ? t.color.pressed
                  : t.color.primary,
            }
          : {
              backgroundColor:
                variant === 'secondary' ? t.color.tint : 'transparent',
            },
        pressed && variant !== 'primary' && { opacity: 0.7 },
        style,
      ]}
    >
      {busy && (
        <ActivityIndicator
          color={variant === 'primary' ? t.color.surface : t.color.primary}
        />
      )}
      <Typography
        variant="button"
        style={{
          color:
            variant === 'primary' && !inactive
              ? t.color.surface
              : inactive
                ? t.color.muted
                : t.color.primary,
        }}
      >
        {busy ? 'Please wait…' : label}
      </Typography>
    </Pressable>
  );
}
export const Field = forwardRef<
  TextInput,
  TextInputProps & { label: string; error?: string; trailing?: React.ReactNode }
>(function Field({ label, error, trailing, style, ...props }, ref) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={s.fieldGroup}>
      <Typography variant="question">{label}</Typography>
      <View
        style={[
          s.inputShell,
          {
            borderColor: error
              ? t.color.error
              : focused
                ? t.color.focus
                : t.color.border,
            borderWidth: focused ? 2 : 1,
          },
        ]}
      >
        <TextInput
          ref={ref}
          {...props}
          accessibilityLabel={label}
          accessibilityHint={error}
          placeholderTextColor={t.color.muted}
          onFocus={(event) => {
            setFocused(true);
            props.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            props.onBlur?.(event);
          }}
          style={[s.input, style]}
        />
        {trailing}
      </View>
      {error && (
        <Typography
          variant="small"
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={{ color: t.color.error }}
        >
          {error}
        </Typography>
      )}
    </View>
  );
});
export function IconButton({
  name,
  label,
  onPress,
  disabled = false,
}: {
  name: React.ComponentProps<typeof Feather>['name'];
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      accessibilityState={{ disabled }}
      aria-disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.iconButton,
        pressed && { backgroundColor: t.color.tint },
      ]}
    >
      <Feather
        name={name}
        size={t.size.icon}
        color={t.color.primary}
        accessible={false}
      />
    </Pressable>
  );
}
export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[s.card, style]}>{children}</View>;
}
export function Progress({ value, label }: { value: number; label: string }) {
  const percent = Math.max(0, Math.min(1, value));
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(percent * 100) }}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent * 100)}
      style={s.track}
    >
      <View style={[s.fill, { width: `${percent * 100}%` }]} />
    </View>
  );
}
export function Choice({
  label,
  selected,
  onPress,
  grid = false,
  disabled = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  grid?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected, disabled }}
      aria-checked={selected}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.choice,
        grid && s.gridChoice,
        grid &&
          selected && {
            backgroundColor: t.color.tint,
            borderColor: t.color.primary,
          },
        pressed && { backgroundColor: t.color.tint },
      ]}
    >
      {!grid && (
        <View style={[s.radio, selected && { borderColor: t.color.primary }]}>
          {selected && <View style={s.radioDot} />}
        </View>
      )}
      <Typography
        style={[
          grid && { textAlign: 'center' },
          selected && {
            color: t.color.primary,
            fontFamily: t.type.button.fontFamily,
          },
        ]}
      >
        {label}
      </Typography>
    </Pressable>
  );
}
export function Notice({
  message,
  kind = 'error',
}: {
  message: string;
  kind?: 'error' | 'info' | 'success';
}) {
  return (
    <View
      style={[
        s.notice,
        {
          backgroundColor:
            kind === 'error'
              ? t.color.errorTint
              : kind === 'success'
                ? t.color.successTint
                : t.color.page,
        },
      ]}
    >
      <Typography
        variant="small"
        accessibilityRole={kind === 'error' ? 'alert' : undefined}
        accessibilityLiveRegion="polite"
        style={{ color: kind === 'error' ? t.color.error : t.color.muted }}
      >
        {message}
      </Typography>
    </View>
  );
}
export function Screen({
  children,
  footer,
  style,
  top = true,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  top?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={s.screen}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : Platform.OS === 'web'
            ? undefined
            : 'height'
      }
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[
          s.scroll,
          {
            paddingTop: top
              ? Math.max(insets.top, t.space.xxl) + t.space.xxl
              : insets.top,
            paddingBottom: t.space.xl + (footer ? 0 : insets.bottom),
          },
        ]}
      >
        <View style={[s.content, style]}>{children}</View>
      </ScrollView>
      {footer && (
        <View
          style={[
            s.footer,
            {
              paddingBottom: Math.max(
                insets.bottom,
                t.space.xxl * 2 + t.space.lg,
              ),
            },
          ]}
        >
          <View style={s.footerContent}>{footer}</View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
export function ResourceState({
  loading,
  message,
  retry,
}: {
  loading?: boolean;
  message?: string;
  retry?: () => void;
}) {
  return (
    <View style={s.resource}>
      {loading ? (
        <>
          <ActivityIndicator
            size="large"
            color={t.color.primary}
            accessibilityLabel="Loading"
          />
          <Typography>Loading…</Typography>
        </>
      ) : (
        <>
          <Typography accessibilityRole="alert">{message}</Typography>
          {retry && <Button label="Try again" onPress={retry} />}
        </>
      )}
    </View>
  );
}
export const layout = StyleSheet.create({
  section: { gap: t.space.lg },
  stack: { gap: t.space.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: t.space.md },
  grow: { flex: 1 },
  centered: { textAlign: 'center' },
});
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.color.surface },
  scroll: { flexGrow: 1, paddingHorizontal: t.space.xxl },
  content: {
    width: '100%',
    maxWidth: t.size.maxContent,
    alignSelf: 'center',
    flexGrow: 1,
  },
  footer: {
    paddingTop: t.space.lg,
    paddingHorizontal: t.space.xxl,
    backgroundColor: t.color.surface,
  },
  footerContent: {
    width: '100%',
    maxWidth: t.size.maxContent,
    alignSelf: 'center',
  },
  button: {
    minHeight: t.size.touch,
    borderRadius: t.radius.card,
    paddingHorizontal: t.space.lg,
    paddingVertical: t.space.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: t.space.sm,
  },
  iconButton: {
    width: t.size.touch,
    minHeight: t.size.touch,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: t.radius.card,
  },
  fieldGroup: { gap: t.space.sm },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: t.radius.control,
    minHeight: t.size.touch,
    backgroundColor: t.color.surface,
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: t.size.touch,
    paddingHorizontal: t.space.lg,
    paddingVertical: t.space.md,
    ...t.type.body,
    color: t.color.text,
  },
  card: {
    borderWidth: 1,
    borderColor: t.color.border,
    borderRadius: t.radius.card,
    padding: t.space.xl,
  },
  track: {
    height: t.size.progress,
    backgroundColor: t.color.tint,
    borderRadius: t.radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: t.color.primary,
    borderRadius: t.radius.pill,
  },
  choice: {
    minHeight: t.size.touch,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space.md,
    paddingVertical: t.space.sm,
  },
  gridChoice: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: t.space.sm,
    borderWidth: 1,
    borderColor: t.color.border,
    borderRadius: t.radius.control,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: t.color.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: t.color.primary,
  },
  notice: { padding: t.space.md, borderRadius: t.radius.control },
  resource: {
    gap: t.space.xl,
    paddingVertical: t.space.xxl,
    alignItems: 'center',
  },
});
