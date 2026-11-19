import { ComponentProps } from 'react';
import {
  fireEvent,
  render,
  waitFor,
  act,
  within,
} from '@testing-library/react-native';
import { LoginScreen } from '../src/screens/LoginScreen';
import { QuestionnaireScreen } from '../src/screens/QuestionnaireScreen';
import { demoQuestionnaire } from '../src/data/mockApi';
import { AppError, Receipt } from '../src/domain/models';
import { useApp, useResource } from '../src/application/AppProvider';
jest.mock('../src/application/AppProvider', () => ({
  useApp: jest.fn(),
  useResource: jest.fn(),
}));
jest.mock('@expo/vector-icons/Feather', () => () => null);
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@react-navigation/native', () => ({ usePreventRemove: jest.fn() }));
jest.mock('expo-crypto', () => ({ randomUUID: () => 'test-submission-key' }));
const signIn = jest.fn();
const submit = jest.fn();
const navigation = {
  replace: jest.fn(),
  goBack: jest.fn(),
  dispatch: jest.fn(),
};
const props = {
  navigation,
  route: {
    params: {
      checkIn: {
        id: 'day3-afternoon',
        period: 'afternoon',
        time: '1:00 PM',
        status: 'available',
      },
    },
  },
} as unknown as ComponentProps<typeof QuestionnaireScreen>;
beforeEach(() => {
  jest.mocked(useApp).mockReturnValue({
    api: { submit },
    session: { token: 'demo', participant: { firstName: 'Alex' } },
    demo: true,
    signIn,
    expire: jest.fn(),
  } as unknown as ReturnType<typeof useApp>);
  jest.mocked(useResource).mockReturnValue({
    state: { status: 'ready', data: demoQuestionnaire },
    reload: jest.fn(),
  });
  signIn.mockReset();
  submit.mockReset();
  navigation.replace.mockClear();
});
test('login validates before calling authentication and exposes password visibility', async () => {
  const ui = render(<LoginScreen />);
  fireEvent.press(ui.getByRole('button', { name: 'Sign in' }));
  expect(ui.getByText('Enter a valid email address.')).toBeTruthy();
  expect(signIn).not.toHaveBeenCalled();
  fireEvent.changeText(ui.getByLabelText('Email'), 'alex@example.com');
  fireEvent.changeText(ui.getByLabelText('Password'), 'password1');
  expect(ui.getByLabelText('Password').props.secureTextEntry).toBe(true);
  fireEvent.press(ui.getByRole('button', { name: 'Show password' }));
  expect(ui.getByLabelText('Password').props.secureTextEntry).toBe(false);
  signIn.mockRejectedValueOnce(
    new AppError('auth', 'Email or password is incorrect.'),
  );
  fireEvent.press(ui.getByRole('button', { name: 'Sign in' }));
  await waitFor(() =>
    expect(ui.getByText('Email or password is incorrect.')).toBeTruthy(),
  );
  expect(signIn).toHaveBeenCalledWith('alex@example.com', 'password1');
});
test('questionnaire gates navigation, retains answers on Back, saves once and waits for a receipt', async () => {
  const ui = render(<QuestionnaireScreen {...props} />);
  expect(ui.getByRole('button', { name: 'Continue' })).toBeDisabled();
  fireEvent.press(ui.getByRole('radio', { name: 'Mild pain' }));
  expect(ui.getByRole('button', { name: 'Continue' })).toBeDisabled();
  fireEvent.press(ui.getByRole('radio', { name: 'Hands' }));
  fireEvent.press(ui.getByRole('button', { name: 'Continue' }));
  fireEvent.press(ui.getAllByRole('button', { name: 'Back' })[1]!);
  expect(ui.getByRole('radio', { name: 'Mild pain' })).toBeChecked();
  expect(ui.getByRole('radio', { name: 'Hands' })).toBeChecked();
  fireEvent.press(ui.getByRole('button', { name: 'Continue' }));
  fireEvent.press(ui.getByRole('radio', { name: 'Good' }));
  fireEvent.press(ui.getByRole('radio', { name: 'Walking' }));
  fireEvent.press(ui.getByRole('button', { name: 'Continue' }));
  fireEvent.press(ui.getByRole('radio', { name: 'Good' }));
  fireEvent.press(ui.getByRole('radio', { name: 'A little' }));
  let resolve!: (receipt: Receipt) => void;
  submit.mockReturnValueOnce(
    new Promise<Receipt>((r) => {
      resolve = r;
    }),
  );
  fireEvent.press(ui.getByRole('button', { name: 'Submit check-in' }));
  fireEvent.press(ui.getByRole('button', { name: 'Submit check-in' }));
  expect(submit).toHaveBeenCalledTimes(1);
  expect(navigation.replace).not.toHaveBeenCalled();
  await act(async () => {
    resolve({ id: 'saved', completedAt: '2026-10-06T12:00:00Z' });
  });
  expect(navigation.replace).toHaveBeenCalledWith(
    'Confirmation',
    expect.objectContaining({
      receipt: expect.objectContaining({ id: 'saved' }),
    }),
  );
});
test('failed submission retains answers and the retry idempotency key', async () => {
  const ui = render(<QuestionnaireScreen {...props} />);
  for (const q of demoQuestionnaire.steps) {
    for (const question of q)
      fireEvent.press(
        within(ui.getByLabelText(question.label)).getByRole('radio', {
          name: question.options[0]!,
        }),
      );
    if (q !== demoQuestionnaire.steps.at(-1))
      fireEvent.press(ui.getByRole('button', { name: 'Continue' }));
  }
  submit.mockRejectedValue(
    new AppError('network', 'Unable to save. Please try again.'),
  );
  fireEvent.press(ui.getByRole('button', { name: 'Submit check-in' }));
  await waitFor(() =>
    expect(ui.getByText('Unable to save. Please try again.')).toBeTruthy(),
  );
  expect(ui.getByRole('radio', { name: 'Not at all' })).toBeChecked();
  expect(navigation.replace).not.toHaveBeenCalled();
  fireEvent.press(ui.getByRole('button', { name: 'Submit check-in' }));
  await waitFor(() => expect(submit).toHaveBeenCalledTimes(2));
  expect(submit.mock.calls[0]?.[1].idempotencyKey).toEqual(
    submit.mock.calls[1]?.[1].idempotencyKey,
  );
});
