import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { CheckInTimePreferences } from '../src/design/CheckInTimePreferences';
import { validCheckInTimes } from '../src/domain/checkInTimes';
import { createMockApi } from '../src/data/mockApi';
import { isParticipant } from '../src/data/decoders';

jest.mock('../src/design/TimeField', () => {
  const { TextInput } = jest.requireActual('react-native');
  return {
    TimeField: ({
      label,
      value,
      disabled,
      onChange,
    }: import('../src/design/TimeField.types').TimeFieldProps) => (
      <TextInput
        accessibilityLabel={label}
        value={value}
        editable={!disabled}
        onChangeText={onChange}
      />
    ),
  };
});

test('rejects malformed and unordered schedule preferences', () => {
  expect(
    validCheckInTimes({
      morning: '24:00',
      afternoon: '13:00',
      evening: '20:00',
    }),
  ).toBe(false);
  expect(
    validCheckInTimes({
      morning: '14:00',
      afternoon: '13:00',
      evening: '20:00',
    }),
  ).toBe(false);
  expect(
    isParticipant({
      id: '1',
      firstName: 'Alex',
      email: 'a@example.com',
      reminders: true,
      checkInTimes: { morning: '08:00', afternoon: '13:00', evening: 'oops' },
    }),
  ).toBe(false);
});
test('saves times through adapter, updates remaining schedule and preserves completed time', async () => {
  const api = createMockApi('normal', 0);
  const { token } = await api.signIn('alex@example.com', 'password1');
  await expect(
    api.setCheckInTimes(token, {
      morning: '25:00',
      afternoon: '13:00',
      evening: '20:00',
    }),
  ).rejects.toMatchObject({ code: 'validation' });
  const times = { morning: '09:00', afternoon: '14:30', evening: '21:00' };
  expect((await api.setCheckInTimes(token, times)).checkInTimes).toEqual(times);
  expect((await api.restoreSession(token)).participant.checkInTimes).toEqual(
    times,
  );
  expect((await api.getStudy(token)).checkIns.map((c) => c.time)).toEqual([
    '8:00 AM',
    '2:30 PM',
    '9:00 PM',
  ]);
});
test('form validates before saving, preserves failed changes and allows cancel', async () => {
  const save = jest.fn().mockRejectedValue(new Error('offline'));
  const screen = render(<CheckInTimePreferences onSave={save} demo />);
  fireEvent.changeText(screen.getByLabelText('Second check-in time'), '07:00');
  fireEvent.press(screen.getByLabelText('Save times'));
  expect(save).not.toHaveBeenCalled();
  expect(screen.getByText(/Choose three different valid times/)).toBeTruthy();
  fireEvent.changeText(screen.getByLabelText('Second check-in time'), '14:30');
  fireEvent.press(screen.getByLabelText('Save times'));
  await waitFor(() =>
    expect(save).toHaveBeenCalledWith({
      morning: '08:00',
      afternoon: '14:30',
      evening: '20:00',
    }),
  );
  await waitFor(() =>
    expect(
      screen.getByText('Something went wrong. Please try again.'),
    ).toBeTruthy(),
  );
  expect(screen.getByLabelText('Second check-in time').props.value).toBe(
    '14:30',
  );
  fireEvent.press(screen.getByLabelText('Cancel'));
  expect(screen.getByLabelText('Second check-in time').props.value).toBe(
    '13:00',
  );
});

test('accepts a night-shift cycle across midnight and rejects duplicate or multi-day times', async () => {
  const times = { morning: '22:00', afternoon: '02:00', evening: '08:00' };
  expect(validCheckInTimes(times)).toBe(true);
  expect(validCheckInTimes({ ...times, afternoon: '22:00' })).toBe(false);
  expect(
    validCheckInTimes({
      morning: '22:00',
      afternoon: '08:00',
      evening: '02:00',
    }),
  ).toBe(false);
  const api = createMockApi('normal', 0);
  const { token } = await api.signIn('alex@example.com', 'password1');
  await api.setCheckInTimes(token, times);
  expect((await api.restoreSession(token)).participant.checkInTimes).toEqual(
    times,
  );
  expect((await api.getStudy(token)).checkIns.map((c) => c.time)).toEqual([
    '8:00 AM',
    '2:00 AM',
    '8:00 AM',
  ]);
});
