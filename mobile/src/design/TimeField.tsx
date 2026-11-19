import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Feather from '@expo/vector-icons/Feather';
import { TimeFieldProps } from './TimeField.types';
import { Button, Typography } from './components';
import { displayCheckInTime } from '../domain/checkInTimes';
import { tokens as t } from './tokens';
export function TimeField({
  label,
  value,
  disabled,
  onChange,
}: TimeFieldProps) {
  const [opened, setOpened] = useState(false);
  const [hour, minute] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(hour ?? 8, minute ?? 0, 0, 0);
  return (
    <View style={{ gap: t.space.sm }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: displayCheckInTime(value) }}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => setOpened(true)}
        style={{
          minHeight: t.size.touch,
          padding: t.space.md,
          borderWidth: 1,
          borderColor: t.color.border,
          borderRadius: t.radius.control,
          flexDirection: 'row',
          alignItems: 'center',
          gap: t.space.sm,
        }}
      >
        <Typography style={{ color: t.color.primary }}>
          {displayCheckInTime(value)}
        </Typography>
        <Feather
          name="clock"
          color={t.color.muted}
          size={16}
          accessible={false}
        />
      </Pressable>
      {opened && !disabled && (
        <>
          <DateTimePicker
            value={date}
            mode="time"
            display={Platform.OS === 'ios' ? 'compact' : 'default'}
            onChange={(event, next) => {
              if (Platform.OS !== 'ios') setOpened(false);
              if (event.type === 'set' && next)
                onChange(
                  `${String(next.getHours()).padStart(2, '0')}:${String(next.getMinutes()).padStart(2, '0')}`,
                );
            }}
          />
          {Platform.OS === 'ios' && (
            <Button
              label="Done"
              variant="text"
              onPress={() => setOpened(false)}
            />
          )}
        </>
      )}
    </View>
  );
}
